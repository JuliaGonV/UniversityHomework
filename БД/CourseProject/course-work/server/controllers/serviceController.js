import serviceService from "../services/serviceService.js";

class ServiceController {
  async createService(req, res) {
    const { name, description, monthly_fee } = req.body;
    try {
      const service = await serviceService.createService(
        name,
        description,
        monthly_fee
      );
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllServices(req, res) {
    try {
      const services = await serviceService.getAllServices();
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getServiceById(req, res) {
    const { id } = req.params;
    try {
      const service = await serviceService.getServiceById(id);
      if (service) {
        res.status(200).json(service);
      } else {
        res.status(404).json({ message: "Сервіс не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateService(req, res) {
    const { id } = req.params;
    const { name, description, monthly_fee } = req.body;
    try {
      const service = await serviceService.updateService(
        id,
        name,
        description,
        monthly_fee
      );
      if (service) {
        res.status(200).json(service);
      } else {
        res.status(404).json({ message: "Сервіс не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteService(req, res) {
    const { id } = req.params;
    try {
      const result = await serviceService.deleteService(id);
      if (result) {
        res.status(200).json({ message: "Сервіс видалено" });
      } else {
        res.status(404).json({ message: "Сервіс не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getServiceByName(req, res) {
    const { name } = req.params;
    try {
      const service = await serviceService.getServiceByName(name);
      if (service) {
        res.status(200).json(service);
      } else {
        res.status(404).json({ message: "Сервіс не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ServiceController();
