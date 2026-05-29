using GasSupplySystem.Services;

namespace GasSupplySystem.Forms
{
    public partial class LoginForm : Form
    {
        TextBox txtLogin = new TextBox();
        TextBox txtPassword = new TextBox();
        Button btnLogin = new Button();
        Button btnExit = new Button();

        public LoginForm()
        {
            Text = "Авторизація";
            Width = 320;
            Height = 180;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            StartPosition = FormStartPosition.CenterScreen;

            Label lblLogin = new Label { Text = "Логін", Left = 20, Top = 30, Width = 40 };
            Label lblPass = new Label { Text = "Пароль", Left = 20, Top = 60, Width = 60 };

            txtLogin.SetBounds(90, 27, 170, 20);
            txtPassword.SetBounds(90, 57, 170, 20);
            txtPassword.PasswordChar = '*';

            btnLogin.Text = "Вхід";
            btnLogin.SetBounds(90, 95, 75, 23);

            btnExit.Text = "Вихід";
            btnExit.SetBounds(185, 95, 75, 23);

            btnExit.Click += (s, e) => Close();

            btnLogin.Click += (s, e) =>
            {
                var user = AuthService.Login(txtLogin.Text, txtPassword.Text);
                if (user == null)
                {
                    MessageBox.Show("Невірний логін або пароль");
                    return;
                }

                new MainForm(user).Show();
                Hide();
            };

            Controls.AddRange(new Control[]
            {
            lblLogin, txtLogin,
            lblPass, txtPassword,
            btnLogin, btnExit
            });
        }
    }
}
