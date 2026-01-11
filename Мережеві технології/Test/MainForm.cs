using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Forms.DataVisualization.Charting;

namespace DairySupplySystem
{
    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
        }

        // --- ЗАВАНТАЖЕННЯ ---
        private void MainForm_Load(object sender, EventArgs e)
        {
            if (Database.CurrentRole != "Admin")
            {
                btnEdit.Enabled = false;
                btnDelete.Enabled = false;
                if (tabControl1.TabPages.ContainsKey("tabAdmin"))
                    tabControl1.TabPages.RemoveByKey("tabAdmin");
            }
            else
            {
                LoadAllCustomers();
                LoadAllProducts();
            }
            LoadData();
            LoadCustomersForReport();
        }

        // --- ОСНОВНА ТАБЛИЦЯ ЗАМОВЛЕНЬ ---
        private void LoadData()
        {
            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    string sql = @"SELECT o.OrderID, c.Name AS 'Заказчик', p.ProductName AS 'Продукт', 
                                   o.Quantity AS 'Количество', o.TotalCost AS 'Сумма (грн)', o.OrderDate AS 'Дата заказа'
                                   FROM Orders o JOIN Customers c ON o.CustomerID = c.CustomerID
                                   JOIN Products p ON o.ProductID = p.ProductID";
                    SqlDataAdapter adapter = new SqlDataAdapter(sql, conn);
                    DataTable table = new DataTable();
                    adapter.Fill(table);
                    dgvOrders.DataSource = table;
                }
                catch (Exception ex) { MessageBox.Show("Error: " + ex.Message); }
            }
        }

        // =========================================================
        // === ЛОГІКА АДМІНА: КЛІЄНТИ (Додавання + Редагування) ===
        // =========================================================

        private void LoadAllCustomers()
        {
            if (Database.CurrentRole != "Admin") return;
            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    SqlDataAdapter da = new SqlDataAdapter("SELECT CustomerID, Name, Address, Phone FROM Customers", conn);
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    if (dgvCustomersList != null) dgvCustomersList.DataSource = dt;
                }
                catch { }
            }
        }

        private void btnAddNewCustomer_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtNewCustName.Text)) return;
            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    string sql = "INSERT INTO Customers (Name, Address, Phone) VALUES (@name, @addr, @phone)";
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@name", txtNewCustName.Text);
                    cmd.Parameters.AddWithValue("@addr", txtNewCustAddress.Text);
                    cmd.Parameters.AddWithValue("@phone", txtNewCustPhone.Text);
                    cmd.ExecuteNonQuery();

                    Database.LogAction($"Створено клієнта: {txtNewCustName.Text}", "Create");
                    MessageBox.Show("Додано!");
                    LoadAllCustomers(); LoadCustomersForReport();
                    txtNewCustName.Clear(); txtNewCustAddress.Clear(); txtNewCustPhone.Clear();
                }
                catch (Exception ex) { MessageBox.Show("Помилка: " + ex.Message); }
            }
        }

        // ПОДІЯ: Клік по таблиці клієнтів (Заповнює поля редагування)
        private void dgvCustomersList_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow row = dgvCustomersList.Rows[e.RowIndex];
                // Заповнюємо поля справа даними з виділеного рядка
                txtEditCustID.Text = row.Cells["CustomerID"].Value.ToString();
                txtEditCustName.Text = row.Cells["Name"].Value.ToString();
                // Перевіряємо на null, бо адреса/телефон можуть бути пустими
                txtEditCustAddress.Text = row.Cells["Address"].Value != DBNull.Value ? row.Cells["Address"].Value.ToString() : "";
                txtEditCustPhone.Text = row.Cells["Phone"].Value != DBNull.Value ? row.Cells["Phone"].Value.ToString() : "";
            }
        }

        // КНОПКА: Зберегти зміни клієнта
        private void btnEditCustomer_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtEditCustID.Text)) { MessageBox.Show("Оберіть клієнта з таблиці!"); return; }

            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    string sql = "UPDATE Customers SET Name=@n, Address=@a, Phone=@p WHERE CustomerID=@id";
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@n", txtEditCustName.Text);
                    cmd.Parameters.AddWithValue("@a", txtEditCustAddress.Text);
                    cmd.Parameters.AddWithValue("@p", txtEditCustPhone.Text);
                    cmd.Parameters.AddWithValue("@id", txtEditCustID.Text);
                    cmd.ExecuteNonQuery();

                    Database.LogAction($"Оновлено клієнта ID: {txtEditCustID.Text}", "Update");
                    MessageBox.Show("Зміни збережено!");

                    LoadAllCustomers();       // Оновлюємо таблицю адміна
                    LoadCustomersForReport(); // Оновлюємо випадаючі списки
                    LoadData();               // Оновлюємо головну таблицю (раптом змінилася назва)
                }
                catch (Exception ex) { MessageBox.Show("Помилка: " + ex.Message); }
            }
        }


        // =========================================================
        // === ЛОГІКА АДМІНА: ПРОДУКТИ (Додавання + Редагування) ===
        // =========================================================

        private void LoadAllProducts()
        {
            if (Database.CurrentRole != "Admin") return;
            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    SqlDataAdapter da = new SqlDataAdapter("SELECT ProductID, ProductName, Price, Unit FROM Products", conn);
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    if (dgvProductsList != null) dgvProductsList.DataSource = dt;
                }
                catch { }
            }
        }

        private void btnAddNewProduct_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtNewProdName.Text)) return;
            decimal price = 0;
            if (!decimal.TryParse(txtNewProdPrice.Text.Replace(".", ","), out price)) { MessageBox.Show("Ціна має бути числом!"); return; }

            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    string sql = "INSERT INTO Products (ProductName, Price, Unit) VALUES (@name, @price, @unit)";
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@name", txtNewProdName.Text);
                    cmd.Parameters.AddWithValue("@price", price);
                    cmd.Parameters.AddWithValue("@unit", txtNewProdUnit.Text);
                    cmd.ExecuteNonQuery();

                    Database.LogAction($"Створено продукт: {txtNewProdName.Text}", "Create");
                    MessageBox.Show("Додано!");
                    LoadAllProducts();
                    txtNewProdName.Clear(); txtNewProdPrice.Clear(); txtNewProdUnit.Clear();
                }
                catch (Exception ex) { MessageBox.Show("Помилка: " + ex.Message); }
            }
        }

        // ПОДІЯ: Клік по таблиці продуктів (Заповнює поля редагування)
        private void dgvProductsList_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow row = dgvProductsList.Rows[e.RowIndex];
                txtEditProdID.Text = row.Cells["ProductID"].Value.ToString();
                txtEditProdName.Text = row.Cells["ProductName"].Value.ToString();
                txtEditProdPrice.Text = row.Cells["Price"].Value.ToString();
                txtEditProdUnit.Text = row.Cells["Unit"].Value.ToString();
            }
        }

        // КНОПКА: Зберегти зміни продукту
        private void btnEditProduct_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtEditProdID.Text)) { MessageBox.Show("Оберіть продукт з таблиці!"); return; }
            decimal price = 0;
            if (!decimal.TryParse(txtEditProdPrice.Text.Replace(".", ","), out price)) { MessageBox.Show("Ціна має бути числом!"); return; }

            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    string sql = "UPDATE Products SET ProductName=@n, Price=@p, Unit=@u WHERE ProductID=@id";
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@n", txtEditProdName.Text);
                    cmd.Parameters.AddWithValue("@p", price);
                    cmd.Parameters.AddWithValue("@u", txtEditProdUnit.Text);
                    cmd.Parameters.AddWithValue("@id", txtEditProdID.Text);
                    cmd.ExecuteNonQuery();

                    Database.LogAction($"Оновлено продукт ID: {txtEditProdID.Text}", "Update");
                    MessageBox.Show("Зміни збережено!");

                    LoadAllProducts(); // Оновлюємо таблицю продуктів
                    LoadData();        // Оновлюємо головну таблицю
                }
                catch (Exception ex) { MessageBox.Show("Помилка: " + ex.Message); }
            }
        }

        // =========================================================
        // --- ІНШЕ (Пошук, Кнопки головної форми, Звіти) ---
        // =========================================================

        private void UpdateFilter(object sender, EventArgs e)
        {
            if (dgvOrders.DataSource is DataTable dt)
            {
                string cust = txtSearchCustomer.Text.Trim();
                string prod = txtSearchProduct.Text.Trim();
                dt.DefaultView.RowFilter = $"[Заказчик] LIKE '%{cust}%' AND [Продукт] LIKE '%{prod}%'";
            }
        }

        private void btnRefresh_Click(object sender, EventArgs e) => LoadData();

        private void btnAdd_Click(object sender, EventArgs e)
        {
            OrderEditForm f = new OrderEditForm(0);
            f.ShowDialog();
            LoadData();
        }

        private void btnEdit_Click(object sender, EventArgs e)
        {
            if (dgvOrders.SelectedRows.Count > 0)
            {
                int id = Convert.ToInt32(dgvOrders.SelectedRows[0].Cells["OrderID"].Value);
                OrderEditForm f = new OrderEditForm(id);
                f.ShowDialog();
                LoadData();
            }
            else MessageBox.Show("Оберіть рядок!");
        }

        private void btnDelete_Click(object sender, EventArgs e)
        {
            if (dgvOrders.SelectedRows.Count == 0) return;
            if (MessageBox.Show("Видалити?", "Увага", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                int id = Convert.ToInt32(dgvOrders.SelectedRows[0].Cells["OrderID"].Value);
                using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
                {
                    conn.Open();
                    SqlTransaction transaction = conn.BeginTransaction(IsolationLevel.Serializable);
                    try
                    {
                        string sql = "DELETE FROM Orders WITH (NOWAIT) WHERE OrderID = @id";
                        SqlCommand cmd = new SqlCommand(sql, conn, transaction);
                        cmd.Parameters.AddWithValue("@id", id);
                        cmd.ExecuteNonQuery();
                        transaction.Commit();
                        Database.LogAction($"Видалено замовлення ID: {id}", "Delete");
                        LoadData();
                    }
                    catch (SqlException ex) { transaction.Rollback(); if (ex.Number == 1222) MessageBox.Show("Заблоковано!"); else MessageBox.Show(ex.Message); }
                    catch (Exception ex) { transaction.Rollback(); MessageBox.Show(ex.Message); }
                }
            }
        }

        private void btnSaveOrderToFile_Click(object sender, EventArgs e)
        {
            if (dgvOrders.SelectedRows.Count == 0) { MessageBox.Show("Оберіть замовлення!"); return; }
            var row = dgvOrders.SelectedRows[0];
            string content = $"ЗАМОВЛЕННЯ #{row.Cells["OrderID"].Value}\nКлієнт: {row.Cells["Заказчик"].Value}\nСума: {row.Cells["Сумма (грн)"].Value}";
            using (SaveFileDialog sfd = new SaveFileDialog()) { sfd.Filter = "Text|*.txt"; if (sfd.ShowDialog() == DialogResult.OK) File.WriteAllText(sfd.FileName, content); }
        }

        // --- ЗВІТИ (Скорочено для економії місця, логіка та сама) ---
        private void LoadCustomersForReport()
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
                {
                    conn.Open();
                    SqlDataAdapter da = new SqlDataAdapter("SELECT CustomerID, Name FROM Customers", conn);
                    DataTable dt = new DataTable(); da.Fill(dt);
                    if (cmbReportCustomer != null)
                    {
                        cmbReportCustomer.DataSource = dt; cmbReportCustomer.DisplayMember = "Name"; cmbReportCustomer.ValueMember = "CustomerID";
                    }
                }
            }
            catch { }
        }

        private void btnBuildReport_Click(object sender, EventArgs e)
        {
            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    string sql = chkGeneralStat.Checked ?
                        @"SELECT CAST(OrderDate AS DATE) as DayDate, SUM(TotalCost) as DaySum FROM Orders GROUP BY CAST(OrderDate AS DATE)" :
                        @"SELECT CAST(OrderDate AS DATE) as DayDate, SUM(TotalCost) as DaySum FROM Orders WHERE CustomerID = @cid GROUP BY CAST(OrderDate AS DATE)";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    if (!chkGeneralStat.Checked && cmbReportCustomer.SelectedValue != null)
                        cmd.Parameters.AddWithValue("@cid", (int)cmbReportCustomer.SelectedValue);

                    SqlDataReader r = cmd.ExecuteReader();
                    chartReport.Series.Clear(); Series s = new Series("Сума") { ChartType = SeriesChartType.Column, IsValueShownAsLabel = true };
                    chartReport.Series.Add(s);
                    while (r.Read()) s.Points.AddXY(Convert.ToDateTime(r["DayDate"]).ToShortDateString(), r["DaySum"]);
                }
                catch { }
            }
        }

        private void btnSaveReport_Click(object sender, EventArgs e)
        {
            if (chartReport.Series.Count > 0)
            {
                using (SaveFileDialog sfd = new SaveFileDialog()) { sfd.Filter = "PNG|*.png"; if (sfd.ShowDialog() == DialogResult.OK) chartReport.SaveImage(sfd.FileName, ChartImageFormat.Png); }
            }
        }

        private void btnStats_Click(object sender, EventArgs e)
        {
            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();
                    string msg = "Всього: " + new SqlCommand("SELECT COUNT(*) FROM Orders", conn).ExecuteScalar() + "\n";
                    msg += "Дохід: " + new SqlCommand("SELECT ISNULL(SUM(TotalCost), 0) FROM Orders", conn).ExecuteScalar();
                    MessageBox.Show(msg);
                }
                catch { }
            }
        }
    }
}