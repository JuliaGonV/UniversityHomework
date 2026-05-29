import announcementService from "../services/announcementService.js";

class AnnouncementController {
  async createAnnouncement(req, res) {
    const { title, message, authorId } = req.body;
    try {
      const announcement = await announcementService.createAnnouncement(
        title,
        message,
        authorId
      );
      res.status(201).json(announcement);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllAnnouncements(req, res) {
    try {
      const announcements = await announcementService.getAllAnnouncements();
      res.status(200).json(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAnnouncementById(req, res) {
    const { id } = req.params;
    try {
      const announcement = await announcementService.getAnnouncementById(id);
      if (announcement) {
        res.status(200).json(announcement);
      } else {
        res.status(404).json({ message: "Оголошення не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAnnouncement(req, res) {
    const { id } = req.params;
    const { title, message, authorId, author_id, actorId, actorRole } =
      req.body;
    try {
      const existingAnnouncement =
        await announcementService.getAnnouncementById(id);
      if (!existingAnnouncement) {
        return res.status(404).json({ message: "Оголошення не знайдено" });
      }

      const currentUserId = actorId || authorId || author_id;
      if (
        actorRole !== "admin" &&
        Number(existingAnnouncement.author_id) !== Number(currentUserId)
      ) {
        return res
          .status(403)
          .json({ message: "Не можна редагувати чуже оголошення" });
      }

      const announcement = await announcementService.updateAnnouncement(
        id,
        title,
        message,
        authorId || author_id
      );
      if (announcement) {
        res.status(200).json(announcement);
      } else {
        res.status(404).json({ message: "Оголошення не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAnnouncement(req, res) {
    const { id } = req.params;
    const { actorId, actorRole } = req.query;
    try {
      const existingAnnouncement =
        await announcementService.getAnnouncementById(id);
      if (!existingAnnouncement) {
        return res.status(404).json({ message: "Оголошення не знайдено" });
      }

      if (
        actorRole !== "admin" &&
        Number(existingAnnouncement.author_id) !== Number(actorId)
      ) {
        return res
          .status(403)
          .json({ message: "Не можна видаляти чуже оголошення" });
      }

      const result = await announcementService.deleteAnnouncement(id);
      if (result) {
        res.status(200).json({ message: "Оголошення успішно видалено!" });
      } else {
        res.status(404).json({ message: "Оголошення не знайдено" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAnnouncementsByAuthorId(req, res) {
    const { authorId } = req.params;
    try {
      const announcements =
        await announcementService.getAnnouncementsByAuthorId(authorId);
      if (announcements) {
        res.status(200).json(announcements);
      } else {
        res
          .status(404)
          .json({ message: "Не знайдено оголошень для цього автора" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AnnouncementController();
