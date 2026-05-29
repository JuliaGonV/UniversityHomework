import paymentsService from "../services/paymentsService.js";

class PaymentController {
  async createPayment(req, res) {
    const { resident_id, month, amount, paid_at, status } = req.body;

    console.log("Creating payment with data:", {
      resident_id,
      month,
      amount,
      paid_at,
      status,
    });

    try {
      const payment = await paymentsService.createPayment(
        resident_id,
        month,
        amount,
        paid_at || null,
        status || "not payed",
      );
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllPayments(req, res) {
    try {
      const payments = await paymentsService.getAllPayments();
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPaymentById(req, res) {
    const { id } = req.params;
    try {
      const payment = await paymentsService.getPaymentById(id);
      if (payment) {
        res.status(200).json(payment);
      } else {
        res.status(404).json({ message: "Платіж не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePayment(req, res) {
    const { id } = req.params;
    const { resident_id, month, amount } = req.body;
    try {
      const payment = await paymentsService.updatePayment(
        id,
        resident_id,
        month,
        amount,
      );
      if (payment) {
        res.status(200).json(payment);
      } else {
        res.status(404).json({ message: "Платіж не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async deletePayment(req, res) {
    const { id } = req.params;
    try {
      const result = await paymentsService.deletePayment(id);
      if (result) {
        res.status(200).json({ message: "Платіж успішно видалено." });
      } else {
        res.status(404).json({ message: "Платіж не знайдено." });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPaymentsByResidentId(req, res) {
    const { resident_id } = req.params;
    try {
      const payments =
        await paymentsService.getPaymentsByResidentId(resident_id);
      if (payments) {
        res.status(200).json(payments);
      } else {
        res
          .status(404)
          .json({ message: "Не знайдено платежів для цього мешканця" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getPaymentsByMonth(req, res) {
    const { month } = req.params;
    try {
      const payments = await paymentsService.getPaymentsByMonth(month);
      if (payments) {
        res.status(200).json(payments);
      } else {
        res.status(404).json({ message: "Не знайдено платежів за цей місяць" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPaymentsByStatus(req, res) {
    const { status } = req.params;
    try {
      const payments = await paymentsService.getPaymentsByStatus(status);
      if (payments) {
        res.status(200).json(payments);
      } else {
        res
          .status(404)
          .json({ message: "Не знайдено платежів з цим статусом" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePaymentStatus(req, res) {
    const { id } = req.params;
    const { status, paid_at } = req.body;
    try {
      const payment = await paymentsService.updatePaymentStatus(
        id,
        status,
        paid_at,
      );
      if (payment) {
        res.status(200).json(payment);
      } else {
        res.status(404).json({ message: "Платіж не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSumPaymentsUnpaid(req, res) {
    try {
      const sum = await paymentsService.getSuPaymentsNotPaid();
      if (sum) {
        res.status(200).json(sum);
      } else {
        res.status(404).json({ message: "Не знайдено платежів" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  async getResidentsByPaidPayments(req, res) {
    try {
      const residents = await paymentsService.getResidentsByPaidPayments();
      if (residents) {
        res.status(200).json(residents);
      } else {
        res.status(404).json({ message: "Не знайдено мешканців" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDebtByBuilding(req, res) {
    try {
      const debtStats = await paymentsService.getDebtByBuilding();
      res.status(200).json(debtStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDebtByResident(req, res) {
    try {
      const debtStats = await paymentsService.getDebtByResident();
      res.status(200).json(debtStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTopDebtors(req, res) {
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const debtors = await paymentsService.getTopDebtors(limit);
      res.status(200).json(debtors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCollectionRateByMonth(req, res) {
    try {
      const collectionRate = await paymentsService.getCollectionRateByMonth();
      res.status(200).json(collectionRate);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllDebtors(req, res) {
    try {
      const debtors = await paymentsService.getAllDebtors();
      res.status(200).json(debtors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async payAllDebtsByResidentId(req, res) {
    const { resident_id } = req.params;
    try {
      const result = await paymentsService.payAllDebtsByResidentId(resident_id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PaymentController();
