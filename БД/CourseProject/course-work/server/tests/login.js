import fetch from "node-fetch";

async function simulateBulkRequests(requestCount = 1000) {
  const requests = [];
  const url = "http://192.168.2.149:5000/api/users"; // Пример URL

  for (let i = 0; i < requestCount; i++) {
    requests.push(
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) =>
          console.log(
            `Запрос #${i + 1} выполнен: ${JSON.stringify(data, null, 2)}`
          )
        )

        .catch((err) => console.error(`Ошибка при запросе #${i + 1}`, err))
    );
  }

  console.time("bulk_requests");
  await Promise.all(requests);
  console.timeEnd("bulk_requests");
}

simulateBulkRequests(1000);
