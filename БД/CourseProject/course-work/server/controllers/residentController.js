import residentService from "../services/residentService.js";

class ResidentController {
  async createResident(req, res) {
    const {
      user_id,
      full_name,
      apartment_id,
      phone,
      registered_at,
      building_id,
    } = req.body;
    try {
      const resident = await residentService.createResident(
        user_id,
        full_name,
        apartment_id,
        phone,
        registered_at,
        building_id
      );
      res.status(201).json(resident);
    } catch (error) {
      console.error("Error creating resident:", error);
      res
        .status(500)
        .json({ message: "Помилка при створенні мешканця: " + error.message });
    }
  }

  async getAllResidents(req, res) {
    try {
      const residents = await residentService.getAllResidents();
      res.status(200).json(residents);
    } catch (error) {
      console.error("Error getting all residents:", error);
      res.status(500).json({
        message: "Помилка при отриманні всіх мешканців: " + error.message,
      });
    }
  }

  async getResidentById(req, res) {
    const { id } = req.params;
    try {
      const resident = await residentService.getResidentById(id);
      if (resident) {
        res.status(200).json(resident);
      } else {
        res.status(404).json({ message: "Resident not found" });
      }
    } catch (error) {
      console.error("Error getting resident by ID:", error);
      res.status(500).json({
        message: "Помилка при отриманні мешканця за ID: " + error.message,
      });
    }
  }

  async updateResident(req, res) {
    const { id } = req.params;
    const { user_id, full_name, apartment_id, phone } = req.body;
    try {
      const resident = await residentService.updateResident(
        id,
        user_id,
        full_name,
        apartment_id,
        phone
      );
      if (resident) {
        res.status(200).json(resident);
      } else {
        res.status(404).json({ message: "Resident not found" });
      }
    } catch (error) {
      console.error("Error updating resident:", error);
      res
        .status(500)
        .json({ message: "Помилка при оновленні мешканця: " + error.message });
    }
  }

  async deleteResident(req, res) {
    const { id } = req.params;
    try {
      const resident = await residentService.deleteResident(id);
      if (resident) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Resident not found" });
      }
    } catch (error) {
      console.error("Error deleting resident:", error);
      res
        .status(500)
        .json({ message: "Помилка при видаленні мешканця: " + error.message });
    }
  }

  async getResidentsByFloor(req, res) {
    const { floor, buildingId } = req.body;
    console.log(floor, buildingId);
    try {
      const residents = await residentService.getResidentsByFloor(
        buildingId,
        floor
      );
      if (residents) {
        res.status(200).json(residents);
      } else {
        console.log("Residents not found");
        res.status(404).json({ message: "Residents not found" });
      }
    } catch (error) {
      console.error("Error getting residents by floor:", error);
      res.status(500).json({
        message:
          "Помилка при отриманні мешканців за поверхом: " + error.message,
      });
    }
  }
}

export default new ResidentController();
