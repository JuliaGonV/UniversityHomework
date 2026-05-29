import buildingService from "../services/buildingService.js";

class BuildingController {
  async createBuilding(req, res) {
    const { address, built_year, number_of_floors } = req.body;
    try {
      const building = await buildingService.createBuilding(
        address,
        built_year,
        number_of_floors
      );
      res.status(201).json(building);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllBuildings(req, res) {
    try {
      const buildings = await buildingService.getAllBuildings();
      res.status(200).json(buildings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBuildingById(req, res) {
    const { id } = req.params;
    try {
      const building = await buildingService.getBuildingById(id);
      if (building) {
        res.status(200).json(building);
      } else {
        res.status(404).json({ message: "Будівлю не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async updateBuilding(req, res) {
    const { id } = req.params;
    const { address, built_year, number_of_floors } = req.body;
    try {
      const building = await buildingService.updateBuilding(
        id,
        address,
        built_year,
        number_of_floors
      );
      if (building) {
        res.status(200).json(building);
      } else {
        res.status(404).json({ message: "Будівлю не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteBuilding(req, res) {
    const { id } = req.params;
    try {
      const result = await buildingService.deleteBuilding(id);
      if (result) {
        res.status(200).json({ message: "Будівля видалена успішно" });
      } else {
        res.status(404).json({ message: "Будівлю не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new BuildingController();
