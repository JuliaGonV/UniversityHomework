using System;
using System.Data;
using System.Linq;
using System.Windows.Forms;
using System.Collections.Generic;
using System.IO;
using System.Diagnostics;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace BD_3
{
    public partial class Form1 : Form
    {
        string connectionString = "mongodb://localhost:27017";
        string databaseName = "TravelAgencyDB";

        IMongoDatabase db;
        IMongoCollection<Route> collectionRoutes;
        IMongoCollection<Client> collectionClients;
        IMongoCollection<Voucher> collectionVouchers;
        IMongoCollection<Employee> collectionEmployees;

        public Form1()
        {
            InitializeComponent();
            this.Load += Form1_Load;

            if (gridRoutes != null) gridRoutes.DataBindingComplete += Grid_DataBindingComplete;
            if (gridClients != null) gridClients.DataBindingComplete += Grid_DataBindingComplete;
            if (gridVouchers != null) gridVouchers.DataBindingComplete += Grid_DataBindingComplete;
            if (gridQueryResults != null) gridQueryResults.DataBindingComplete += Grid_DataBindingComplete;

            if (btnAddRoute != null) btnAddRoute.Click += BtnAddRoute_Click;
            if (btnEditRoute != null) btnEditRoute.Click += BtnEditRoute_Click;
            if (gridRoutes != null) gridRoutes.CellClick += (s, e) => FillEditFields(gridRoutes, e, "Route");

            if (txtSearchID != null) txtSearchID.TextChanged += UpdateRouteFilter;
            if (txtSearchCountry != null) txtSearchCountry.TextChanged += UpdateRouteFilter;
            if (txtSearchClimate != null) txtSearchClimate.TextChanged += UpdateRouteFilter;
            if (txtSearchHotel != null) txtSearchHotel.TextChanged += UpdateRouteFilter;
            if (txtSearchDuration != null) txtSearchDuration.TextChanged += UpdateRouteFilter;
            if (txtSearchPriceMin != null) txtSearchPriceMin.TextChanged += UpdateRouteFilter;
            if (txtSearchPriceMax != null) txtSearchPriceMax.TextChanged += UpdateRouteFilter;

            if (btnAddClient != null) btnAddClient.Click += BtnAddClient_Click;
            if (btnEditClient != null) btnEditClient.Click += BtnEditClient_Click;
            if (gridClients != null) gridClients.CellClick += (s, e) => FillEditFields(gridClients, e, "Client");

            if (txtSearchClientID != null) txtSearchClientID.TextChanged += UpdateClientFilter;
            if (txtSearchClientLastName != null) txtSearchClientLastName.TextChanged += UpdateClientFilter;
            if (txtSearchClientFirstName != null) txtSearchClientFirstName.TextChanged += UpdateClientFilter;
            if (txtSearchClientMiddleName != null) txtSearchClientMiddleName.TextChanged += UpdateClientFilter;
            if (txtSearchClientAddress != null) txtSearchClientAddress.TextChanged += UpdateClientFilter;
            if (txtSearchClientPhone != null) txtSearchClientPhone.TextChanged += UpdateClientFilter;

            if (btnAddVoucher != null) btnAddVoucher.Click += BtnAddVoucher_Click;
            if (btnEditVoucher != null) btnEditVoucher.Click += BtnEditVoucher_Click;
            if (btnDeleteVoucher != null) btnDeleteVoucher.Click += BtnDeleteVoucher_Click;
            if (gridVouchers != null) gridVouchers.CellClick += (s, e) => FillEditFields(gridVouchers, e, "Voucher");

            if (txtSearchVoucherID != null) txtSearchVoucherID.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherRouteID != null) txtSearchVoucherRouteID.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherDate != null) txtSearchVoucherDate.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherQuantity != null) txtSearchVoucherQuantity.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherDiscountMin != null) txtSearchVoucherDiscountMin.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherDiscountMax != null) txtSearchVoucherDiscountMax.TextChanged += UpdateVoucherFilter;

            if (cmbSearchVoucherClient != null) cmbSearchVoucherClient.SelectedIndexChanged += UpdateVoucherFilter;
            if (cmbSearchVoucherEmployee != null) cmbSearchVoucherEmployee.SelectedIndexChanged += UpdateVoucherFilter;

            if (cmbQueries != null) cmbQueries.SelectedIndexChanged += ExecuteNoSQLQuery;
            if (btnToPdf != null) btnToPdf.Click += BtnToPdf_Click;
        }

        private void Grid_DataBindingComplete(object sender, DataGridViewBindingCompleteEventArgs e)
        {
            var grid = sender as DataGridView;
            if (grid == null) return;

            if (!grid.Columns.Contains("NumCol"))
            {
                DataGridViewTextBoxColumn numCol = new DataGridViewTextBoxColumn();
                numCol.Name = "NumCol";
                numCol.HeaderText = "№";
                numCol.Width = 40;
                numCol.ReadOnly = true;
                grid.Columns.Insert(0, numCol);
            }
            grid.Columns["NumCol"].DisplayIndex = 0;

            foreach (DataGridViewRow row in grid.Rows)
                row.Cells["NumCol"].Value = row.Index + 1;
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            try
            {
                var client = new MongoClient(connectionString);
                db = client.GetDatabase(databaseName);

                collectionRoutes = db.GetCollection<Route>("routes");
                collectionClients = db.GetCollection<Client>("clients");
                collectionVouchers = db.GetCollection<Voucher>("vouchers");
                collectionEmployees = db.GetCollection<Employee>("employees");

                LoadAllData();
                LoadQueryList();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Помилка підключення до MongoDB: " + ex.Message);
            }
        }

        private void LoadAllData()
        {
            if (gridRoutes != null)
            {
                gridRoutes.DataSource = collectionRoutes.Find(_ => true).ToList();
                if (gridRoutes.Columns["Id"] != null) { gridRoutes.Columns["Id"].HeaderText = "Код маршруту"; gridRoutes.Columns["Id"].Width = 60; }
                if (gridRoutes.Columns["Country"] != null) gridRoutes.Columns["Country"].HeaderText = "Країна";
                if (gridRoutes.Columns["Climate"] != null) gridRoutes.Columns["Climate"].HeaderText = "Клімат";
                if (gridRoutes.Columns["Duration"] != null) gridRoutes.Columns["Duration"].HeaderText = "Тривалість (днів)";
                if (gridRoutes.Columns["Hotel"] != null) gridRoutes.Columns["Hotel"].HeaderText = "Готель";
                if (gridRoutes.Columns["Price"] != null) gridRoutes.Columns["Price"].HeaderText = "Вартість";
            }

            if (gridClients != null)
            {
                gridClients.DataSource = collectionClients.Find(_ => true).ToList();
                if (gridClients.Columns["Id"] != null) { gridClients.Columns["Id"].Visible = true; gridClients.Columns["Id"].HeaderText = "ID"; gridClients.Columns["Id"].Width = 40; }
                if (gridClients.Columns["LastName"] != null) gridClients.Columns["LastName"].HeaderText = "Прізвище";
                if (gridClients.Columns["FirstName"] != null) gridClients.Columns["FirstName"].HeaderText = "Ім'я";
                if (gridClients.Columns["MiddleName"] != null) gridClients.Columns["MiddleName"].HeaderText = "По батькові";
                if (gridClients.Columns["Address"] != null) gridClients.Columns["Address"].HeaderText = "Адреса";
                if (gridClients.Columns["Phone"] != null) gridClients.Columns["Phone"].HeaderText = "Телефон";
            }

            if (gridVouchers != null)
            {
                gridVouchers.DataSource = collectionVouchers.Find(_ => true).ToList();
                ConfigureVoucherGrid();
            }

            SetupComboBoxes();
        }

        private void SetupComboBoxes()
        {
            var clients = collectionClients.Find(_ => true).ToList();
            var employees = collectionEmployees.Find(_ => true).ToList();

            var searchClients = new List<Client>(clients);
            searchClients.Insert(0, new Client { Id = -1, LastName = "--- Всі клієнти ---" });

            if (cmbSearchVoucherClient != null)
            {
                cmbSearchVoucherClient.DataSource = searchClients;
                cmbSearchVoucherClient.DisplayMember = "LastName";
                cmbSearchVoucherClient.SelectedIndex = 0;
            }

            var searchEmployees = new List<Employee>(employees);
            searchEmployees.Insert(0, new Employee { Id = -1, FullName = "--- Всі співробітники ---" });

            if (cmbSearchVoucherEmployee != null)
            {
                cmbSearchVoucherEmployee.DataSource = searchEmployees;
                cmbSearchVoucherEmployee.DisplayMember = "FullName";
                cmbSearchVoucherEmployee.SelectedIndex = 0;
            }

            if (cmbAddVoucherClient != null) { cmbAddVoucherClient.DataSource = new List<Client>(clients); cmbAddVoucherClient.DisplayMember = "LastName"; cmbAddVoucherClient.SelectedIndex = -1; }
            if (cmbEditVoucherClient != null) { cmbEditVoucherClient.DataSource = new List<Client>(clients); cmbEditVoucherClient.DisplayMember = "LastName"; cmbEditVoucherClient.SelectedIndex = -1; }

            if (cmbAddVoucherEmployee != null) { cmbAddVoucherEmployee.DataSource = new List<Employee>(employees); cmbAddVoucherEmployee.DisplayMember = "FullName"; cmbAddVoucherEmployee.SelectedIndex = -1; }
            if (cmbEditVoucherEmployee != null) { cmbEditVoucherEmployee.DataSource = new List<Employee>(employees); cmbEditVoucherEmployee.DisplayMember = "FullName"; cmbEditVoucherEmployee.SelectedIndex = -1; }
        }

        private void ConfigureVoucherGrid()
        {
            if (gridVouchers == null) return;

            string[] colsToHide = { "ClientId", "EmployeeId" };
            foreach (var col in colsToHide)
                if (gridVouchers.Columns[col] != null) gridVouchers.Columns[col].Visible = false;

            if (gridVouchers.Columns["Id"] != null) { gridVouchers.Columns["Id"].Visible = true; gridVouchers.Columns["Id"].HeaderText = "Номер путівки"; }
            if (gridVouchers.Columns["RouteId"] != null) { gridVouchers.Columns["RouteId"].Visible = true; gridVouchers.Columns["RouteId"].HeaderText = "Код маршруту"; }
            if (gridVouchers.Columns["RouteCountry"] != null) gridVouchers.Columns["RouteCountry"].HeaderText = "Країна";
            if (gridVouchers.Columns["ClientName"] != null) gridVouchers.Columns["ClientName"].HeaderText = "Клієнт";
            if (gridVouchers.Columns["EmployeeName"] != null) gridVouchers.Columns["EmployeeName"].HeaderText = "Співробітник";
            if (gridVouchers.Columns["DepartureDate"] != null) gridVouchers.Columns["DepartureDate"].HeaderText = "Дата";
            if (gridVouchers.Columns["Quantity"] != null) gridVouchers.Columns["Quantity"].HeaderText = "К-сть";
            if (gridVouchers.Columns["Discount"] != null) gridVouchers.Columns["Discount"].HeaderText = "Знижка";
            if (gridVouchers.Columns["TotalCost"] != null) gridVouchers.Columns["TotalCost"].HeaderText = "Сума";
        }

        private int GetNextId<T>(IMongoCollection<T> collection)
        {
            var sort = Builders<T>.Sort.Descending("_id");
            var lastDoc = collection.Find(_ => true).Sort(sort).Limit(1).FirstOrDefault();
            if (lastDoc == null) return 1;
            var idProp = typeof(T).GetProperty("Id");
            int lastId = (int)idProp.GetValue(lastDoc);
            return lastId + 1;
        }

        private void UpdateRouteFilter(object sender, EventArgs e)
        {
            var builder = Builders<Route>.Filter;
            var filter = builder.Empty;

            if (txtSearchID != null && !string.IsNullOrWhiteSpace(txtSearchID.Text) && int.TryParse(txtSearchID.Text, out int id))
                filter &= builder.Eq(r => r.Id, id);

            if (txtSearchCountry != null && !string.IsNullOrWhiteSpace(txtSearchCountry.Text))
                filter &= builder.Regex(r => r.Country, new BsonRegularExpression(txtSearchCountry.Text, "i"));

            if (txtSearchClimate != null && !string.IsNullOrWhiteSpace(txtSearchClimate.Text))
                filter &= builder.Regex(r => r.Climate, new BsonRegularExpression(txtSearchClimate.Text, "i"));

            if (txtSearchHotel != null && !string.IsNullOrWhiteSpace(txtSearchHotel.Text))
                filter &= builder.Regex(r => r.Hotel, new BsonRegularExpression(txtSearchHotel.Text, "i"));

            if (txtSearchDuration != null && int.TryParse(txtSearchDuration.Text, out int dur))
                filter &= builder.Eq(r => r.Duration, dur);

            if (txtSearchPriceMin != null && decimal.TryParse(txtSearchPriceMin.Text, out decimal min))
                filter &= builder.Gte(r => r.Price, min);

            if (txtSearchPriceMax != null && decimal.TryParse(txtSearchPriceMax.Text, out decimal max))
                filter &= builder.Lte(r => r.Price, max);

            gridRoutes.DataSource = collectionRoutes.Find(filter).ToList();
            if (gridRoutes.Columns["Id"] != null) gridRoutes.Columns["Id"].HeaderText = "Код маршруту";
        }

        private void UpdateClientFilter(object sender, EventArgs e)
        {
            var builder = Builders<Client>.Filter;
            var filter = builder.Empty;

            if (txtSearchClientID != null && !string.IsNullOrWhiteSpace(txtSearchClientID.Text) && int.TryParse(txtSearchClientID.Text, out int id))
                filter &= builder.Eq(c => c.Id, id);

            if (txtSearchClientLastName != null && !string.IsNullOrWhiteSpace(txtSearchClientLastName.Text))
                filter &= builder.Regex(c => c.LastName, new BsonRegularExpression(txtSearchClientLastName.Text, "i"));

            if (txtSearchClientFirstName != null && !string.IsNullOrWhiteSpace(txtSearchClientFirstName.Text))
                filter &= builder.Regex(c => c.FirstName, new BsonRegularExpression(txtSearchClientFirstName.Text, "i"));

            if (txtSearchClientMiddleName != null && !string.IsNullOrWhiteSpace(txtSearchClientMiddleName.Text))
                filter &= builder.Regex(c => c.MiddleName, new BsonRegularExpression(txtSearchClientMiddleName.Text, "i"));

            if (txtSearchClientAddress != null && !string.IsNullOrWhiteSpace(txtSearchClientAddress.Text))
                filter &= builder.Regex(c => c.Address, new BsonRegularExpression(txtSearchClientAddress.Text, "i"));

            if (txtSearchClientPhone != null && !string.IsNullOrWhiteSpace(txtSearchClientPhone.Text))
                filter &= builder.Regex(c => c.Phone, new BsonRegularExpression(txtSearchClientPhone.Text, "i"));

            gridClients.DataSource = collectionClients.Find(filter).ToList();
            if (gridClients.Columns["Id"] != null) { gridClients.Columns["Id"].Visible = true; gridClients.Columns["Id"].HeaderText = "ID"; }
        }

        private void UpdateVoucherFilter(object sender, EventArgs e)
        {
            var builder = Builders<Voucher>.Filter;
            var filter = builder.Empty;

            if (txtSearchVoucherID != null && !string.IsNullOrWhiteSpace(txtSearchVoucherID.Text) && int.TryParse(txtSearchVoucherID.Text, out int vid))
                filter &= builder.Eq(v => v.Id, vid);

            if (txtSearchVoucherRouteID != null && !string.IsNullOrWhiteSpace(txtSearchVoucherRouteID.Text))
            {
                if (int.TryParse(txtSearchVoucherRouteID.Text, out int rid))
                    filter &= builder.Eq(v => v.RouteId, rid);
                else
                    filter &= builder.Regex(v => v.RouteCountry, new BsonRegularExpression(txtSearchVoucherRouteID.Text, "i"));
            }

            if (cmbSearchVoucherClient != null && cmbSearchVoucherClient.SelectedIndex > 0)
            {
                filter &= builder.Regex(v => v.ClientName, new BsonRegularExpression(cmbSearchVoucherClient.Text, "i"));
            }

            if (cmbSearchVoucherEmployee != null && cmbSearchVoucherEmployee.SelectedIndex > 0)
            {
                filter &= builder.Regex(v => v.EmployeeName, new BsonRegularExpression(cmbSearchVoucherEmployee.Text, "i"));
            }

            if (txtSearchVoucherQuantity != null && !string.IsNullOrWhiteSpace(txtSearchVoucherQuantity.Text) && int.TryParse(txtSearchVoucherQuantity.Text, out int qty))
                filter &= builder.Eq(v => v.Quantity, qty);

            if (txtSearchVoucherDiscountMin != null && decimal.TryParse(txtSearchVoucherDiscountMin.Text, out decimal min))
                filter &= builder.Gte(v => v.Discount, min);
            if (txtSearchVoucherDiscountMax != null && decimal.TryParse(txtSearchVoucherDiscountMax.Text, out decimal max))
                filter &= builder.Lte(v => v.Discount, max);

            if (txtSearchVoucherDate != null && DateTime.TryParse(txtSearchVoucherDate.Text, out DateTime date))
                filter &= builder.Eq(v => v.DepartureDate, date);

            gridVouchers.DataSource = collectionVouchers.Find(filter).ToList();
            ConfigureVoucherGrid();
        }

        private void BtnAddRoute_Click(object sender, EventArgs e)
        {
            try
            {
                var route = new Route
                {
                    Id = GetNextId(collectionRoutes),
                    Country = txtAddCountry.Text,
                    Climate = txtAddClimate.Text,
                    Hotel = txtAddHotel.Text,
                    Duration = int.TryParse(txtAddDuration.Text, out int d) ? d : 0,
                    Price = decimal.TryParse(txtAddPrice.Text, out decimal p) ? p : 0
                };
                collectionRoutes.InsertOne(route);
                MessageBox.Show($"Маршрут №{route.Id} додано!");
                LoadAllData();
                txtAddCountry.Clear(); txtAddClimate.Clear(); txtAddDuration.Clear(); txtAddHotel.Clear(); txtAddPrice.Clear();
            }
            catch (Exception ex) { MessageBox.Show("Помилка: " + ex.Message); }
        }

        private void BtnEditRoute_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtEditID.Text)) return;
            var filter = Builders<Route>.Filter.Eq(r => r.Id, int.Parse(txtEditID.Text));
            var update = Builders<Route>.Update
                .Set(r => r.Country, txtEditCountry.Text).Set(r => r.Climate, txtEditClimate.Text)
                .Set(r => r.Duration, int.Parse(txtEditDuration.Text)).Set(r => r.Hotel, txtEditHotel.Text)
                .Set(r => r.Price, decimal.Parse(txtEditPrice.Text));
            collectionRoutes.UpdateOne(filter, update);
            MessageBox.Show("Оновлено!"); LoadAllData();
        }

        private void BtnAddClient_Click(object sender, EventArgs e)
        {
            try
            {
                var client = new Client
                {
                    Id = GetNextId(collectionClients),
                    LastName = txtAddClientLastName.Text,
                    FirstName = txtAddClientFirstName.Text,
                    MiddleName = txtAddClientMiddleName.Text,
                    Address = txtAddClientAddress.Text,
                    Phone = txtAddClientPhone.Text
                };
                collectionClients.InsertOne(client);
                MessageBox.Show("Клієнта додано!"); LoadAllData();
                txtAddClientLastName.Clear(); txtAddClientFirstName.Clear(); txtAddClientMiddleName.Clear(); txtAddClientAddress.Clear(); txtAddClientPhone.Clear();
            }
            catch (Exception ex) { MessageBox.Show("Помилка: " + ex.Message); }
        }

        private void BtnEditClient_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtEditClientID.Text)) return;
            var filter = Builders<Client>.Filter.Eq(c => c.Id, int.Parse(txtEditClientID.Text));
            var update = Builders<Client>.Update
                .Set(c => c.LastName, txtEditClientLastName.Text).Set(c => c.FirstName, txtEditClientFirstName.Text)
                .Set(c => c.MiddleName, txtEditClientMiddleName.Text).Set(c => c.Address, txtEditClientAddress.Text)
                .Set(c => c.Phone, txtEditClientPhone.Text);
            collectionClients.UpdateOne(filter, update);
            MessageBox.Show("Оновлено!"); LoadAllData();
        }

        private void BtnAddVoucher_Click(object sender, EventArgs e)
        {
            try
            {
                var clientObj = cmbAddVoucherClient.SelectedItem as Client;
                var empObj = cmbAddVoucherEmployee.SelectedItem as Employee;
                string routeInput = txtAddVoucherRouteID.Text;

                Route existingRoute = null;
                if (int.TryParse(routeInput, out int rIdInput)) existingRoute = collectionRoutes.Find(r => r.Id == rIdInput).FirstOrDefault();
                if (existingRoute == null) existingRoute = collectionRoutes.Find(r => r.Country == routeInput).FirstOrDefault();

                int routeNum = existingRoute != null ? existingRoute.Id : 0;
                string routeName = existingRoute != null ? existingRoute.Country : routeInput;
                decimal price = existingRoute != null ? existingRoute.Price : 0;

                int qty = int.Parse(txtAddVoucherQuantity.Text);
                decimal disc = decimal.Parse(txtAddVoucherDiscount.Text);
                decimal total = (price * qty) - disc;
                if (total < 0) total = 0;

                var voucher = new Voucher
                {
                    Id = GetNextId(collectionVouchers),
                    ClientId = clientObj != null ? clientObj.Id : 0,
                    ClientName = clientObj?.LastName + " " + clientObj?.FirstName,
                    EmployeeId = empObj != null ? empObj.Id : 0,
                    EmployeeName = empObj?.FullName,
                    RouteId = routeNum,
                    RouteCountry = routeName,
                    DepartureDate = DateTime.Parse(txtAddVoucherDate.Text),
                    Quantity = qty,
                    Discount = disc,
                    TotalCost = total
                };
                collectionVouchers.InsertOne(voucher);
                MessageBox.Show($"Путівку оформлено! Сума: {total}"); LoadAllData();
            }
            catch (Exception ex) { MessageBox.Show("Помилка: " + ex.Message); }
        }

        private void BtnEditVoucher_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtEditVoucherID.Text)) return;
            try
            {
                string routeInput = txtEditVoucherRouteID.Text;
                int qty = int.Parse(txtEditVoucherQuantity.Text);
                decimal disc = decimal.Parse(txtEditVoucherDiscount.Text);

                Route existingRoute = null;
                if (int.TryParse(routeInput, out int rIdInput)) existingRoute = collectionRoutes.Find(r => r.Id == rIdInput).FirstOrDefault();
                if (existingRoute == null) existingRoute = collectionRoutes.Find(r => r.Country == routeInput).FirstOrDefault();

                int routeNum = existingRoute != null ? existingRoute.Id : 0;
                string routeName = existingRoute != null ? existingRoute.Country : routeInput;
                decimal price = existingRoute != null ? existingRoute.Price : 0;

                decimal newTotal = (price * qty) - disc;
                if (newTotal < 0) newTotal = 0;

                var filter = Builders<Voucher>.Filter.Eq(v => v.Id, int.Parse(txtEditVoucherID.Text));
                var update = Builders<Voucher>.Update
                    .Set(v => v.RouteId, routeNum)
                    .Set(v => v.RouteCountry, routeName)
                    .Set(v => v.EmployeeName, cmbEditVoucherEmployee.Text)
                    .Set(v => v.ClientName, cmbEditVoucherClient.Text)
                    .Set(v => v.DepartureDate, DateTime.Parse(txtEditVoucherDate.Text))
                    .Set(v => v.Quantity, qty)
                    .Set(v => v.Discount, disc)
                    .Set(v => v.TotalCost, newTotal);

                collectionVouchers.UpdateOne(filter, update);
                MessageBox.Show($"Оновлено! Нова вартість: {newTotal}");
                LoadAllData();
            }
            catch (Exception ex) { MessageBox.Show("Помилка: " + ex.Message); }
        }

        private void BtnDeleteVoucher_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtDeleteVoucherID.Text)) return;
            collectionVouchers.DeleteOne(v => v.Id == int.Parse(txtDeleteVoucherID.Text));
            LoadAllData();
            MessageBox.Show("Видалено!");
        }

        private void FillEditFields(DataGridView grid, DataGridViewCellEventArgs e, string type)
        {
            if (e.RowIndex < 0) return;
            var row = grid.Rows[e.RowIndex];

            if (type == "Route")
            {
                if (row.Cells["Id"].Value != null) txtEditID.Text = row.Cells["Id"].Value.ToString();
                if (row.Cells["Country"].Value != null) txtEditCountry.Text = row.Cells["Country"].Value.ToString();
                if (row.Cells["Climate"].Value != null) txtEditClimate.Text = row.Cells["Climate"].Value.ToString();
                if (row.Cells["Duration"].Value != null) txtEditDuration.Text = row.Cells["Duration"].Value.ToString();
                if (row.Cells["Hotel"].Value != null) txtEditHotel.Text = row.Cells["Hotel"].Value.ToString();
                if (row.Cells["Price"].Value != null) txtEditPrice.Text = row.Cells["Price"].Value.ToString();
            }
            else if (type == "Client")
            {
                if (row.Cells["Id"].Value != null) txtEditClientID.Text = row.Cells["Id"].Value.ToString();
                if (row.Cells["LastName"].Value != null) txtEditClientLastName.Text = row.Cells["LastName"].Value.ToString();
                if (row.Cells["FirstName"].Value != null) txtEditClientFirstName.Text = row.Cells["FirstName"].Value.ToString();
                if (row.Cells["MiddleName"].Value != null) txtEditClientMiddleName.Text = row.Cells["MiddleName"].Value.ToString();
                if (row.Cells["Address"].Value != null) txtEditClientAddress.Text = row.Cells["Address"].Value.ToString();
                if (row.Cells["Phone"].Value != null) txtEditClientPhone.Text = row.Cells["Phone"].Value.ToString();
            }
            else if (type == "Voucher")
            {
                if (row.Cells["Id"].Value != null) txtEditVoucherID.Text = row.Cells["Id"].Value.ToString();
                if (row.Cells["RouteId"].Value != null && row.Cells["RouteId"].Value.ToString() != "0")
                    txtEditVoucherRouteID.Text = row.Cells["RouteId"].Value.ToString();
                else if (row.Cells["RouteCountry"].Value != null)
                    txtEditVoucherRouteID.Text = row.Cells["RouteCountry"].Value.ToString();

                if (row.Cells["EmployeeName"].Value != null) cmbEditVoucherEmployee.Text = row.Cells["EmployeeName"].Value.ToString();
                if (row.Cells["ClientName"].Value != null) cmbEditVoucherClient.Text = row.Cells["ClientName"].Value.ToString();
                if (row.Cells["DepartureDate"].Value != null) txtEditVoucherDate.Text = ((DateTime)row.Cells["DepartureDate"].Value).ToString("yyyy-MM-dd");
                txtEditVoucherQuantity.Text = row.Cells["Quantity"].Value?.ToString();
                txtEditVoucherDiscount.Text = row.Cells["Discount"].Value?.ToString();
            }
        }

        private void ExecuteNoSQLQuery(object sender, EventArgs e)
        {
            if (cmbQueries.SelectedIndex == -1) return;
            object resultData = null;

            switch (cmbQueries.SelectedIndex)
            {
                case 0:
                    var q1 = collectionVouchers.AsQueryable().Join(collectionRoutes.AsQueryable(), v => v.RouteId, r => r.Id, (v, r) => new { r.Country, v.TotalCost })
                        .GroupBy(x => x.Country).Select(g => new { Країна = g.Key, Виторг = g.Sum(x => x.TotalCost) }).OrderByDescending(x => x.Виторг).Take(5).ToList();
                    resultData = q1; break;
                case 1:
                    var q2 = collectionVouchers.AsQueryable().GroupBy(v => v.RouteCountry).Select(g => new { Країна = g.Key, Путівок = g.Count() }).OrderByDescending(x => x.Путівок).Take(5).ToList();
                    resultData = q2; break;
                case 2:
                    var q3 = collectionVouchers.AsQueryable().GroupBy(v => v.EmployeeName).Select(g => new { Менеджер = g.Key, Продажі = g.Sum(v => v.TotalCost) }).OrderByDescending(x => x.Продажі).ToList();
                    resultData = q3; break;
                case 3:
                    var q4 = collectionVouchers.AsQueryable().GroupBy(v => v.EmployeeName).Select(g => new { Менеджер = g.Key, Кількість = g.Count() }).OrderByDescending(x => x.Кількість).ToList();
                    resultData = q4; break;
                case 4:
                    var q5 = collectionVouchers.AsQueryable().GroupBy(v => v.ClientName).Select(g => new { Клієнт = g.Key, Витрачено = g.Sum(v => v.TotalCost) }).OrderByDescending(x => x.Витрачено).Take(5).ToList();
                    resultData = q5; break;
                case 5:
                    var q6 = collectionRoutes.AsQueryable().GroupBy(r => r.Hotel).Select(g => new { Готель = g.Key, Ціна = g.Average(x => x.Price) }).OrderBy(x => x.Ціна).ToList();
                    resultData = q6; break;
                case 6:
                    decimal totalRev = collectionVouchers.AsQueryable().Sum(v => v.TotalCost);
                    resultData = new[] { new { Показник = "Загальний виторг", Сума = totalRev } }.ToList();
                    break;
                case 7:
                    decimal avgCheck = collectionVouchers.AsQueryable().Average(v => v.TotalCost);
                    resultData = new[] { new { Показник = "Середній чек", Сума = Math.Round(avgCheck, 2) } }.ToList();
                    break;
                case 8:
                    resultData = collectionVouchers.Find(v => v.Discount > 0).ToList().Select(v => new { v.ClientName, v.RouteCountry, Знижка = v.Discount, До_Сплати = v.TotalCost }).ToList();
                    break;
                case 9:
                    resultData = collectionVouchers.Find(v => v.DepartureDate > DateTime.Now).ToList().Select(v => new { v.ClientName, v.RouteCountry, Дата = v.DepartureDate.ToShortDateString() }).OrderBy(x => x.Дата).ToList();
                    break;
                case 10:
                    resultData = collectionVouchers.Find(v => v.DepartureDate <= DateTime.Now).ToList().Select(v => new { v.ClientName, v.RouteCountry, Дата = v.DepartureDate.ToShortDateString() }).OrderByDescending(x => x.Дата).ToList();
                    break;
                case 11:
                    resultData = collectionRoutes.Find(r => r.Price < 20000).ToList();
                    break;
                case 12:
                    resultData = collectionRoutes.Find(r => r.Price > 50000).ToList();
                    break;
                case 13:
                    var activeClients = collectionVouchers.AsQueryable().Select(v => v.ClientId).Distinct().ToList();
                    resultData = collectionClients.AsQueryable().Where(c => !activeClients.Contains(c.Id)).ToList();
                    break;
            }
            if (resultData != null) gridQueryResults.DataSource = resultData;
        }

        private void LoadQueryList()
        {
            if (cmbQueries == null) return;
            cmbQueries.Items.Clear();
            cmbQueries.Items.Add("1. Топ-5 країн за прибутком");
            cmbQueries.Items.Add("2. Топ-5 популярних країн");
            cmbQueries.Items.Add("3. Рейтинг менеджерів (Сума)");
            cmbQueries.Items.Add("4. Рейтинг менеджерів (Кількість)");
            cmbQueries.Items.Add("5. VIP-клієнти (Топ-5)");
            cmbQueries.Items.Add("6. Найпопулярніші готелі");
            cmbQueries.Items.Add("7. Фінансовий звіт: Загальний виторг");
            cmbQueries.Items.Add("8. Середній чек");
            cmbQueries.Items.Add("9. Путівки зі знижками");
            cmbQueries.Items.Add("10. Найближчі відправлення");
            cmbQueries.Items.Add("11. Архів поїздок");
            cmbQueries.Items.Add("12. Бюджетні тури (< 20 000)");
            cmbQueries.Items.Add("13. Преміум тури (> 50 000)");
            cmbQueries.Items.Add("14. Клієнти без покупок");
        }

        private void BtnToPdf_Click(object sender, EventArgs e)
        {
            if (gridQueryResults.Rows.Count == 0) return;
            SaveFileDialog sfd = new SaveFileDialog { Filter = "PDF|*.pdf", FileName = "Report.pdf" };
            if (sfd.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    Document doc = new Document(PageSize.A4.Rotate());
                    PdfWriter.GetInstance(doc, new FileStream(sfd.FileName, FileMode.Create));
                    doc.Open();
                    string fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "ARIAL.TTF");
                    BaseFont bf = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
                    iTextSharp.text.Font font = new iTextSharp.text.Font(bf, 10, iTextSharp.text.Font.NORMAL);
                    doc.Add(new Paragraph($"Звіт: {cmbQueries.Text}", font));
                    PdfPTable table = new PdfPTable(gridQueryResults.Columns.Count);
                    foreach (DataGridViewColumn col in gridQueryResults.Columns) table.AddCell(new Phrase(col.HeaderText, font));
                    foreach (DataGridViewRow row in gridQueryResults.Rows)
                        if (!row.IsNewRow) foreach (DataGridViewCell cell in row.Cells) table.AddCell(new Phrase(cell.Value?.ToString(), font));
                    doc.Add(table);
                    doc.Close();
                    Process.Start(sfd.FileName);
                }
                catch (Exception ex) { MessageBox.Show("PDF Error: " + ex.Message); }
            }
        }
    }

    public class Route
    {
        [BsonId] public int Id { get; set; }
        public string Country { get; set; }
        public string Climate { get; set; }
        public int Duration { get; set; }
        public string Hotel { get; set; }
        public decimal Price { get; set; }
    }

    public class Client
    {
        [BsonId] public int Id { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
    }

    public class Voucher
    {
        [BsonId] public int Id { get; set; }
        public int RouteId { get; set; }
        public string RouteCountry { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public DateTime DepartureDate { get; set; }
        public int Quantity { get; set; }
        public decimal Discount { get; set; }
        public decimal TotalCost { get; set; }
    }

    public class Employee
    {
        [BsonId] public int Id { get; set; }
        public string FullName { get; set; }
        public string Position { get; set; }
        public string Phone { get; set; }
    }
}