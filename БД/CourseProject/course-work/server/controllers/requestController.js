import requestService from "../services/requestService.js";

class RequestController {
  async createMaintenanceRequest(req, res) {
    const { userIdForRequests, apartmentId, description, repairType } =
      req.body;
    console.log(userIdForRequests, apartmentId, description, repairType);
    try {
      const request = await requestService.createMaintenanceRequest(
        userIdForRequests,
        apartmentId,
        description,
        repairType || "medium",
      );
      res.status(201).json(request);
    } catch (error) {
      console.log(error);
      if (error.code === "INVALID_REPAIR_TYPE") {
        return res.status(400).json({ error: error.message });
      }
      if (error.code === "REPAIR_BLOCKED_DUE_TO_DEBT") {
        return res.status(403).json({ error: error.message });
      }
      if (error.code === "APARTMENT_FORBIDDEN") {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async getAllMaintenanceRequests(req, res) {
    try {
      const requests = await requestService.getAllMaintenanceRequests();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMaintenanceRequestById(req, res) {
    const { id } = req.params;
    try {
      const request = await requestService.getMaintenanceRequestById(id);
      if (!request || request.length === 0) {
        return res.status(404).json({ message: "Запит не знайдено" });
      }
      res.status(200).json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMaintenanceRequest(req, res) {
    const { id } = req.params;
    const { status, response } = req.body;
    try {
      const request = await requestService.updateMaintenanceRequest(
        id,
        status,
        response,
      );
      if (request) {
        res.status(200).json(request);
      } else {
        res.status(404).json({ message: "Запит не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async deleteMaintenanceRequest(req, res) {
    const { id } = req.params;
    try {
      const request = await requestService.deleteMaintenanceRequest(id);
      if (request) {
        res.status(200).json({ message: "Запит видалено" });
      } else {
        res.status(404).json({ message: "Запит не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMaintenanceRequestByStatus(req, res) {
    const { status } = req.body;

    try {
      const requests =
        await requestService.getMaintenanceRequestByStatus(status);
      res.status(200).json(requests);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateMaintenanceRequestStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status);
    console.log("updateMaintenanceRequestStatus payload:", {
      id,
      status,
      params: req.params,
      body: req.body,
    });
    try {
      const request = await requestService.updateMaintenanceRequestStatus(
        id,
        status,
      );
      if (request) {
        res.status(200).json(request);
      } else {
        res.status(404).json({ message: "Запит не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOverdueRequests(req, res) {
    const days = parseInt(req.query.days, 10) || 7;
    try {
      const requests = await requestService.getOverdueRequests(days);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getRequestStatsByStatus(req, res) {
    try {
      const stats = await requestService.getRequestStatsByStatus();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAverageCloseTime(req, res) {
    try {
      const avgClose = await requestService.getAverageCloseTime();
      res.status(200).json(avgClose);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new RequestController();
