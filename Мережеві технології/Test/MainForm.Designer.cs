namespace DairySupplySystem
{
    partial class MainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.Windows.Forms.DataVisualization.Charting.ChartArea chartArea2 = new System.Windows.Forms.DataVisualization.Charting.ChartArea();
            System.Windows.Forms.DataVisualization.Charting.Legend legend2 = new System.Windows.Forms.DataVisualization.Charting.Legend();
            System.Windows.Forms.DataVisualization.Charting.Series series2 = new System.Windows.Forms.DataVisualization.Charting.Series();
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.tabPage1 = new System.Windows.Forms.TabPage();
            this.dgvOrders = new System.Windows.Forms.DataGridView();
            this.panel1 = new System.Windows.Forms.Panel();
            this.label3 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.txtSearchProduct = new System.Windows.Forms.TextBox();
            this.txtSearchCustomer = new System.Windows.Forms.TextBox();
            this.btnStats = new System.Windows.Forms.Button();
            this.btnRefresh = new System.Windows.Forms.Button();
            this.btnDelete = new System.Windows.Forms.Button();
            this.btnEdit = new System.Windows.Forms.Button();
            this.btnAdd = new System.Windows.Forms.Button();
            this.tabPage2 = new System.Windows.Forms.TabPage();
            this.chartReport = new System.Windows.Forms.DataVisualization.Charting.Chart();
            this.panel2 = new System.Windows.Forms.Panel();
            this.chkGeneralStat = new System.Windows.Forms.CheckBox();
            this.btnSaveReport = new System.Windows.Forms.Button();
            this.btnBuildReport = new System.Windows.Forms.Button();
            this.cmbReportCustomer = new System.Windows.Forms.ComboBox();
            this.label1 = new System.Windows.Forms.Label();
            this.tabAdmin = new System.Windows.Forms.TabPage();
            this.label7 = new System.Windows.Forms.Label();
            this.txtNewCustPhone = new System.Windows.Forms.TextBox();
            this.dgvCustomersList = new System.Windows.Forms.DataGridView();
            this.btnAddNewCustomer = new System.Windows.Forms.Button();
            this.txtNewCustAddress = new System.Windows.Forms.TextBox();
            this.label6 = new System.Windows.Forms.Label();
            this.txtNewCustName = new System.Windows.Forms.TextBox();
            this.label5 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.label8 = new System.Windows.Forms.Label();
            this.label9 = new System.Windows.Forms.Label();
            this.txtNewProdUnit = new System.Windows.Forms.TextBox();
            this.txtNewProdPrice = new System.Windows.Forms.TextBox();
            this.label10 = new System.Windows.Forms.Label();
            this.txtNewProdName = new System.Windows.Forms.TextBox();
            this.label11 = new System.Windows.Forms.Label();
            this.btnAddNewProduct = new System.Windows.Forms.Button();
            this.dgvProductsList = new System.Windows.Forms.DataGridView();
            this.btnEditCustomer = new System.Windows.Forms.Button();
            this.txtEditCustPhone = new System.Windows.Forms.TextBox();
            this.txtEditCustAddress = new System.Windows.Forms.TextBox();
            this.txtEditCustName = new System.Windows.Forms.TextBox();
            this.label15 = new System.Windows.Forms.Label();
            this.btnEditProduct = new System.Windows.Forms.Button();
            this.label16 = new System.Windows.Forms.Label();
            this.txtEditProdUnit = new System.Windows.Forms.TextBox();
            this.txtEditProdPrice = new System.Windows.Forms.TextBox();
            this.label17 = new System.Windows.Forms.Label();
            this.txtEditProdName = new System.Windows.Forms.TextBox();
            this.label18 = new System.Windows.Forms.Label();
            this.label19 = new System.Windows.Forms.Label();
            this.txtEditCustID = new System.Windows.Forms.TextBox();
            this.label20 = new System.Windows.Forms.Label();
            this.label21 = new System.Windows.Forms.Label();
            this.txtEditProdID = new System.Windows.Forms.TextBox();
            this.label12 = new System.Windows.Forms.Label();
            this.label13 = new System.Windows.Forms.Label();
            this.label14 = new System.Windows.Forms.Label();
            this.btnSaveOrderToFile = new System.Windows.Forms.Button();
            this.tabControl1.SuspendLayout();
            this.tabPage1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dgvOrders)).BeginInit();
            this.panel1.SuspendLayout();
            this.tabPage2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.chartReport)).BeginInit();
            this.panel2.SuspendLayout();
            this.tabAdmin.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dgvCustomersList)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgvProductsList)).BeginInit();
            this.SuspendLayout();
            // 
            // tabControl1
            // 
            this.tabControl1.Controls.Add(this.tabPage1);
            this.tabControl1.Controls.Add(this.tabPage2);
            this.tabControl1.Controls.Add(this.tabAdmin);
            this.tabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabControl1.Location = new System.Drawing.Point(0, 0);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(809, 540);
            this.tabControl1.TabIndex = 0;
            // 
            // tabPage1
            // 
            this.tabPage1.Controls.Add(this.dgvOrders);
            this.tabPage1.Controls.Add(this.panel1);
            this.tabPage1.Location = new System.Drawing.Point(4, 22);
            this.tabPage1.Name = "tabPage1";
            this.tabPage1.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage1.Size = new System.Drawing.Size(801, 514);
            this.tabPage1.TabIndex = 0;
            this.tabPage1.Text = "Замовлення";
            this.tabPage1.UseVisualStyleBackColor = true;
            // 
            // dgvOrders
            // 
            this.dgvOrders.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvOrders.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvOrders.Location = new System.Drawing.Point(3, 90);
            this.dgvOrders.Name = "dgvOrders";
            this.dgvOrders.ReadOnly = true;
            this.dgvOrders.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvOrders.Size = new System.Drawing.Size(795, 421);
            this.dgvOrders.TabIndex = 0;
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.btnSaveOrderToFile);
            this.panel1.Controls.Add(this.label3);
            this.panel1.Controls.Add(this.label2);
            this.panel1.Controls.Add(this.txtSearchProduct);
            this.panel1.Controls.Add(this.txtSearchCustomer);
            this.panel1.Controls.Add(this.btnStats);
            this.panel1.Controls.Add(this.btnRefresh);
            this.panel1.Controls.Add(this.btnDelete);
            this.panel1.Controls.Add(this.btnEdit);
            this.panel1.Controls.Add(this.btnAdd);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel1.ImeMode = System.Windows.Forms.ImeMode.Disable;
            this.panel1.Location = new System.Drawing.Point(3, 3);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(795, 87);
            this.panel1.TabIndex = 1;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(263, 46);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(49, 13);
            this.label3.TabIndex = 8;
            this.label3.Text = "Продукт";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(15, 46);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(51, 13);
            this.label2.TabIndex = 7;
            this.label2.Text = "Магазин";
            // 
            // txtSearchProduct
            // 
            this.txtSearchProduct.Location = new System.Drawing.Point(266, 61);
            this.txtSearchProduct.Name = "txtSearchProduct";
            this.txtSearchProduct.Size = new System.Drawing.Size(236, 20);
            this.txtSearchProduct.TabIndex = 6;
            this.txtSearchProduct.TextChanged += new System.EventHandler(this.UpdateFilter);
            // 
            // txtSearchCustomer
            // 
            this.txtSearchCustomer.Location = new System.Drawing.Point(15, 61);
            this.txtSearchCustomer.Name = "txtSearchCustomer";
            this.txtSearchCustomer.Size = new System.Drawing.Size(236, 20);
            this.txtSearchCustomer.TabIndex = 5;
            this.txtSearchCustomer.TextChanged += new System.EventHandler(this.UpdateFilter);
            // 
            // btnStats
            // 
            this.btnStats.Location = new System.Drawing.Point(414, 16);
            this.btnStats.Name = "btnStats";
            this.btnStats.Size = new System.Drawing.Size(87, 23);
            this.btnStats.TabIndex = 4;
            this.btnStats.Text = "Статистика";
            this.btnStats.UseVisualStyleBackColor = true;
            this.btnStats.Click += new System.EventHandler(this.btnStats_Click);
            // 
            // btnRefresh
            // 
            this.btnRefresh.Location = new System.Drawing.Point(321, 16);
            this.btnRefresh.Name = "btnRefresh";
            this.btnRefresh.Size = new System.Drawing.Size(87, 23);
            this.btnRefresh.TabIndex = 3;
            this.btnRefresh.Text = "Оновити";
            this.btnRefresh.UseVisualStyleBackColor = true;
            this.btnRefresh.Click += new System.EventHandler(this.btnRefresh_Click);
            // 
            // btnDelete
            // 
            this.btnDelete.Location = new System.Drawing.Point(228, 16);
            this.btnDelete.Name = "btnDelete";
            this.btnDelete.Size = new System.Drawing.Size(87, 23);
            this.btnDelete.TabIndex = 2;
            this.btnDelete.Text = "Видалити";
            this.btnDelete.UseVisualStyleBackColor = true;
            this.btnDelete.Click += new System.EventHandler(this.btnDelete_Click);
            // 
            // btnEdit
            // 
            this.btnEdit.Location = new System.Drawing.Point(135, 16);
            this.btnEdit.Name = "btnEdit";
            this.btnEdit.Size = new System.Drawing.Size(87, 23);
            this.btnEdit.TabIndex = 1;
            this.btnEdit.Text = "Редагування";
            this.btnEdit.UseVisualStyleBackColor = true;
            this.btnEdit.Click += new System.EventHandler(this.btnEdit_Click);
            // 
            // btnAdd
            // 
            this.btnAdd.Location = new System.Drawing.Point(15, 16);
            this.btnAdd.Name = "btnAdd";
            this.btnAdd.Size = new System.Drawing.Size(114, 23);
            this.btnAdd.TabIndex = 0;
            this.btnAdd.Text = "Нове замовлення";
            this.btnAdd.UseVisualStyleBackColor = true;
            this.btnAdd.Click += new System.EventHandler(this.btnAdd_Click);
            // 
            // tabPage2
            // 
            this.tabPage2.Controls.Add(this.chartReport);
            this.tabPage2.Controls.Add(this.panel2);
            this.tabPage2.Location = new System.Drawing.Point(4, 22);
            this.tabPage2.Name = "tabPage2";
            this.tabPage2.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage2.Size = new System.Drawing.Size(801, 514);
            this.tabPage2.TabIndex = 1;
            this.tabPage2.Text = "Графік";
            this.tabPage2.UseVisualStyleBackColor = true;
            // 
            // chartReport
            // 
            chartArea2.Name = "ChartArea1";
            this.chartReport.ChartAreas.Add(chartArea2);
            this.chartReport.Dock = System.Windows.Forms.DockStyle.Fill;
            legend2.Name = "Legend1";
            this.chartReport.Legends.Add(legend2);
            this.chartReport.Location = new System.Drawing.Point(3, 63);
            this.chartReport.Name = "chartReport";
            series2.ChartArea = "ChartArea1";
            series2.Legend = "Legend1";
            series2.Name = "Series1";
            this.chartReport.Series.Add(series2);
            this.chartReport.Size = new System.Drawing.Size(795, 448);
            this.chartReport.TabIndex = 1;
            this.chartReport.Text = "chart1";
            // 
            // panel2
            // 
            this.panel2.Controls.Add(this.chkGeneralStat);
            this.panel2.Controls.Add(this.btnSaveReport);
            this.panel2.Controls.Add(this.btnBuildReport);
            this.panel2.Controls.Add(this.cmbReportCustomer);
            this.panel2.Controls.Add(this.label1);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel2.Location = new System.Drawing.Point(3, 3);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(795, 60);
            this.panel2.TabIndex = 0;
            // 
            // chkGeneralStat
            // 
            this.chkGeneralStat.AutoSize = true;
            this.chkGeneralStat.Location = new System.Drawing.Point(315, 25);
            this.chkGeneralStat.Name = "chkGeneralStat";
            this.chkGeneralStat.Size = new System.Drawing.Size(81, 17);
            this.chkGeneralStat.TabIndex = 4;
            this.chkGeneralStat.Text = "Всі клієнти";
            this.chkGeneralStat.UseVisualStyleBackColor = true;
            // 
            // btnSaveReport
            // 
            this.btnSaveReport.Location = new System.Drawing.Point(665, 25);
            this.btnSaveReport.Name = "btnSaveReport";
            this.btnSaveReport.Size = new System.Drawing.Size(75, 23);
            this.btnSaveReport.TabIndex = 3;
            this.btnSaveReport.Text = "Зберегти";
            this.btnSaveReport.UseVisualStyleBackColor = true;
            this.btnSaveReport.Click += new System.EventHandler(this.btnSaveReport_Click);
            // 
            // btnBuildReport
            // 
            this.btnBuildReport.Location = new System.Drawing.Point(224, 23);
            this.btnBuildReport.Name = "btnBuildReport";
            this.btnBuildReport.Size = new System.Drawing.Size(75, 23);
            this.btnBuildReport.TabIndex = 2;
            this.btnBuildReport.Text = "Побудувати график";
            this.btnBuildReport.UseVisualStyleBackColor = true;
            this.btnBuildReport.Click += new System.EventHandler(this.btnBuildReport_Click);
            // 
            // cmbReportCustomer
            // 
            this.cmbReportCustomer.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cmbReportCustomer.FormattingEnabled = true;
            this.cmbReportCustomer.Location = new System.Drawing.Point(8, 25);
            this.cmbReportCustomer.Name = "cmbReportCustomer";
            this.cmbReportCustomer.Size = new System.Drawing.Size(200, 21);
            this.cmbReportCustomer.TabIndex = 1;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(5, 9);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(86, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "Оберіть клієнта";
            // 
            // tabAdmin
            // 
            this.tabAdmin.Controls.Add(this.label12);
            this.tabAdmin.Controls.Add(this.label13);
            this.tabAdmin.Controls.Add(this.label14);
            this.tabAdmin.Controls.Add(this.label21);
            this.tabAdmin.Controls.Add(this.txtEditProdID);
            this.tabAdmin.Controls.Add(this.label20);
            this.tabAdmin.Controls.Add(this.txtEditCustID);
            this.tabAdmin.Controls.Add(this.btnEditProduct);
            this.tabAdmin.Controls.Add(this.label16);
            this.tabAdmin.Controls.Add(this.txtEditProdUnit);
            this.tabAdmin.Controls.Add(this.txtEditProdPrice);
            this.tabAdmin.Controls.Add(this.label17);
            this.tabAdmin.Controls.Add(this.txtEditProdName);
            this.tabAdmin.Controls.Add(this.label18);
            this.tabAdmin.Controls.Add(this.label19);
            this.tabAdmin.Controls.Add(this.btnEditCustomer);
            this.tabAdmin.Controls.Add(this.txtEditCustPhone);
            this.tabAdmin.Controls.Add(this.txtEditCustAddress);
            this.tabAdmin.Controls.Add(this.txtEditCustName);
            this.tabAdmin.Controls.Add(this.label15);
            this.tabAdmin.Controls.Add(this.dgvProductsList);
            this.tabAdmin.Controls.Add(this.btnAddNewProduct);
            this.tabAdmin.Controls.Add(this.label9);
            this.tabAdmin.Controls.Add(this.txtNewProdUnit);
            this.tabAdmin.Controls.Add(this.txtNewProdPrice);
            this.tabAdmin.Controls.Add(this.label10);
            this.tabAdmin.Controls.Add(this.txtNewProdName);
            this.tabAdmin.Controls.Add(this.label11);
            this.tabAdmin.Controls.Add(this.label8);
            this.tabAdmin.Controls.Add(this.label7);
            this.tabAdmin.Controls.Add(this.txtNewCustPhone);
            this.tabAdmin.Controls.Add(this.dgvCustomersList);
            this.tabAdmin.Controls.Add(this.btnAddNewCustomer);
            this.tabAdmin.Controls.Add(this.txtNewCustAddress);
            this.tabAdmin.Controls.Add(this.label6);
            this.tabAdmin.Controls.Add(this.txtNewCustName);
            this.tabAdmin.Controls.Add(this.label5);
            this.tabAdmin.Controls.Add(this.label4);
            this.tabAdmin.Location = new System.Drawing.Point(4, 22);
            this.tabAdmin.Name = "tabAdmin";
            this.tabAdmin.Padding = new System.Windows.Forms.Padding(3);
            this.tabAdmin.Size = new System.Drawing.Size(801, 514);
            this.tabAdmin.TabIndex = 2;
            this.tabAdmin.Text = "Адміністрування";
            this.tabAdmin.UseVisualStyleBackColor = true;
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(8, 98);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(55, 13);
            this.label7.TabIndex = 8;
            this.label7.Text = "Телефон:";
            // 
            // txtNewCustPhone
            // 
            this.txtNewCustPhone.Location = new System.Drawing.Point(73, 95);
            this.txtNewCustPhone.Name = "txtNewCustPhone";
            this.txtNewCustPhone.Size = new System.Drawing.Size(122, 20);
            this.txtNewCustPhone.TabIndex = 7;
            // 
            // dgvCustomersList
            // 
            this.dgvCustomersList.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvCustomersList.Location = new System.Drawing.Point(6, 187);
            this.dgvCustomersList.Name = "dgvCustomersList";
            this.dgvCustomersList.Size = new System.Drawing.Size(787, 160);
            this.dgvCustomersList.TabIndex = 6;
            this.dgvCustomersList.CellClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.dgvCustomersList_CellClick);
            // 
            // btnAddNewCustomer
            // 
            this.btnAddNewCustomer.Location = new System.Drawing.Point(73, 121);
            this.btnAddNewCustomer.Name = "btnAddNewCustomer";
            this.btnAddNewCustomer.Size = new System.Drawing.Size(122, 23);
            this.btnAddNewCustomer.TabIndex = 5;
            this.btnAddNewCustomer.Text = "Додати клієнта";
            this.btnAddNewCustomer.UseVisualStyleBackColor = true;
            this.btnAddNewCustomer.Click += new System.EventHandler(this.btnAddNewCustomer_Click);
            // 
            // txtNewCustAddress
            // 
            this.txtNewCustAddress.Location = new System.Drawing.Point(73, 69);
            this.txtNewCustAddress.Name = "txtNewCustAddress";
            this.txtNewCustAddress.Size = new System.Drawing.Size(122, 20);
            this.txtNewCustAddress.TabIndex = 4;
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(16, 72);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(47, 13);
            this.label6.TabIndex = 3;
            this.label6.Text = "Адреса:";
            // 
            // txtNewCustName
            // 
            this.txtNewCustName.Location = new System.Drawing.Point(73, 43);
            this.txtNewCustName.Name = "txtNewCustName";
            this.txtNewCustName.Size = new System.Drawing.Size(122, 20);
            this.txtNewCustName.TabIndex = 2;
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(21, 46);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(42, 13);
            this.label5.TabIndex = 1;
            this.label5.Text = "Назва:";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(8, 18);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(73, 13);
            this.label4.TabIndex = 0;
            this.label4.Text = "Новий клієнт";
            // 
            // label8
            // 
            this.label8.AutoSize = true;
            this.label8.Location = new System.Drawing.Point(219, 18);
            this.label8.Name = "label8";
            this.label8.Size = new System.Drawing.Size(82, 13);
            this.label8.TabIndex = 9;
            this.label8.Text = "Новий продукт";
            // 
            // label9
            // 
            this.label9.AutoSize = true;
            this.label9.Location = new System.Drawing.Point(207, 101);
            this.label9.Name = "label9";
            this.label9.Size = new System.Drawing.Size(47, 13);
            this.label9.TabIndex = 15;
            this.label9.Text = "л/шт/кг";
            // 
            // txtNewProdUnit
            // 
            this.txtNewProdUnit.Location = new System.Drawing.Point(272, 98);
            this.txtNewProdUnit.Name = "txtNewProdUnit";
            this.txtNewProdUnit.Size = new System.Drawing.Size(122, 20);
            this.txtNewProdUnit.TabIndex = 14;
            // 
            // txtNewProdPrice
            // 
            this.txtNewProdPrice.Location = new System.Drawing.Point(272, 72);
            this.txtNewProdPrice.Name = "txtNewProdPrice";
            this.txtNewProdPrice.Size = new System.Drawing.Size(122, 20);
            this.txtNewProdPrice.TabIndex = 13;
            // 
            // label10
            // 
            this.label10.AutoSize = true;
            this.label10.Location = new System.Drawing.Point(225, 75);
            this.label10.Name = "label10";
            this.label10.Size = new System.Drawing.Size(29, 13);
            this.label10.TabIndex = 12;
            this.label10.Text = "Ціна";
            // 
            // txtNewProdName
            // 
            this.txtNewProdName.Location = new System.Drawing.Point(272, 46);
            this.txtNewProdName.Name = "txtNewProdName";
            this.txtNewProdName.Size = new System.Drawing.Size(122, 20);
            this.txtNewProdName.TabIndex = 11;
            // 
            // label11
            // 
            this.label11.AutoSize = true;
            this.label11.Location = new System.Drawing.Point(220, 49);
            this.label11.Name = "label11";
            this.label11.Size = new System.Drawing.Size(42, 13);
            this.label11.TabIndex = 10;
            this.label11.Text = "Назва:";
            // 
            // btnAddNewProduct
            // 
            this.btnAddNewProduct.Location = new System.Drawing.Point(272, 121);
            this.btnAddNewProduct.Name = "btnAddNewProduct";
            this.btnAddNewProduct.Size = new System.Drawing.Size(122, 23);
            this.btnAddNewProduct.TabIndex = 16;
            this.btnAddNewProduct.Text = "Додати продукт";
            this.btnAddNewProduct.UseVisualStyleBackColor = true;
            this.btnAddNewProduct.Click += new System.EventHandler(this.btnAddNewProduct_Click);
            // 
            // dgvProductsList
            // 
            this.dgvProductsList.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvProductsList.Location = new System.Drawing.Point(6, 353);
            this.dgvProductsList.Name = "dgvProductsList";
            this.dgvProductsList.Size = new System.Drawing.Size(787, 153);
            this.dgvProductsList.TabIndex = 17;
            this.dgvProductsList.CellClick += new System.Windows.Forms.DataGridViewCellEventHandler(this.dgvProductsList_CellClick);
            // 
            // btnEditCustomer
            // 
            this.btnEditCustomer.Location = new System.Drawing.Point(464, 146);
            this.btnEditCustomer.Name = "btnEditCustomer";
            this.btnEditCustomer.Size = new System.Drawing.Size(122, 23);
            this.btnEditCustomer.TabIndex = 25;
            this.btnEditCustomer.Text = "Редагувати клієнта";
            this.btnEditCustomer.UseVisualStyleBackColor = true;
            this.btnEditCustomer.Click += new System.EventHandler(this.btnEditCustomer_Click);
            // 
            // txtEditCustPhone
            // 
            this.txtEditCustPhone.Location = new System.Drawing.Point(464, 123);
            this.txtEditCustPhone.Name = "txtEditCustPhone";
            this.txtEditCustPhone.Size = new System.Drawing.Size(122, 20);
            this.txtEditCustPhone.TabIndex = 23;
            // 
            // txtEditCustAddress
            // 
            this.txtEditCustAddress.Location = new System.Drawing.Point(464, 97);
            this.txtEditCustAddress.Name = "txtEditCustAddress";
            this.txtEditCustAddress.Size = new System.Drawing.Size(122, 20);
            this.txtEditCustAddress.TabIndex = 22;
            // 
            // txtEditCustName
            // 
            this.txtEditCustName.Location = new System.Drawing.Point(464, 71);
            this.txtEditCustName.Name = "txtEditCustName";
            this.txtEditCustName.Size = new System.Drawing.Size(122, 20);
            this.txtEditCustName.TabIndex = 20;
            // 
            // label15
            // 
            this.label15.AutoSize = true;
            this.label15.Location = new System.Drawing.Point(418, 18);
            this.label15.Name = "label15";
            this.label15.Size = new System.Drawing.Size(112, 13);
            this.label15.TabIndex = 18;
            this.label15.Text = "Редагування клієнта";
            // 
            // btnEditProduct
            // 
            this.btnEditProduct.Location = new System.Drawing.Point(667, 144);
            this.btnEditProduct.Name = "btnEditProduct";
            this.btnEditProduct.Size = new System.Drawing.Size(122, 23);
            this.btnEditProduct.TabIndex = 33;
            this.btnEditProduct.Text = "Редагувати продукт";
            this.btnEditProduct.UseVisualStyleBackColor = true;
            this.btnEditProduct.Click += new System.EventHandler(this.btnEditProduct_Click);
            // 
            // label16
            // 
            this.label16.AutoSize = true;
            this.label16.Location = new System.Drawing.Point(602, 124);
            this.label16.Name = "label16";
            this.label16.Size = new System.Drawing.Size(47, 13);
            this.label16.TabIndex = 32;
            this.label16.Text = "л/шт/кг";
            // 
            // txtEditProdUnit
            // 
            this.txtEditProdUnit.Location = new System.Drawing.Point(667, 121);
            this.txtEditProdUnit.Name = "txtEditProdUnit";
            this.txtEditProdUnit.Size = new System.Drawing.Size(122, 20);
            this.txtEditProdUnit.TabIndex = 31;
            // 
            // txtEditProdPrice
            // 
            this.txtEditProdPrice.Location = new System.Drawing.Point(667, 95);
            this.txtEditProdPrice.Name = "txtEditProdPrice";
            this.txtEditProdPrice.Size = new System.Drawing.Size(122, 20);
            this.txtEditProdPrice.TabIndex = 30;
            // 
            // label17
            // 
            this.label17.AutoSize = true;
            this.label17.Location = new System.Drawing.Point(620, 98);
            this.label17.Name = "label17";
            this.label17.Size = new System.Drawing.Size(29, 13);
            this.label17.TabIndex = 29;
            this.label17.Text = "Ціна";
            // 
            // txtEditProdName
            // 
            this.txtEditProdName.Location = new System.Drawing.Point(667, 69);
            this.txtEditProdName.Name = "txtEditProdName";
            this.txtEditProdName.Size = new System.Drawing.Size(122, 20);
            this.txtEditProdName.TabIndex = 28;
            // 
            // label18
            // 
            this.label18.AutoSize = true;
            this.label18.Location = new System.Drawing.Point(615, 72);
            this.label18.Name = "label18";
            this.label18.Size = new System.Drawing.Size(42, 13);
            this.label18.TabIndex = 27;
            this.label18.Text = "Назва:";
            // 
            // label19
            // 
            this.label19.AutoSize = true;
            this.label19.Location = new System.Drawing.Point(615, 18);
            this.label19.Name = "label19";
            this.label19.Size = new System.Drawing.Size(115, 13);
            this.label19.TabIndex = 26;
            this.label19.Text = "Редагування продукт";
            // 
            // txtEditCustID
            // 
            this.txtEditCustID.Location = new System.Drawing.Point(464, 46);
            this.txtEditCustID.Name = "txtEditCustID";
            this.txtEditCustID.ReadOnly = true;
            this.txtEditCustID.Size = new System.Drawing.Size(122, 20);
            this.txtEditCustID.TabIndex = 34;
            // 
            // label20
            // 
            this.label20.AutoSize = true;
            this.label20.Location = new System.Drawing.Point(412, 50);
            this.label20.Name = "label20";
            this.label20.Size = new System.Drawing.Size(44, 13);
            this.label20.TabIndex = 35;
            this.label20.Text = "Номер:";
            // 
            // label21
            // 
            this.label21.AutoSize = true;
            this.label21.Location = new System.Drawing.Point(615, 49);
            this.label21.Name = "label21";
            this.label21.Size = new System.Drawing.Size(44, 13);
            this.label21.TabIndex = 37;
            this.label21.Text = "Номер:";
            // 
            // txtEditProdID
            // 
            this.txtEditProdID.Location = new System.Drawing.Point(667, 45);
            this.txtEditProdID.Name = "txtEditProdID";
            this.txtEditProdID.ReadOnly = true;
            this.txtEditProdID.Size = new System.Drawing.Size(122, 20);
            this.txtEditProdID.TabIndex = 36;
            // 
            // label12
            // 
            this.label12.AutoSize = true;
            this.label12.Location = new System.Drawing.Point(399, 127);
            this.label12.Name = "label12";
            this.label12.Size = new System.Drawing.Size(55, 13);
            this.label12.TabIndex = 40;
            this.label12.Text = "Телефон:";
            // 
            // label13
            // 
            this.label13.AutoSize = true;
            this.label13.Location = new System.Drawing.Point(407, 101);
            this.label13.Name = "label13";
            this.label13.Size = new System.Drawing.Size(47, 13);
            this.label13.TabIndex = 39;
            this.label13.Text = "Адреса:";
            // 
            // label14
            // 
            this.label14.AutoSize = true;
            this.label14.Location = new System.Drawing.Point(412, 75);
            this.label14.Name = "label14";
            this.label14.Size = new System.Drawing.Size(42, 13);
            this.label14.TabIndex = 38;
            this.label14.Text = "Назва:";
            // 
            // btnSaveOrderToFile
            // 
            this.btnSaveOrderToFile.Location = new System.Drawing.Point(507, 16);
            this.btnSaveOrderToFile.Name = "btnSaveOrderToFile";
            this.btnSaveOrderToFile.Size = new System.Drawing.Size(87, 23);
            this.btnSaveOrderToFile.TabIndex = 9;
            this.btnSaveOrderToFile.Text = "Зберегти чек";
            this.btnSaveOrderToFile.UseVisualStyleBackColor = true;
            this.btnSaveOrderToFile.Click += new System.EventHandler(this.btnSaveOrderToFile_Click);
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(809, 540);
            this.Controls.Add(this.tabControl1);
            this.Name = "MainForm";
            this.Text = "MainForm";
            this.Load += new System.EventHandler(this.MainForm_Load);
            this.tabControl1.ResumeLayout(false);
            this.tabPage1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.dgvOrders)).EndInit();
            this.panel1.ResumeLayout(false);
            this.panel1.PerformLayout();
            this.tabPage2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.chartReport)).EndInit();
            this.panel2.ResumeLayout(false);
            this.panel2.PerformLayout();
            this.tabAdmin.ResumeLayout(false);
            this.tabAdmin.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dgvCustomersList)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.dgvProductsList)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage tabPage1;
        private System.Windows.Forms.TabPage tabPage2;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.DataGridView dgvOrders;
        private System.Windows.Forms.Button btnRefresh;
        private System.Windows.Forms.Button btnDelete;
        private System.Windows.Forms.Button btnEdit;
        private System.Windows.Forms.Button btnAdd;
        private System.Windows.Forms.Panel panel2;
        private System.Windows.Forms.ComboBox cmbReportCustomer;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.DataVisualization.Charting.Chart chartReport;
        private System.Windows.Forms.Button btnBuildReport;
        private System.Windows.Forms.Button btnStats;
        private System.Windows.Forms.TextBox txtSearchCustomer;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.TextBox txtSearchProduct;
        private System.Windows.Forms.Button btnSaveReport;
        private System.Windows.Forms.TabPage tabAdmin;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.Button btnAddNewCustomer;
        private System.Windows.Forms.TextBox txtNewCustAddress;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.TextBox txtNewCustName;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.DataGridView dgvCustomersList;
        private System.Windows.Forms.CheckBox chkGeneralStat;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.TextBox txtNewCustPhone;
        private System.Windows.Forms.Label label9;
        private System.Windows.Forms.TextBox txtNewProdUnit;
        private System.Windows.Forms.TextBox txtNewProdPrice;
        private System.Windows.Forms.Label label10;
        private System.Windows.Forms.TextBox txtNewProdName;
        private System.Windows.Forms.Label label11;
        private System.Windows.Forms.Label label8;
        private System.Windows.Forms.DataGridView dgvProductsList;
        private System.Windows.Forms.Button btnAddNewProduct;
        private System.Windows.Forms.Button btnEditProduct;
        private System.Windows.Forms.Label label16;
        private System.Windows.Forms.TextBox txtEditProdUnit;
        private System.Windows.Forms.TextBox txtEditProdPrice;
        private System.Windows.Forms.Label label17;
        private System.Windows.Forms.TextBox txtEditProdName;
        private System.Windows.Forms.Label label18;
        private System.Windows.Forms.Label label19;
        private System.Windows.Forms.Button btnEditCustomer;
        private System.Windows.Forms.TextBox txtEditCustPhone;
        private System.Windows.Forms.TextBox txtEditCustAddress;
        private System.Windows.Forms.TextBox txtEditCustName;
        private System.Windows.Forms.Label label15;
        private System.Windows.Forms.Label label21;
        private System.Windows.Forms.TextBox txtEditProdID;
        private System.Windows.Forms.Label label20;
        private System.Windows.Forms.TextBox txtEditCustID;
        private System.Windows.Forms.Label label12;
        private System.Windows.Forms.Label label13;
        private System.Windows.Forms.Label label14;
        private System.Windows.Forms.Button btnSaveOrderToFile;
    }
}