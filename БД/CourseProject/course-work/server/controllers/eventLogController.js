import eventLogService from "../services/eventLogService.js";

class EventLogController {
  async createEventLog(req, res) {
    const { userId, eventType, details } = req.body;
    try {
      const eventLog = await eventLogService.createEventLog(
        userId,
        eventType,
        details,
      );

      res.status(201).json(eventLog);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllEventLogs(req, res) {
    try {
      const eventLogs = await eventLogService.getAllEventLogs();
      res.status(200).json(eventLogs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEventLogById(req, res) {
    const { id } = req.params;
    try {
      const eventLog = await eventLogService.getEventLogById(id);
      if (eventLog) {
        res.status(200).json(eventLog);
      } else {
        res.status(404).json({ message: "Не знайдено запис у журналі подій" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateEventLog(req, res) {
    const { id } = req.params;
    const { userId, eventType, details } = req.body;
    try {
      const eventLog = await eventLogService.updateEventLog(
        id,
        userId,
        eventType,
        details,
      );
      if (eventLog) {
        res.status(200).json(eventLog);
      } else {
        res.status(404).json({ message: "Не знайдено запис у журналі подій" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteEventLog(req, res) {
    const { id } = req.params;
    try {
      const result = await eventLogService.deleteEventLog(id);
      if (result) {
        res.status(200).json({ message: "Запис успішно видалено." });
      } else {
        res.status(404).json({ message: "Не знайдено запис у журналі подій" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getEventLogsByUserId(req, res) {
    const { userId } = req.params;
    try {
      const eventLogs = await eventLogService.getEventLogsByUserId(userId);
      if (eventLogs) {
        res.status(200).json(eventLogs);
      } else {
        res
          .status(404)
          .json({ message: "Не знайдено запис у журналі подій за цим юзером" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserActivity(req, res) {
    const days = parseInt(req.query.days, 10) || 30;
    try {
      const activity = await eventLogService.getUserActivity(days);
      res.status(200).json(activity);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new EventLogController();
