using GasSupplySystem.Services;

namespace GasSupplySystem.Forms;

public partial class LogsForm : Form
{
    public LogsForm()
    {
        Text = "Action Log";
        var grid = new DataGridView { Dock = DockStyle.Fill };
        Controls.Add(grid);
        Load += (s, e) => grid.DataSource = LogService.GetAll();
    }
}
