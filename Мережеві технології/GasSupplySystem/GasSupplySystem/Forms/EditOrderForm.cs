using GasSupplySystem.Models;
using GasSupplySystem.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace GasSupplySystem.Forms
{
    public partial class EditOrderForm : Form
    {
        ComboBox cmbCustomer = new ComboBox();
        NumericUpDown numVolume = new NumericUpDown();
        DateTimePicker dtDelivery = new DateTimePicker();
        Button btnSave = new Button();
        Button btnCancel = new Button();

        private User _user;
        private int _orderId;

        public EditOrderForm(int orderId, User user, GasOrder order)
        {
            _user = user;
            _orderId = orderId;

            Text = "Змніити замовлення";
            Width = 300;
            Height = 230;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            StartPosition = FormStartPosition.CenterParent;

            Label lblCustomer = new Label { Text = "Замовник", Left = 20, Top = 20 };
            Label lblVolume = new Label { Text = "Обсяг газу", Left = 20, Top = 60 };
            Label lblDate = new Label { Text = "Дата поставки", Left = 20, Top = 100 };

            cmbCustomer.SetBounds(120, 20, 140, 22);

            numVolume.SetBounds(120, 60, 140, 22);
            dtDelivery.SetBounds(120, 100, 140, 22);

            numVolume.Maximum = 1_000_000;

            btnSave.Text = "Зберегти";
            btnSave.SetBounds(60, 150, 80, 25);

            btnCancel.Text = "Скасувати";
            btnCancel.SetBounds(150, 150, 80, 25);

            Controls.AddRange(new Control[]
            {
            lblCustomer, cmbCustomer,
            lblVolume, numVolume,
            lblDate, dtDelivery,
            btnSave, btnCancel
            });


            numVolume.Value = order.GasVolume;
            dtDelivery.Value = order.DeliveryDate;

            cmbCustomer.DataSource = CustomerService.GetAll();
            cmbCustomer.DisplayMember = "CompanyName";
            cmbCustomer.ValueMember = "CustomerId";
            cmbCustomer.Text = order.CustomerName;

            btnSave.Click += Save;
            btnCancel.Click += (s, e) => DialogResult = DialogResult.Cancel;
        }

        private void Save(object sender, EventArgs e)
        {
            try
            {
                OrderService.Edit(new GasOrder
                {
                    OrderId = _orderId,
                    CustomerId = (int)cmbCustomer.SelectedValue!,
                    GasVolume = numVolume.Value,
                    DeliveryDate = dtDelivery.Value
                }, _user.UserId);

                MessageBox.Show("Замовлення додано успішно");
                DialogResult = DialogResult.OK;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Помилка: " + ex.Message);
            }
        }
    }
}
