using GasSupplySystem.Models;
using GasSupplySystem.Services;

namespace GasSupplySystem.Forms
{
    public partial class OrdersForm : Form
    {
        DataGridView grid = new DataGridView { Dock = DockStyle.Top, Height = 200 };
        Button btnAdd = new Button { Text = "Add Order", Dock = DockStyle.Bottom };
        User _user;

        public OrdersForm(User user)
        {
            _user = user;
            Text = "Orders";
            Controls.Add(grid);
            Controls.Add(btnAdd);

            Load += (s, e) => grid.DataSource = OrderService.GetAll();

            btnAdd.Click += (s, e) =>
            {
                if (DateTime.Now.Hour < 9 || DateTime.Now.Hour > 18)
                {
                    MessageBox.Show("Orders allowed only 09–18");
                    return;
                }

                OrderService.Add(new GasOrder
                {
                    CustomerId = 1,
                    GasVolume = 1000,
                    DeliveryDate = DateTime.Now.AddDays(3)
                }, _user.UserId);

                grid.DataSource = OrderService.GetAll();
            };
        }
    }
}
