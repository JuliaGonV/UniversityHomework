using System;
using System.Data;
using System.Data.SqlClient;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace BD_1_2
{
    public partial class Form1 : Form
    {
        string connectionString = @"Server=.;Database=TravelAgency;Trusted_Connection=True;";

        SqlDataAdapter adapterRoutes, adapterClients, adapterVouchers;
        DataTable dtRoutes, dtClients, dtVouchers;

        public Form1()
        {
            InitializeComponent();
            this.Load += Form1_Load;

            // --- МАРШРУТЫ ---
            if (btnAddRoute != null) btnAddRoute.Click += BtnAddRoute_Click;
            if (btnEditRoute != null) btnEditRoute.Click += BtnEditRoute_Click;
            if (gridRoutes != null) gridRoutes.CellClick += GridRoutes_CellClick;

            if (txtSearchID != null) txtSearchID.TextChanged += UpdateRouteFilter;
            if (txtSearchCountry != null) txtSearchCountry.TextChanged += UpdateRouteFilter;
            if (txtSearchClimate != null) txtSearchClimate.TextChanged += UpdateRouteFilter;
            if (txtSearchDuration != null) txtSearchDuration.TextChanged += UpdateRouteFilter;
            if (txtSearchHotel != null) txtSearchHotel.TextChanged += UpdateRouteFilter;
            if (txtSearchPriceMin != null) txtSearchPriceMin.TextChanged += UpdateRouteFilter;
            if (txtSearchPriceMax != null) txtSearchPriceMax.TextChanged += UpdateRouteFilter;

            // --- КЛИЕНТЫ ---
            if (btnAddClient != null) btnAddClient.Click += BtnAddClient_Click;
            if (btnEditClient != null) btnEditClient.Click += BtnEditClient_Click;
            if (gridClients != null) gridClients.CellClick += GridClients_CellClick;

            if (txtSearchClientID != null) txtSearchClientID.TextChanged += UpdateClientFilter;
            if (txtSearchClientLastName != null) txtSearchClientLastName.TextChanged += UpdateClientFilter;
            if (txtSearchClientFirstName != null) txtSearchClientFirstName.TextChanged += UpdateClientFilter;
            if (txtSearchClientMiddleName != null) txtSearchClientMiddleName.TextChanged += UpdateClientFilter;
            if (txtSearchClientAddress != null) txtSearchClientAddress.TextChanged += UpdateClientFilter;
            if (txtSearchClientPhone != null) txtSearchClientPhone.TextChanged += UpdateClientFilter;

            // --- ПУТЕВКИ ---
            if (btnAddVoucher != null) btnAddVoucher.Click += BtnAddVoucher_Click;
            if (btnEditVoucher != null) btnEditVoucher.Click += BtnEditVoucher_Click;
            if (btnDeleteVoucher != null) btnDeleteVoucher.Click += BtnDeleteVoucher_Click;
            if (gridVouchers != null) gridVouchers.CellClick += GridVouchers_CellClick;

            if (txtSearchVoucherID != null) txtSearchVoucherID.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherRouteID != null) txtSearchVoucherRouteID.TextChanged += UpdateVoucherFilter;
            if (cmbSearchVoucherClient != null) cmbSearchVoucherClient.SelectedIndexChanged += UpdateVoucherFilter;
            if (txtSearchVoucherDate != null) txtSearchVoucherDate.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherQuantity != null) txtSearchVoucherQuantity.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherDiscountMin != null) txtSearchVoucherDiscountMin.TextChanged += UpdateVoucherFilter;
            if (txtSearchVoucherDiscountMax != null) txtSearchVoucherDiscountMax.TextChanged += UpdateVoucherFilter;

            // --- АНАЛИТИКА ---
            if (cmbQueries != null)
            {
                cmbQueries.SelectedIndexChanged += ExecuteSelectedQuery;
            }

            // Кнопка для PDF
            if (btnToPdf != null) btnToPdf.Click += BtnToPdf_Click;
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            LoadAllData();
            LoadQueryList();
        }

        private void LoadAllData()
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();

                    adapterRoutes = new SqlDataAdapter("SELECT * FROM Routes", conn);
                    dtRoutes = new DataTable();
                    adapterRoutes.Fill(dtRoutes);
                    if (gridRoutes != null) gridRoutes.DataSource = dtRoutes;

                    adapterClients = new SqlDataAdapter("SELECT * FROM Clients", conn);
                    dtClients = new DataTable();
                    adapterClients.Fill(dtClients);
                    if (gridClients != null) gridClients.DataSource = dtClients;

                    string sqlVouchers = @"
                        SELECT 
                            v.VoucherID, v.RouteID, v.ClientID,     
                            r.Country AS [Країна], 
                            c.LastName + ' ' + Substring(c.FirstName, 1, 1) + '.' AS [Клієнт],
                            v.DepartureDate AS [Дата], v.Quantity AS [К-сть], v.Discount AS [Знижка], v.TotalCost AS [Сума]
                        FROM Vouchers v
                        JOIN Routes r ON v.RouteID = r.RouteID
                        JOIN Clients c ON v.ClientID = c.ClientID";

                    adapterVouchers = new SqlDataAdapter(sqlVouchers, conn);
                    dtVouchers = new DataTable();
                    adapterVouchers.Fill(dtVouchers);
                    if (gridVouchers != null)
                    {
                        gridVouchers.DataSource = dtVouchers;
                        if (gridVouchers.Columns["RouteID"] != null)
                        {
                            gridVouchers.Columns["RouteID"].Visible = true;
                            gridVouchers.Columns["RouteID"].HeaderText = "Код маршруту";
                            gridVouchers.Columns["RouteID"].DisplayIndex = 1;
                        }
                        if (gridVouchers.Columns["ClientID"] != null) gridVouchers.Columns["ClientID"].Visible = false;
                        if (gridVouchers.Columns["Сума"] != null) gridVouchers.Columns["Сума"].DefaultCellStyle.Format = "N2";
                        if (gridVouchers.Columns["Знижка"] != null) gridVouchers.Columns["Знижка"].DefaultCellStyle.Format = "N2";
                    }

                    if (cmbAddVoucherClient != null) SetupComboBox(cmbAddVoucherClient);
                    if (cmbEditVoucherClient != null) SetupComboBox(cmbEditVoucherClient);
                    if (cmbSearchVoucherClient != null) SetupSearchComboBox(cmbSearchVoucherClient);
                }
            }
            catch (Exception ex) { MessageBox.Show("Помилка завантаження: " + ex.Message); }
        }

        #region --- ЗАПИТИ (QUERIES) ---

        private void LoadQueryList()
        {
            if (cmbQueries == null) return;
            cmbQueries.Items.Clear();

            // Агрегатні
            cmbQueries.Items.Add("1. Рейтинг країн за прибутком");
            cmbQueries.Items.Add("2. Популярність напрямків");
            cmbQueries.Items.Add("3. Середній чек по клімату");
            cmbQueries.Items.Add("4. Активність клієнтів");
            cmbQueries.Items.Add("5. Ціновий діапазон турів");
            cmbQueries.Items.Add("6. Звіт по знижках");
            cmbQueries.Items.Add("7. Пропозиції по готелях");

            // Складні
            cmbQueries.Items.Add("8. Преміум тури (> середнього)");
            cmbQueries.Items.Add("9. Клієнти без замовлень");
            cmbQueries.Items.Add("10. Гарячі пропозиції (Довго і дешево)");
            cmbQueries.Items.Add("11. VIP-клієнти");
            cmbQueries.Items.Add("12. Непродані маршрути");
            cmbQueries.Items.Add("13. Сімейні замовлення (3+ ос.)");
            cmbQueries.Items.Add("14. Літній сезон (Черв-Серп)");

            cmbQueries.SelectedIndex = -1;
        }

        private void ExecuteSelectedQuery(object sender, EventArgs e)
        {
            if (cmbQueries == null || gridQueryResults == null || cmbQueries.SelectedIndex == -1) return;

            string sql = "";

            switch (cmbQueries.SelectedIndex)
            {
                case 0:
                    sql = @"SELECT r.Country AS [Країна], SUM(v.TotalCost) AS [Загальний прибуток], COUNT(v.VoucherID) AS [Угод]
                            FROM Vouchers v JOIN Routes r ON v.RouteID = r.RouteID
                            GROUP BY r.Country ORDER BY [Загальний прибуток] DESC";
                    break;
                case 1:
                    sql = @"SELECT r.Country AS [Країна], SUM(v.Quantity) AS [Всього туристів]
                            FROM Vouchers v JOIN Routes r ON v.RouteID = r.RouteID
                            GROUP BY r.Country ORDER BY [Всього туристів] DESC";
                    break;
                case 2:
                    sql = @"SELECT Climate AS [Тип клімату], AVG(Price) AS [Середня ціна туру], COUNT(RouteID) AS [К-сть маршрутів]
                            FROM Routes GROUP BY Climate";
                    break;
                case 3:
                    sql = @"SELECT c.LastName + ' ' + c.FirstName AS [Клієнт], COUNT(v.VoucherID) AS [К-сть поїздок], SUM(v.TotalCost) AS [Всього витрачено]
                            FROM Clients c JOIN Vouchers v ON c.ClientID = v.ClientID
                            GROUP BY c.LastName, c.FirstName ORDER BY [Всього витрачено] DESC";
                    break;
                case 4:
                    sql = @"SELECT Country AS [Країна], MIN(Price) AS [Найдешевший], MAX(Price) AS [Найдорожчий], AVG(Price) AS [Середній]
                            FROM Routes GROUP BY Country";
                    break;
                case 5:
                    sql = @"SELECT c.LastName AS [Клієнт], SUM(v.Discount) AS [Всього знижки], AVG(v.Discount) AS [Сер. знижка]
                            FROM Vouchers v JOIN Clients c ON v.ClientID = c.ClientID
                            GROUP BY c.LastName HAVING SUM(v.Discount) > 0";
                    break;
                case 6:
                    sql = @"SELECT Hotel AS [Категорія готелю], COUNT(RouteID) AS [Доступно маршрутів], AVG(Price) AS [Сер. вартість]
                            FROM Routes GROUP BY Hotel";
                    break;
                case 7:
                    sql = @"SELECT * FROM Routes WHERE Price > (SELECT AVG(Price) FROM Routes)";
                    break;
                case 8:
                    sql = @"SELECT * FROM Clients WHERE ClientID NOT IN (SELECT DISTINCT ClientID FROM Vouchers)";
                    break;
                case 9:
                    sql = @"SELECT * FROM Routes WHERE Duration > 7 AND Price < (SELECT AVG(Price) FROM Routes)";
                    break;
                case 10:
                    sql = @"SELECT c.LastName, c.Phone, SUM(v.TotalCost) as [Всього витрачено]
                            FROM Clients c JOIN Vouchers v ON c.ClientID = v.ClientID
                            GROUP BY c.LastName, c.Phone
                            HAVING SUM(v.TotalCost) > (SELECT AVG(TotalCost) FROM Vouchers)";
                    break;
                case 11:
                    sql = @"SELECT * FROM Routes WHERE RouteID NOT IN (SELECT DISTINCT RouteID FROM Vouchers)";
                    break;
                case 12:
                    sql = @"SELECT v.VoucherID, r.Country, c.LastName, v.Quantity AS [Осіб], v.TotalCost
                            FROM Vouchers v JOIN Routes r ON v.RouteID = r.RouteID
                            JOIN Clients c ON v.ClientID = c.ClientID
                            WHERE v.Quantity >= 3";
                    break;
                case 13:
                    sql = @"SELECT v.VoucherID, r.Country, v.DepartureDate, v.TotalCost 
                            FROM Vouchers v JOIN Routes r ON v.RouteID = r.RouteID 
                            WHERE MONTH(v.DepartureDate) IN (6, 7, 8)";
                    break;
            }

            if (!string.IsNullOrEmpty(sql))
            {
                try
                {
                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        conn.Open();
                        SqlDataAdapter da = new SqlDataAdapter(sql, conn);
                        DataTable dt = new DataTable();
                        da.Fill(dt);
                        gridQueryResults.DataSource = dt;
                        gridQueryResults.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
                    }
                }
                catch (Exception ex) { MessageBox.Show("Помилка виконання: " + ex.Message); }
            }
        }

        // --- ГЕНЕРАЦІЯ PDF ЧЕРЕЗ ITEXTSHARP ---
        private void BtnToPdf_Click(object sender, EventArgs e)
        {
            if (gridQueryResults.Rows.Count == 0)
            {
                MessageBox.Show("Немає даних для експорту.", "Помилка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            SaveFileDialog sfd = new SaveFileDialog();
            sfd.Filter = "PDF Files (*.pdf)|*.pdf";
            sfd.FileName = "Звіт_Турагенція.pdf";

            if (sfd.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    // Шлях до шрифту (обов'язково для кирилиці!)
                    string fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "ARIAL.TTF");
                    BaseFont bf = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);

                    // Шрифти
                    iTextSharp.text.Font headerFont = new iTextSharp.text.Font(bf, 10, iTextSharp.text.Font.BOLD);
                    iTextSharp.text.Font cellFont = new iTextSharp.text.Font(bf, 9, iTextSharp.text.Font.NORMAL);
                    iTextSharp.text.Font titleFont = new iTextSharp.text.Font(bf, 14, iTextSharp.text.Font.BOLD);

                    // Створюємо документ
                    Document doc = new Document(PageSize.A4.Rotate(), 20, 20, 20, 20);
                    PdfWriter.GetInstance(doc, new FileStream(sfd.FileName, FileMode.Create));

                    doc.Open();

                    // Заголовок
                    Paragraph title = new Paragraph($"Звіт: {cmbQueries.Text}", titleFont);
                    title.Alignment = Element.ALIGN_CENTER;
                    title.SpacingAfter = 20f;
                    doc.Add(title);

                    // Таблиця
                    PdfPTable table = new PdfPTable(gridQueryResults.Columns.Count);
                    table.WidthPercentage = 100;

                    // Заголовки стовпців
                    foreach (DataGridViewColumn column in gridQueryResults.Columns)
                    {
                        PdfPCell cell = new PdfPCell(new Phrase(column.HeaderText, headerFont));
                        cell.HorizontalAlignment = Element.ALIGN_CENTER;
                        cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                        cell.BackgroundColor = iTextSharp.text.BaseColor.LIGHT_GRAY;
                        cell.Padding = 5;
                        table.AddCell(cell);
                    }

                    // Дані
                    foreach (DataGridViewRow row in gridQueryResults.Rows)
                    {
                        if (row.IsNewRow) continue;
                        foreach (DataGridViewCell cell in row.Cells)
                        {
                            string cellValue = cell.Value?.ToString() ?? "";
                            PdfPCell dataCell = new PdfPCell(new Phrase(cellValue, cellFont));
                            dataCell.Padding = 3;
                            table.AddCell(dataCell);
                        }
                    }

                    doc.Add(table);

                    // Футер
                    Paragraph footer = new Paragraph($"\nДата формування: {DateTime.Now}", cellFont);
                    footer.Alignment = Element.ALIGN_RIGHT;
                    doc.Add(footer);

                    doc.Close();

                    MessageBox.Show("Звіт успішно збережено у PDF!", "Успіх", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Помилка збереження у PDF: {ex.Message}\nПереконайтеся, що файл не відкрито.", "Помилка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        #endregion

        // --- ДОПОМІЖНІ МЕТОДИ ---
        private void SetupComboBox(ComboBox cmb)
        {
            cmb.DataSource = new BindingSource(dtClients, null); cmb.DisplayMember = "LastName"; cmb.ValueMember = "ClientID"; cmb.SelectedIndex = -1;
        }
        private void SetupSearchComboBox(ComboBox cmb)
        {
            DataTable dt = new DataTable(); dt.Columns.Add("ClientID", typeof(int)); dt.Columns.Add("LastName", typeof(string));
            dt.Rows.Add(-1, "--- Всі ---");
            foreach (DataRow r in dtClients.Rows) dt.Rows.Add(r["ClientID"], r["LastName"]);
            cmb.DataSource = dt; cmb.DisplayMember = "LastName"; cmb.ValueMember = "ClientID"; cmb.SelectedValue = -1;
        }
        private decimal CalculateTotalCost(int rId, int q, decimal d)
        {
            DataRow[] rows = dtRoutes.Select("RouteID = " + rId);
            if (rows.Length > 0) return (Convert.ToDecimal(rows[0]["Price"]) * q) - d;
            return 0;
        }

        private void BtnAddRoute_Click(object sender, EventArgs e)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = @"INSERT INTO Routes (Country, Climate, Duration, Hotel, Price) VALUES (@C, @Cl, @D, @H, @P)";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@C", txtAddCountry.Text);
                    cmd.Parameters.AddWithValue("@Cl", txtAddClimate.Text);
                    cmd.Parameters.AddWithValue("@D", int.Parse(txtAddDuration.Text));
                    cmd.Parameters.AddWithValue("@H", txtAddHotel.Text);
                    cmd.Parameters.AddWithValue("@P", decimal.Parse(txtAddPrice.Text));
                    cmd.ExecuteNonQuery();
                    MessageBox.Show("Маршрут додано!"); LoadAllData();
                    txtAddCountry.Clear(); txtAddClimate.Clear(); txtAddDuration.Clear(); txtAddHotel.Clear(); txtAddPrice.Clear();
                }
            }
            catch (Exception ex) { MessageBox.Show(ex.Message); }
        }

        private void BtnEditRoute_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtEditID.Text)) return;
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = @"UPDATE Routes SET Country=@C, Climate=@Cl, Duration=@D, Hotel=@H, Price=@P WHERE RouteID=@ID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@ID", int.Parse(txtEditID.Text));
                    cmd.Parameters.AddWithValue("@C", txtEditCountry.Text);
                    cmd.Parameters.AddWithValue("@Cl", txtEditClimate.Text);
                    cmd.Parameters.AddWithValue("@D", int.Parse(txtEditDuration.Text));
                    cmd.Parameters.AddWithValue("@H", txtEditHotel.Text);
                    cmd.Parameters.AddWithValue("@P", decimal.Parse(txtEditPrice.Text));
                    cmd.ExecuteNonQuery();
                    MessageBox.Show("Оновлено!"); LoadAllData();
                }
            }
            catch (Exception ex) { MessageBox.Show(ex.Message); }
        }

        private void GridRoutes_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow row = gridRoutes.Rows[e.RowIndex];
                txtEditID.Text = row.Cells["RouteID"].Value.ToString();
                txtEditCountry.Text = row.Cells["Country"].Value.ToString();
                txtEditClimate.Text = row.Cells["Climate"].Value.ToString();
                txtEditDuration.Text = row.Cells["Duration"].Value.ToString();
                txtEditHotel.Text = row.Cells["Hotel"].Value.ToString();
                txtEditPrice.Text = row.Cells["Price"].Value.ToString();
            }
        }

        private void UpdateRouteFilter(object sender, EventArgs e)
        {
            if (dtRoutes == null) return;
            try
            {
                List<string> filters = new List<string>();
                if (!string.IsNullOrWhiteSpace(txtSearchID.Text)) filters.Add($"Convert(RouteID, 'System.String') LIKE '%{txtSearchID.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchCountry.Text)) filters.Add($"Country LIKE '%{txtSearchCountry.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchClimate.Text)) filters.Add($"Climate LIKE '%{txtSearchClimate.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchDuration.Text)) filters.Add($"Convert(Duration, 'System.String') LIKE '%{txtSearchDuration.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchHotel.Text)) filters.Add($"Hotel LIKE '%{txtSearchHotel.Text}%'");
                if (decimal.TryParse(txtSearchPriceMin.Text, out decimal min)) filters.Add($"Price >= {min.ToString(CultureInfo.InvariantCulture)}");
                if (decimal.TryParse(txtSearchPriceMax.Text, out decimal max)) filters.Add($"Price <= {max.ToString(CultureInfo.InvariantCulture)}");
                dtRoutes.DefaultView.RowFilter = filters.Count > 0 ? string.Join(" AND ", filters) : "";
            }
            catch { }
        }

        private void BtnAddClient_Click(object sender, EventArgs e)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = @"INSERT INTO Clients (LastName, FirstName, MiddleName, Address, Phone) VALUES (@Ln, @Fn, @Mn, @Ad, @Ph)";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@Ln", txtAddClientLastName.Text);
                    cmd.Parameters.AddWithValue("@Fn", txtAddClientFirstName.Text);
                    cmd.Parameters.AddWithValue("@Mn", txtAddClientMiddleName.Text);
                    cmd.Parameters.AddWithValue("@Ad", txtAddClientAddress.Text);
                    cmd.Parameters.AddWithValue("@Ph", txtAddClientPhone.Text);
                    cmd.ExecuteNonQuery();
                    MessageBox.Show("Клієнта додано!"); LoadAllData();
                    txtAddClientLastName.Clear(); txtAddClientFirstName.Clear(); txtAddClientMiddleName.Clear(); txtAddClientAddress.Clear(); txtAddClientPhone.Clear();
                }
            }
            catch (Exception ex) { MessageBox.Show(ex.Message); }
        }

        private void BtnEditClient_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtEditClientID.Text)) return;
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = @"UPDATE Clients SET LastName=@Ln, FirstName=@Fn, MiddleName=@Mn, Address=@Ad, Phone=@Ph WHERE ClientID=@ID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@ID", int.Parse(txtEditClientID.Text));
                    cmd.Parameters.AddWithValue("@Ln", txtEditClientLastName.Text);
                    cmd.Parameters.AddWithValue("@Fn", txtEditClientFirstName.Text);
                    cmd.Parameters.AddWithValue("@Mn", txtEditClientMiddleName.Text);
                    cmd.Parameters.AddWithValue("@Ad", txtEditClientAddress.Text);
                    cmd.Parameters.AddWithValue("@Ph", txtEditClientPhone.Text);
                    cmd.ExecuteNonQuery();
                    MessageBox.Show("Оновлено!"); LoadAllData();
                }
            }
            catch (Exception ex) { MessageBox.Show(ex.Message); }
        }

        private void GridClients_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow row = gridClients.Rows[e.RowIndex];
                txtEditClientID.Text = row.Cells["ClientID"].Value.ToString();
                txtEditClientLastName.Text = row.Cells["LastName"].Value.ToString();
                txtEditClientFirstName.Text = row.Cells["FirstName"].Value.ToString();
                txtEditClientMiddleName.Text = row.Cells["MiddleName"].Value.ToString();
                txtEditClientAddress.Text = row.Cells["Address"].Value.ToString();
                txtEditClientPhone.Text = row.Cells["Phone"].Value.ToString();
            }
        }

        private void UpdateClientFilter(object sender, EventArgs e)
        {
            if (dtClients == null) return;
            try
            {
                List<string> filters = new List<string>();
                if (!string.IsNullOrWhiteSpace(txtSearchClientID.Text)) filters.Add($"Convert(ClientID, 'System.String') LIKE '%{txtSearchClientID.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchClientLastName.Text)) filters.Add($"LastName LIKE '%{txtSearchClientLastName.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchClientFirstName.Text)) filters.Add($"FirstName LIKE '%{txtSearchClientFirstName.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchClientMiddleName.Text)) filters.Add($"MiddleName LIKE '%{txtSearchClientMiddleName.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchClientAddress.Text)) filters.Add($"Address LIKE '%{txtSearchClientAddress.Text}%'");
                if (!string.IsNullOrWhiteSpace(txtSearchClientPhone.Text)) filters.Add($"Phone LIKE '%{txtSearchClientPhone.Text}%'");
                dtClients.DefaultView.RowFilter = filters.Count > 0 ? string.Join(" AND ", filters) : "";
            }
            catch { }
        }

        private void BtnAddVoucher_Click(object sender, EventArgs e)
        {
            try
            {
                int routeID = int.Parse(txtAddVoucherRouteID.Text);
                int clientID = (int)cmbAddVoucherClient.SelectedValue;
                string date = txtAddVoucherDate.Text;
                int qty = int.Parse(txtAddVoucherQuantity.Text);
                decimal discount = decimal.Parse(txtAddVoucherDiscount.Text);
                decimal totalCost = CalculateTotalCost(routeID, qty, discount);

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = @"INSERT INTO Vouchers (RouteID, ClientID, DepartureDate, Quantity, Discount, TotalCost) VALUES (@R, @C, @D, @Q, @Disc, @Total)";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@R", routeID);
                    cmd.Parameters.AddWithValue("@C", clientID);
                    cmd.Parameters.AddWithValue("@D", DateTime.Parse(date));
                    cmd.Parameters.AddWithValue("@Q", qty);
                    cmd.Parameters.AddWithValue("@Disc", discount);
                    cmd.Parameters.AddWithValue("@Total", totalCost);
                    cmd.ExecuteNonQuery();
                    MessageBox.Show($"Оформлено! Сума: {totalCost}"); LoadAllData();
                }
            }
            catch (Exception ex) { MessageBox.Show(ex.Message); }
        }

        private void BtnEditVoucher_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtEditVoucherID.Text)) return;
            try
            {
                int routeID = int.Parse(txtEditVoucherRouteID.Text);
                int qty = int.Parse(txtEditVoucherQuantity.Text);
                decimal discount = decimal.Parse(txtEditVoucherDiscount.Text);
                decimal totalCost = CalculateTotalCost(routeID, qty, discount);

                using (SqlConnection conn = new SqlConnection(connectionString))
                {
                    conn.Open();
                    string query = @"UPDATE Vouchers SET RouteID=@R, ClientID=@C, DepartureDate=@D, Quantity=@Q, Discount=@Disc, TotalCost=@Total WHERE VoucherID=@ID";
                    SqlCommand cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@ID", int.Parse(txtEditVoucherID.Text));
                    cmd.Parameters.AddWithValue("@R", routeID);
                    cmd.Parameters.AddWithValue("@C", cmbEditVoucherClient.SelectedValue);
                    cmd.Parameters.AddWithValue("@D", DateTime.Parse(txtEditVoucherDate.Text));
                    cmd.Parameters.AddWithValue("@Q", qty);
                    cmd.Parameters.AddWithValue("@Disc", discount);
                    cmd.Parameters.AddWithValue("@Total", totalCost);
                    cmd.ExecuteNonQuery();
                    MessageBox.Show("Збережено!"); LoadAllData();
                }
            }
            catch (Exception ex) { MessageBox.Show(ex.Message); }
        }

        private void BtnDeleteVoucher_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtDeleteVoucherID.Text)) return;
            if (MessageBox.Show("Видалити?", "Увага", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                try
                {
                    using (SqlConnection conn = new SqlConnection(connectionString))
                    {
                        conn.Open();
                        SqlCommand cmd = new SqlCommand("DELETE FROM Vouchers WHERE VoucherID=@ID", conn);
                        cmd.Parameters.AddWithValue("@ID", int.Parse(txtDeleteVoucherID.Text));
                        cmd.ExecuteNonQuery();
                        LoadAllData();
                        txtDeleteVoucherID.Clear();
                    }
                }
                catch (Exception ex) { MessageBox.Show(ex.Message); }
            }
        }

        private void GridVouchers_CellClick(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                DataGridViewRow row = gridVouchers.Rows[e.RowIndex];
                txtEditVoucherID.Text = row.Cells["VoucherID"].Value.ToString();
                txtDeleteVoucherID.Text = row.Cells["VoucherID"].Value.ToString();
                txtEditVoucherRouteID.Text = row.Cells["RouteID"].Value.ToString();

                if (row.Cells["ClientID"].Value != DBNull.Value)
                    cmbEditVoucherClient.SelectedValue = row.Cells["ClientID"].Value;

                if (row.Cells["Дата"].Value != DBNull.Value)
                    txtEditVoucherDate.Text = ((DateTime)row.Cells["Дата"].Value).ToString("yyyy-MM-dd");

                txtEditVoucherQuantity.Text = row.Cells["К-сть"].Value.ToString();
                txtEditVoucherDiscount.Text = row.Cells["Знижка"].Value.ToString();
            }
        }

        private void UpdateVoucherFilter(object sender, EventArgs e)
        {
            if (dtVouchers == null) return;
            try
            {
                List<string> filters = new List<string>();
                if (!string.IsNullOrWhiteSpace(txtSearchVoucherID.Text))
                    filters.Add($"Convert(VoucherID, 'System.String') LIKE '%{txtSearchVoucherID.Text}%'");

                if (!string.IsNullOrWhiteSpace(txtSearchVoucherRouteID.Text))
                    filters.Add($"Convert(RouteID, 'System.String') LIKE '%{txtSearchVoucherRouteID.Text}%'");

                if (cmbSearchVoucherClient.SelectedIndex != -1 && cmbSearchVoucherClient.SelectedValue != null)
                {
                    if (int.TryParse(cmbSearchVoucherClient.SelectedValue.ToString(), out int selectedId) && selectedId != -1)
                    {
                        filters.Add($"Convert(ClientID, 'System.String') LIKE '{selectedId}'");
                    }
                }

                if (!string.IsNullOrWhiteSpace(txtSearchVoucherDate.Text))
                    filters.Add($"Convert([Дата], 'System.String') LIKE '%{txtSearchVoucherDate.Text}%'");

                if (!string.IsNullOrWhiteSpace(txtSearchVoucherQuantity.Text))
                    filters.Add($"Convert([К-сть], 'System.String') LIKE '%{txtSearchVoucherQuantity.Text}%'");

                if (decimal.TryParse(txtSearchVoucherDiscountMin.Text, out decimal minDisc))
                    filters.Add($"[Знижка] >= {minDisc.ToString(CultureInfo.InvariantCulture)}");

                if (decimal.TryParse(txtSearchVoucherDiscountMax.Text, out decimal maxDisc))
                    filters.Add($"[Знижка] <= {maxDisc.ToString(CultureInfo.InvariantCulture)}");

                dtVouchers.DefaultView.RowFilter = filters.Count > 0 ? string.Join(" AND ", filters) : "";
            }
            catch { }
        }
    }
}