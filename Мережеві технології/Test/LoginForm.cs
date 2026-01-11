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
    public partial class LoginForm : Form
    {
        public LoginForm()
        {
            InitializeComponent();
        }

        private void btnExit_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private void btnLogin_Click(object sender, EventArgs e)
        {
            using (SqlConnection conn = new SqlConnection(Database.ConnectionString))
            {
                try
                {
                    conn.Open();

                    // Используем параметры для защиты от взлома и ошибок с кавычками
                    string sql = "SELECT UserID, Role FROM Users WHERE Login=@login AND Password=@pass";
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@login", txtLogin.Text);
                    cmd.Parameters.AddWithValue("@pass", txtPassword.Text);

                    SqlDataReader reader = cmd.ExecuteReader();

                    if (reader.Read())
                    {
                        // 1. Сохраняем данные пользователя в глобальные переменные
                        Database.CurrentUserId = (int)reader["UserID"];
                        Database.CurrentRole = reader["Role"].ToString();

                        // --- ВАЖНО: Сохраняем логин, чтобы работал журнал событий в других окнах ---
                        Database.CurrentUser = txtLogin.Text;

                        reader.Close();

                        // 2. Записываем факт входа в журнал (используя наш общий метод)
                        Database.LogAction("Вхід у систему", "Login");

                        // 3. Открываем главную форму
                        this.Hide();
                        new MainForm().ShowDialog();
                        this.Close();
                    }
                    else
                    {
                        MessageBox.Show("Невірний логін або пароль!");
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Ошибка подключения: " + ex.Message);
                }
            }
        }
    }
}