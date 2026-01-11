using GasSupplySystem.Models;
using GasSupplySystem.Services;
using OxyPlot;
using OxyPlot.Series;
using OxyPlot.Axes;
using OxyPlot.WindowsForms;

namespace GasSupplySystem.Forms
{
    public partial class MainForm : Form
    {
        private User _user;
        private PlotView plotView;
        private PlotModel plotModel;

        TabControl tabs = new TabControl();

        // TAB 1
        DataGridView dgvOrders = new DataGridView();

        ComboBox cmbCustomer = new ComboBox();
        Button btnBuildReport = new Button();
        Button btnSaveReport = new Button();

        // TAB 3 (ADMIN)
        DataGridView dgvCustomers = new DataGridView();

        public MainForm(User user)
        {
            _user = user;
            Text = "Система обліку поставок газу";
            WindowState = FormWindowState.Maximized;

            tabs.Dock = DockStyle.Fill;
            Controls.Add(tabs);

            CreateOrdersTab();
            CreateReportsTab();
            CreateAdminTab();

            if (_user.Role != "Admin")
                tabs.TabPages.RemoveAt(2);
        }

        private void CreateOrdersTab()
        {
            var tab = new TabPage("Замовлення");

            Panel panel = new Panel { Dock = DockStyle.Top, Height = 80 };
            Button btnAdd = new Button { Text = "Додати", Left = 10, Top = 10 };
            Button btnDelete = new Button { Text = "Видалити", Left = 100, Top = 10 };
            Button btnRefresh = new Button { Text = "Оновити", Left = 200, Top = 10 };

            btnAdd.Click += AddOrder;
            btnRefresh.Click += (s, e) => LoadOrders();

            panel.Controls.AddRange(new Control[] { btnAdd, btnDelete, btnRefresh });

            dgvOrders.Dock = DockStyle.Fill;
            dgvOrders.ReadOnly = true;
            dgvOrders.SelectionMode = DataGridViewSelectionMode.FullRowSelect;

            tab.Controls.Add(dgvOrders);
            tab.Controls.Add(panel);

            tabs.TabPages.Add(tab);
            LoadOrders();
        }

        private void AddOrder(object sender, EventArgs e)
        {
            if (DateTime.Now.Hour < 9 || DateTime.Now.Hour > 18)
            {
                MessageBox.Show(
                    "Оформлення замовлень дозволено лише з 09:00 до 18:00",
                    "Обмеження часу",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
                return;
            }

            using var form = new AddOrderForm(_user);
            if (form.ShowDialog() == DialogResult.OK)
            {
                LoadOrders();
            }
        }

        private void LoadOrders()
        {
            dgvOrders.DataSource = OrderService.GetAll();
        }

        private void CreateReportsTab()
        {
            var tab = new TabPage("Звіти");

            Panel panel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 80
            };

            cmbCustomer.SetBounds(10, 35, 200, 22);

            btnBuildReport.Text = "Побудувати";
            btnBuildReport.SetBounds(220, 35, 120, 25);

            btnSaveReport.Text = "Зберегти";
            btnSaveReport.SetBounds(350, 35, 120, 25);

            panel.Controls.Add(new Label
            {
                Text = "Замовник:",
                Left = 10,
                Top = 10
            });

            panel.Controls.AddRange(new Control[]
            {
        cmbCustomer, btnBuildReport, btnSaveReport
            });

            // === OxyPlot setup ===
            plotView = new PlotView
            {
                Dock = DockStyle.Fill
            };

            plotModel = new PlotModel
            {
                Title = "Динаміка замовлень газу"
            };

            plotModel.Axes.Add(new DateTimeAxis
            {
                Position = AxisPosition.Bottom,
                Title = "Дата",
                StringFormat = "dd.MM"
            });

            plotModel.Axes.Add(new LinearAxis
            {
                Position = AxisPosition.Left,
                Title = "Обсяг газу"
            });

            plotView.Model = plotModel;

            btnBuildReport.Click += BuildReport;
            btnSaveReport.Click += SaveReport;

            tab.Controls.Add(plotView);
            tab.Controls.Add(panel);

            tabs.TabPages.Add(tab);

            cmbCustomer.DataSource = CustomerService.GetAll();
            cmbCustomer.DisplayMember = "CompanyName";
            cmbCustomer.ValueMember = "CustomerId";
        }

        private void BuildReport(object sender, EventArgs e)
        {
            plotModel.Series.Clear();

            int customerId = (int)cmbCustomer.SelectedValue;
            var data = ReportService.GetCustomerDynamics(customerId);

            var series = new LineSeries
            {
                Title = "Обсяг газу",
                MarkerType = MarkerType.Circle
            };

            foreach (var item in data)
            {
                series.Points.Add(
                    new DataPoint(
                        DateTimeAxis.ToDouble(item.Date),
                        (double)item.Volume
                    )
                );
            }

            plotModel.Series.Add(series);
            plotModel.InvalidatePlot(true);
        }

        private void SaveReport(object sender, EventArgs e)
        {
            using SaveFileDialog dlg = new SaveFileDialog
            {
                Filter = "PNG Image|*.png"
            };

            if (dlg.ShowDialog() == DialogResult.OK)
            {
                PngExporter.Export(
                    plotModel,
                    dlg.FileName,
                    800,
                    600
                );
            }
        }

        private void CreateAdminTab()
        {
            var tab = new TabPage("Адміністрування");

            dgvCustomers.Dock = DockStyle.Fill;
            dgvCustomers.DataSource = CustomerService.GetAll();

            tab.Controls.Add(dgvCustomers);
            tabs.TabPages.Add(tab);
        }
    }
}
