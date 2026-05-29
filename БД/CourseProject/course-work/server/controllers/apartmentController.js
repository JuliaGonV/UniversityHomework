import apartmentsService from "../services/apartmentsService.js";

class ApartmentController {
  async createApartment(req, res) {
    const {
      number,
      floor,
      area,
      building_id,
      owned = false,
      user_id = null,
    } = req.body;
    console.log("ASDASD", building_id);
    try {
      const apartment = await apartmentsService.createApartment(
        number,
        floor,
        area,
        building_id,
        owned,
        user_id,
      );

      res.status(201).json(apartment);
    } catch (error) {
      console.error("Error creating apartment:", error);
      if (
        error.code === "APARTMENT_FLOOR_TOO_HIGH" ||
        error.code === "INVALID_APARTMENT_FLOOR" ||
        error.code === "BUILDING_NOT_FOUND"
      ) {
        return res.status(400).json({ message: error.message });
      }
      res
        .status(500)
        .json({ message: "Помилка при створенні квартири: " + error.message });
    }
  }

  async getAllApartments(req, res) {
    try {
      const apartments = await apartmentsService.getAllApartments();
      res.status(200).json(apartments);
    } catch (error) {
      console.error("Error getting all apartments:", error);
      res.status(500).json({
        message: "Помилка при отриманні всіх квартир: " + error.message,
      });
    }
  }

  async getApartmentById(req, res) {
    const { id } = req.params;
    try {
      const apartment = await apartmentsService.getApartmentById(id);
      if (apartment) {
        res.status(200).json(apartment);
      } else {
        res.status(404).json({ message: "Apartment not found" });
      }
    } catch (error) {
      console.error("Error getting apartment by ID:", error);
      res.status(500).json({
        message: "Помилка при отриманні квартири за ID: " + error.message,
      });
    }
  }

  async updateApartment(req, res) {
    const { id } = req.params;
    const { number, floor, area, building_id, owned } = req.body;

    try {
      const apartment = await apartmentsService.updateApartment(
        id,
        building_id,
        number,
        floor,
        area,
        owned,
      );
      if (apartment) {
        res.status(200).json(apartment);
      } else {
        res.status(404).json({ message: "Apartment not found" });
      }
    } catch (error) {
      console.error("Error updating apartment:", error);
      if (
        error.code === "APARTMENT_FLOOR_TOO_HIGH" ||
        error.code === "INVALID_APARTMENT_FLOOR" ||
        error.code === "BUILDING_NOT_FOUND"
      ) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({
        message: "Помилка при оновленні квартири: " + error.message,
      });
    }
  }

  async deleteApartment(req, res) {
    const { id } = req.params;
    try {
      const result = await apartmentsService.deleteApartment(id);
      if (result) {
        res.status(200).json({ message: "Apartment deleted" });
      } else {
        res.status(404).json({ message: "Apartment not found" });
      }
    } catch (error) {
      console.error("Error deleting apartment:", error);
      res.status(500).json({
        message: "Помилка при видаленні квартири: " + error.message,
      });
    }
  }

  async getAvailableApartments(req, res) {
    try {
      const apartments = await apartmentsService.getAvailableApartments();
      res.status(200).json(apartments);
    } catch (error) {
      console.error("Error getting available apartments:", error);
      res.status(500).json({
        message: "Помилка при отриманні доступних квартир: " + error.message,
      });
    }
  }

  async getAvailableApartmentsByBuildingId(req, res) {
    try {
      const buildingId = parseInt(req.params.buildingId);
      if (isNaN(buildingId)) {
        return res.status(400).json({ message: "Некоректний ID будинку" });
      }
      const apartments =
        await apartmentsService.getAvailableApartmentsByBuildingId(buildingId);
      res.json(apartments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateApartmentStatus(req, res) {
    const { apartmentId } = req.params;
    const { owned, user_id } = req.body;
    console.log("ID", apartmentId);
    console.log("USER_ID", user_id);
    console.log("OWNED", owned);
    try {
      const apartment = await apartmentsService.updateApartmentStatus(
        apartmentId,
        owned,
        user_id,
      );
      if (apartment) {
        res.status(200).json(apartment);
      } else {
        res.status(404).json({ message: "Apartment not found" });
      }
    } catch (error) {
      console.error("Error updating apartment status:", error);
      res.status(500).json({
        message: "Помилка при оновленні статусу квартири: " + error.message,
      });
    }
  }

  async getApartmentByResidentId(req, res) {
    const { residentId } = req.params;
    try {
      const apartment =
        await apartmentsService.getApartmentByResidentId(residentId);
      if (apartment) {
        res.status(200).json(apartment);
      } else {
        res.status(404).json({ message: "Apartment not found" });
      }
    } catch (error) {
      console.error("Error getting apartment by resident ID:", error);
      res.status(500).json({
        message:
          "Помилка при отриманні квартири за ID мешканця: " + error.message,
      });
    }
  }

  async getFreeApartments(req, res) {
    try {
      const apartments = await apartmentsService.getFreeApartments();
      res.status(200).json(apartments);
    } catch (error) {
      console.error("Error getting free apartments:", error);
      res.status(500).json({
        message: "Помилка при отриманні незанятих квартир: " + error.message,
      });
    }
  }

  async getApartmentsByBuildings(req, res) {
    try {
      const apartments = await apartmentsService.getApartmentsByBuildings();
      res.status(200).json(apartments);
    } catch (error) {
      console.error("Error getting apartments by buildings:", error);
      res.status(500).json({
        message: "Помилка при отриманні квартир за будинками: " + error.message,
      });
    }
  }

  async getOccupancyByBuilding(req, res) {
    try {
      const occupancyStats = await apartmentsService.getOccupancyByBuilding();
      res.status(200).json(occupancyStats);
    } catch (error) {
      res.status(500).json({
        message:
          "Помилка при отриманні заповненості будинків: " + error.message,
      });
    }
  }
}

export default new ApartmentController();
