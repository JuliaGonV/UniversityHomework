import orderService from "../services/orderService.js";

class OrderController {
  async createWorkOrder(req, res) {
    const { request_id, worker_id, scheduled_date, notes } = req.body;
    try {
      const workOrder = await orderService.createWorkOrder(
        request_id,
        worker_id,
        scheduled_date,
        notes,
      );
      res.status(201).json(workOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllWorkOrders(req, res) {
    try {
      const workOrders = await orderService.getAllWorkOrders();
      res.status(200).json(workOrders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWorkOrderById(req, res) {
    const { id } = req.params;
    try {
      const workOrder = await orderService.getWorkOrderById(id);
      if (workOrder) {
        res.status(200).json(workOrder);
      } else {
        res.status(404).json({ message: "Замовлення не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateWorkOrder(req, res) {
    const { id } = req.params;
    const { request_id, worker_id, scheduled_date, notes } = req.body;
    try {
      const workOrder = await orderService.updateWorkOrder(
        id,
        request_id,
        worker_id,
        scheduled_date,
        notes,
      );
      if (workOrder) {
        res.status(200).json(workOrder);
      } else {
        res.status(404).json({ message: "Замовлення не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteWorkOrder(req, res) {
    const { id } = req.params;
    try {
      const result = await orderService.deleteWorkOrder(id);
      if (result) {
        res.status(200).json({ message: "Замовлення видалено" });
      } else {
        res.status(404).json({ message: "Замовлення не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async completeWorkOrder(req, res) {
    const { id } = req.params;
    try {
      const workOrder = await orderService.completeWorkOrder(id);
      if (workOrder) {
        res.status(200).json(workOrder);
      } else {
        res.status(404).json({ message: "Замовлення не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getWorkloadByWorker(req, res) {
    try {
      const stats = await orderService.getWorkloadByWorker();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new OrderController();
