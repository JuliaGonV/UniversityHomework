using GasSupplySystem.Services;

namespace GasSupplySystem.Forms
{
    public partial class CustomersForm : Form
    {
        public CustomersForm()
        {
            Text = "Customers";
            var grid = new DataGridView { Dock = DockStyle.Fill };
            Controls.Add(grid);
            Load += (s, e) => grid.DataSource = CustomerService.GetAll();
        }
    }
}
