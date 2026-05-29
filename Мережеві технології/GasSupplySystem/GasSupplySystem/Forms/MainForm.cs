using GasSupplySystem.Models;
using GasSupplySystem.Services;
using OxyPlot;
using OxyPlot.Axes;
using OxyPlot.Series;
using OxyPlot.WindowsForms;
using System.Data;

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
            CreateOrderQueryTab();

            if (_user.Role == "Admin")
            {
                CreateReportsTab();
                //CreateAdminTab();
            }
        }

        private void CreateOrdersTab()
        {
            var tab = new TabPage("Замовлення");

            Panel panel = new Panel { Dock = DockStyle.Top, Height = 80 };

            Button btnAdd = new Button { Text = "Додати", Left = 10, Top = 10 };
            Button btnEdit = new Button { Text = "Редагувати", Left = 100, Top = 10 };
            Button btnDelete = new Button { Text = "Видалити", Left = 220, Top = 10 };
            Button btnRefresh = new Button { Text = "Оновити", Left = 340, Top = 10 };

            btnAdd.Click += AddOrder;
            btnEdit.Click += EditOrder;
            btnDelete.Click += DeleteOrder;
            btnRefresh.Click += (s, e) => LoadOrders();

            if (_user.Role != "Admin")
            {
                btnEdit.Enabled = false;
                btnDelete.Enabled = false;
            }

            panel.Controls.AddRange(new Control[]
            {
        btnAdd, btnEdit, btnDelete, btnRefresh
            });

            dgvOrders.Dock = DockStyle.Fill;
            dgvOrders.ReadOnly = true;
            dgvOrders.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dgvOrders.MultiSelect = false;
            dgvOrders.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;

            tab.Controls.Add(dgvOrders);
            tab.Controls.Add(panel);

            tabs.TabPages.Add(tab);
            LoadOrders();
        }

        private void EditOrder(object sender, EventArgs e)
        {
            if (dgvOrders.SelectedRows.Count == 0)
            {
                MessageBox.Show("Оберіть замовлення для редагування");
                return;
            }

            var cells = dgvOrders.SelectedRows[0].Cells;
            int orderId = (int)cells["OrderId"].Value;

            GasOrder order = new GasOrder()
            {
                OrderId = orderId,
                CustomerName = cells["CustomerName"].Value.ToString()!,
                DeliveryDate = (DateTime)cells["DeliveryDate"].Value,
                GasVolume = (decimal)cells["GasVolume"].Value
            };

            using var form = new EditOrderForm(orderId, _user, order);
            if (form.ShowDialog() == DialogResult.OK)
            {
                LoadOrders();
            }
        }

        private void DeleteOrder(object sender, EventArgs e)
        {
            if (_user.Role != "Admin")
            {
                MessageBox.Show(
                    "Видалення дозволене лише адміністратору",
                    "Доступ заборонено",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
                return;
            }

            if (dgvOrders.SelectedRows.Count == 0)
            {
                MessageBox.Show("Оберіть замовлення для видалення");
                return;
            }

            int orderId = (int)dgvOrders.SelectedRows[0].Cells["OrderId"].Value;

            var confirm = MessageBox.Show(
                $"Ви дійсно бажаєте видалити замовлення #{orderId}?",
                "Підтвердження",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question);

            if (confirm != DialogResult.Yes)
                return;

            OrderService.Delete(orderId, _user.UserId);
            LoadOrders();
        }

        private DataGridView dgvOrderQuery = new();
        private CustomerService customerService = new();
        private OrderQueryService orderQueryService = new();

        private void CreateOrderQueryTab()
        {
            var tab = new TabPage("Пошук замовлень");

            Panel panel = new Panel { Dock = DockStyle.Top, Height = 100 };

            // --- COMPANY COMBOBOX ---
            Label lblCompany = new Label { Text = "Компанія", Left = 10, Top = 10 };
            ComboBox cmbCompany = new ComboBox
            {
                Left = 10,
                Top = 45,
                Width = 180,
                DropDownStyle = ComboBoxStyle.DropDownList
            };

            cmbCompany.Items.Add(""); // All companies
            foreach (var name in CustomerService.GetCompanyNames())
                cmbCompany.Items.Add(name);

            cmbCompany.SelectedIndex = 0;

            // --- DATES ---
            Label lblFrom = new Label { Text = "Дата з", Left = 350, Top = 10 };
            DateTimePicker dtFrom = new DateTimePicker { Left = 350, Top = 45, Width = 140 };
            dtFrom.Value = dtFrom.MinDate;

            Label lblTo = new Label { Text = "Дата по", Left = 510, Top = 10 };
            DateTimePicker dtTo = new DateTimePicker { Left = 510, Top = 45, Width = 140 };
            dtTo.Value = dtTo.MaxDate;

            // --- VOLUME ---
            Label lblMin = new Label { Text = "Обʼєм від", Left = 670, Top = 10, Width = 80 };
            TextBox txtMin = new TextBox { Left = 670, Top = 45, Width = 80 };

            Label lblMax = new Label { Text = "Обʼєм до", Left = 760, Top = 10, Width = 80 };
            TextBox txtMax = new TextBox { Left = 760, Top = 45, Width = 80 };

            // --- SEARCH BUTTON ---
            Button btnSearch = new Button
            {
                Text = "Пошук",
                Left = 860,
                Top = 45,
                Width = 100
            };

            panel.Controls.AddRange(new Control[]
            {
        lblCompany, cmbCompany,
        lblFrom, dtFrom,
        lblTo, dtTo,
        lblMin, txtMin,
        lblMax, txtMax,
        btnSearch
            });

            // --- GRID ---
            dgvOrderQuery.Dock = DockStyle.Fill;
            dgvOrderQuery.ReadOnly = true;
            dgvOrderQuery.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            dgvOrderQuery.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;

            // --- EVENT ---
            btnSearch.Click += (s, e) =>
            {
                decimal? min = decimal.TryParse(txtMin.Text, out var mn) ? mn : null;
                decimal? max = decimal.TryParse(txtMax.Text, out var mx) ? mx : null;

                dgvOrderQuery.DataSource = OrderQueryService.SearchOrders(
                    cmbCompany.Text,
                    dtFrom.Value,
                    dtTo.Value,
                    min,
                    max
                );
            };

            tab.Controls.Add(dgvOrderQuery);
            tab.Controls.Add(panel);
            tabs.TabPages.Add(tab);
        }

        private void AddOrder(object sender, EventArgs e)
        {
            if (DateTime.Now.Hour < 9/* || DateTime.Now.Hour > 18*/)
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

            var reportTabs = new TabControl
            {
                Dock = DockStyle.Fill
            };

            reportTabs.TabPages.Add(CreateOrderReportTab());
            reportTabs.TabPages.Add(CreateNewOrdersReportTab());
            reportTabs.TabPages.Add(CreateCustomerDynamicsReportTab());
            reportTabs.TabPages.Add(CreateTotalVolumeReportTab());

            tab.Controls.Add(reportTabs);
            tabs.TabPages.Add(tab);
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

        private DataGridView dgvUsers = new();
        private DataGridView dgvAdminCustomers = new();

        private void CreateAdminTab()
        {
            var tab = new TabPage("Адміністрування");

            var split = new SplitContainer
            {
                Dock = DockStyle.Fill,
                Orientation = Orientation.Horizontal,
                SplitterDistance = Height / 2
            };

            // ================= USERS =================
            Panel userPanel = new Panel { Dock = DockStyle.Top, Height = 40 };
            Button btnSaveUsers = new Button { Text = "Зберегти користувачів", Left = 10 };
            Button btnDeleteUser = new Button { Text = "Видалити", Left = 180 };

            userPanel.Controls.AddRange(new Control[] { btnSaveUsers, btnDeleteUser });

            dgvUsers.Dock = DockStyle.Fill;
            dgvUsers.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            dgvUsers.AllowUserToAddRows = true;
            dgvUsers.AllowUserToDeleteRows = false;
            dgvUsers.DataSource = AuthService.GetAll();

            btnSaveUsers.Click += (s, e) =>
            {
                AuthService.Save((DataTable)dgvUsers.DataSource);
                MessageBox.Show("Користувачі збережені");
            };

            btnDeleteUser.Click += (s, e) =>
            {
                if (dgvUsers.SelectedRows.Count == 0) return;
                int id = (int)dgvUsers.SelectedRows[0].Cells["UserId"].Value;
                AuthService.Delete(id);
                dgvUsers.DataSource = AuthService.GetAll();
            };

            var userContainer = new Panel { Dock = DockStyle.Fill };
            userContainer.Controls.Add(dgvUsers);
            userContainer.Controls.Add(userPanel);

            split.Panel1.Controls.Add(userContainer);

            // ================= CUSTOMERS =================
            Panel custPanel = new Panel { Dock = DockStyle.Top, Height = 40 };
            Button btnSaveCust = new Button { Text = "Зберегти замовників", Left = 10 };
            Button btnDeleteCust = new Button { Text = "Видалити", Left = 180 };

            custPanel.Controls.AddRange(new Control[] { btnSaveCust, btnDeleteCust });

            dgvAdminCustomers.Dock = DockStyle.Fill;
            dgvAdminCustomers.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            dgvAdminCustomers.AllowUserToAddRows = true;
            dgvAdminCustomers.AllowUserToDeleteRows = false;
            dgvAdminCustomers.DataSource = CustomerService.GetAll();

            btnSaveCust.Click += (s, e) =>
            {
                CustomerService.Save((DataTable)dgvAdminCustomers.DataSource);
                MessageBox.Show("Замовники збережені");
            };

            btnDeleteCust.Click += (s, e) =>
            {
                if (dgvAdminCustomers.SelectedRows.Count == 0) return;
                int id = (int)dgvAdminCustomers.SelectedRows[0].Cells["CustomerId"].Value;
                CustomerService.Delete(id);
                dgvAdminCustomers.DataSource = CustomerService.GetAll();
            };

            var custContainer = new Panel { Dock = DockStyle.Fill };
            custContainer.Controls.Add(dgvAdminCustomers);
            custContainer.Controls.Add(custPanel);

            split.Panel2.Controls.Add(custContainer);

            tab.Controls.Add(split);
            tabs.TabPages.Add(tab);
        }

        private TabPage CreateOrderReportTab()
        {
            var tab = new TabPage("Замовлення");

            var panel = new Panel { Dock = DockStyle.Top, Height = 70 };

            ComboBox cmbOrders = new ComboBox
            {
                Left = 10,
                Top = 30,
                Width = 200,
                DropDownStyle = ComboBoxStyle.DropDownList
            };

            cmbOrders.DataSource = OrderService.GetAll();
            cmbOrders.DisplayMember = "OrderId";
            cmbOrders.ValueMember = "OrderId";

            Button btnBuild = new Button { Text = "Побудувати", Left = 220, Top = 30 };
            Button btnSave = new Button { Text = "Зберегти", Left = 340, Top = 30 };

            var grid = new DataGridView
            {
                Dock = DockStyle.Fill,
                ReadOnly = true,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
            };

            btnBuild.Click += (s, e) =>
            {
                int orderId = (int)cmbOrders.SelectedValue;
                grid.DataSource = ReportService.GetOrderReport(orderId);
            };

            btnSave.Click += (s, e) => ReportHelper.SaveGrid(grid);

            panel.Controls.AddRange(new Control[] { cmbOrders, btnBuild, btnSave });
            tab.Controls.Add(grid);
            tab.Controls.Add(panel);

            return tab;
        }

        private TabPage CreateNewOrdersReportTab()
        {
            var tab = new TabPage("Нові замовлення");

            var panel = new Panel { Dock = DockStyle.Top, Height = 70 };

            Button btnBuild = new Button { Text = "Побудувати", Left = 10, Top = 30 };
            Button btnSave = new Button { Text = "Зберегти", Left = 130, Top = 30 };

            var grid = new DataGridView
            {
                Dock = DockStyle.Fill,
                ReadOnly = true,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
            };

            btnBuild.Click += (s, e) =>
                grid.DataSource = ReportService.GetRecentlyAddedOrders();

            btnSave.Click += (s, e) => ReportHelper.SaveGrid(grid);

            panel.Controls.AddRange(new Control[] { btnBuild, btnSave });
            tab.Controls.Add(grid);
            tab.Controls.Add(panel);

            return tab;
        }

        private TabPage CreateCustomerDynamicsReportTab()
        {
            var tab = new TabPage("Динаміка замовника");

            Panel panel = new Panel { Dock = DockStyle.Top, Height = 80 };

            ComboBox cmbCustomer = new ComboBox { Left = 10, Top = 35, Width = 200 };
            Button btnBuild = new Button { Text = "Побудувати", Left = 220, Top = 35 };
            Button btnSave = new Button { Text = "Зберегти", Left = 340, Top = 35 };

            cmbCustomer.DataSource = CustomerService.GetAll();
            cmbCustomer.DisplayMember = "CompanyName";
            cmbCustomer.ValueMember = "CustomerId";

            var plotView = new PlotView { Dock = DockStyle.Fill };
            var model = new PlotModel { Title = "Динаміка замовлень" };

            model.Axes.Add(new DateTimeAxis { Position = AxisPosition.Bottom });
            model.Axes.Add(new LinearAxis { Position = AxisPosition.Left });

            plotView.Model = model;

            btnBuild.Click += (s, e) =>
            {
                model.Series.Clear();
                int id = (int)cmbCustomer.SelectedValue;

                var data = ReportService.GetCustomerDynamics(id);
                var series = new LineSeries();

                foreach (var d in data)
                    series.Points.Add(new DataPoint(DateTimeAxis.ToDouble(d.Date), (double)d.Volume));

                model.Series.Add(series);
                model.InvalidatePlot(true);
            };

            btnSave.Click += (s, e) => ReportHelper.SavePlot(model);

            panel.Controls.AddRange(new Control[] { cmbCustomer, btnBuild, btnSave });
            tab.Controls.Add(plotView);
            tab.Controls.Add(panel);

            return tab;
        }

        private TabPage CreateTotalVolumeReportTab()
        {
            var tab = new TabPage("Загальний обʼєм");

            Panel panel = new Panel { Dock = DockStyle.Top, Height = 80 };

            DateTimePicker from = new DateTimePicker { Left = 10, Top = 35 };
            from.Value = from.MinDate;

            DateTimePicker to = new DateTimePicker { Left = 250, Top = 35 };
            to.Value = to.MaxDate;

            Button btnBuild = new Button { Text = "Побудувати", Left = 480, Top = 35 };
            Button btnSave = new Button { Text = "Зберегти", Left = 550, Top = 35 };

            var grid = new DataGridView { Dock = DockStyle.Fill };

            btnBuild.Click += (s, e) =>
                grid.DataSource = ReportService.GetTotalVolumeDynamics(from.Value, to.Value);

            btnSave.Click += (s, e) => ReportHelper.SaveGrid(grid);

            panel.Controls.AddRange(new Control[] { from, to, btnBuild, btnSave });
            tab.Controls.Add(grid);
            tab.Controls.Add(panel);

            return tab;
        }

        public static class ReportHelper
        {
            public static void SaveGrid(DataGridView grid)
            {
                using SaveFileDialog dlg = new() { Filter = "CSV|*.csv" };
                if (dlg.ShowDialog() != DialogResult.OK) return;

                using StreamWriter sw = new(dlg.FileName);
                foreach (DataGridViewRow r in grid.Rows)
                {
                    if (!r.IsNewRow)
                        sw.WriteLine(string.Join(";", r.Cells.Cast<DataGridViewCell>().Select(c => c.Value)));
                }
            }

            public static void PrintGrid(DataGridView grid)
            {
                MessageBox.Show("Printing implemented via PrintDocument (can be added if required).");
            }

            public static void SavePlot(PlotModel model)
            {
                using SaveFileDialog dlg = new() { Filter = "PNG|*.png" };
                if (dlg.ShowDialog() == DialogResult.OK)
                    PngExporter.Export(model, dlg.FileName, 800, 600);
            }

            public static void PrintPlot(PlotModel model)
            {
                MessageBox.Show("Plot printing can be added via PrintDocument.");
            }
        }

    }
}
