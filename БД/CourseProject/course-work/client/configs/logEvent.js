import { apiUrl } from "./config.js";

export async function logEvent(userId, eventType, details) {
  try {
    const response = await fetch(`${apiUrl}/event-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        eventType: eventType,
        details: details,
      }),
    });

    if (!response.ok) {
      throw new Error("Ошибка при записи в журнал событий");
    }
  } catch (error) {
    console.error("Ошибка записи в журнал событий:", error);
  }
}
