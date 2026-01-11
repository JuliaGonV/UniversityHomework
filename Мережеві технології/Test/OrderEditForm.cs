using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace DairySupplySystem
{
    public partial class OrderEditForm : Form
    {
        private int _orderId;
        private SqlConnection _conn;
        private SqlTransaction _transaction;
        private bool _isSaved = false;

        // Конструктор принимает ID заказа (0 = новый, >0 = редактирование)
        public OrderEditForm(int id)
        {
            InitializeComponent();
            _orderId = id;
        }

        // --- ЗАГРУЗКА ФОРМЫ ---
        private void OrderEditForm_Load(object sender, EventArgs e)
        {
            try
            {
                _conn = new SqlConnection(Database.ConnectionString);
                _conn.Open();

                if (_orderId > 0)
                {
                    // РЕЖИМ РЕДАКТИРОВАНИЯ
                    // Начинаем транзакцию
                    _transaction = _conn.BeginTransaction();

                    // Пытаемся загрузить данные с блокировкой NOWAIT
                    LoadOrderData();

                    // Если код дошел сюда, значит запись свободна и мы её заблокировали
                    lblStatus.Text = "ЗАПИСЬ ЗАБЛОКИРОВАНА";
                    lblStatus.ForeColor = System.Drawing.Color.Red;
                }
                else
                {
                    // РЕЖИМ СОЗДАНИЯ
                    lblStatus.Text = "Создание нового заказа";
                    lblStatus.ForeColor = System.Drawing.Color.Green;
                    LoadDictionaries();
                }
            }
            catch (SqlException ex)
            {
                // Ошибка 1222 = Запись занята (NOWAIT)
                if (ex.Number == 1222)
                {
                    MessageBox.Show("Цей запис зараз редагується іншим користувачем!\nСпробуйте пізніше.",
                                    "Доступ заборонено", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
                else
                {
                    MessageBox.Show("Помилка бази даних: " + ex.Message);
                }
                this.Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Помилка: " + ex.Message);
                this.Close();
            }
        }

        // Загрузка списков Клиентов и Продуктов
        private void LoadDictionaries()
        {
            SqlCommand cmdCust = new SqlCommand("SELECT CustomerID, Name FROM Customers", _conn, _transaction);
            DataTable dtCust = new DataTable();
            new SqlDataAdapter(cmdCust).Fill(dtCust);

            cmbCustomer.DataSource = dtCust;
            cmbCustomer.DisplayMember = "Name";
            cmbCustomer.ValueMember = "CustomerID";

            SqlCommand cmdProd = new SqlCommand("SELECT ProductID, ProductName, Price FROM Products", _conn, _transaction);
            DataTable dtProd = new DataTable();
            new SqlDataAdapter(cmdProd).Fill(dtProd);

            cmbProduct.DataSource = dtProd;
            cmbProduct.DisplayMember = "ProductName";
            cmbProduct.ValueMember = "ProductID";

            cmbProduct.SelectedIndexChanged += RecalculatePrice;
            numQuantity.ValueChanged += RecalculatePrice;
        }

        // Загрузка данных заказа с "Жесткой" блокировкой
        private void LoadOrderData()
        {
            LoadDictionaries();

            string sql = @"SELECT CustomerID, ProductID, Quantity 
                           FROM Orders WITH (UPDLOCK, NOWAIT) 
                           WHERE OrderID = @id";

            SqlCommand cmd = new SqlCommand(sql, _conn, _transaction);
            cmd.Parameters.AddWithValue("@id", _orderId);

            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    cmbCustomer.SelectedValue = reader["CustomerID"];
                    cmbProduct.SelectedValue = reader["ProductID"];
                    numQuantity.Value = Convert.ToDecimal(reader["Quantity"]);
                }
            }
        }

        // Пересчет цены
        private void RecalculatePrice(object sender, EventArgs e)
        {
            if (cmbProduct.SelectedItem == null) return;
            try
            {
                DataRowView row = (DataRowView)cmbProduct.SelectedItem;
                decimal price = Convert.ToDecimal(row["Price"]);
                decimal quantity = numQuantity.Value;
                txtTotal.Text = (price * quantity).ToString("F2");
            }
            catch { }
        }

        // Кнопка СОХРАНИТЬ
        private void btnSave_Click(object sender, EventArgs e)
        {
            if (cmbCustomer.SelectedItem == null || cmbProduct.SelectedItem == null)
            {
                MessageBox.Show("Будь ласка, оберіть клієнта та продукт!");
                return;
            }

            try
            {
                string sql;
                if (_orderId > 0)
                    sql = "UPDATE Orders SET CustomerID=@cid, ProductID=@pid, Quantity=@q, TotalCost=@cost WHERE OrderID=@id";
                else
                    sql = "INSERT INTO Orders (CustomerID, ProductID, Quantity, TotalCost) VALUES (@cid, @pid, @q, @cost)";

                SqlCommand cmd = new SqlCommand(sql, _conn, _transaction);
                cmd.Parameters.AddWithValue("@cid", cmbCustomer.SelectedValue);
                cmd.Parameters.AddWithValue("@pid", cmbProduct.SelectedValue);
                cmd.Parameters.AddWithValue("@q", numQuantity.Value);
                cmd.Parameters.AddWithValue("@cost", Convert.ToDecimal(txtTotal.Text.Replace(".", ",")));

                if (_orderId > 0) cmd.Parameters.AddWithValue("@id", _orderId);

                cmd.ExecuteNonQuery();

                // Фиксируем транзакцию
                if (_transaction != null)
                {
                    _transaction.Commit();
                    _transaction.Dispose();
                    _transaction = null;
                }

                // --- НОВОЕ: ЛОГИРОВАНИЕ ДЕЙСТВИЯ ---
                // После успешного сохранения пишем в журнал
                if (_orderId > 0)
                    Database.LogAction($"Відредаговано замовлення ID: {_orderId}", "Update");
                else
                    Database.LogAction("Створено нове замовлення", "Create");
                // ------------------------------------

                _isSaved = true;
                MessageBox.Show("Успішно збережено!");
                this.Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Помилка збереження: " + ex.Message);
            }
        }

        // Кнопка ОТМЕНА
        private void btnCancel_Click(object sender, EventArgs e)
        {
            if (_transaction != null)
            {
                try
                {
                    _transaction.Rollback();
                    _transaction.Dispose();
                    _transaction = null;
                }
                catch { }
            }
            this.Close();
        }

        // При закрытии формы
        private void OrderEditForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (_transaction != null)
            {
                try
                {
                    _transaction.Rollback();
                    _transaction.Dispose();
                }
                catch { }
                _transaction = null;
            }

            if (_conn != null)
            {
                if (_conn.State == ConnectionState.Open) _conn.Close();
                _conn.Dispose();
            }
        }
    }
}