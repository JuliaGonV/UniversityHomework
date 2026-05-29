import { faker } from "@faker-js/faker";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "course_project",
  password: "1",
  port: 5432,
});

// -------------------- CONFIG --------------------
const USER_COUNT = 500;
const BUILDING_COUNT = 20;
const APARTMENT_COUNT = 200;
const RESIDENT_COUNT = 150;
const REQUEST_COUNT = 300;
const PAYMENT_COUNT = 500;
const WORK_ORDER_COUNT = 200;

// -------------------- TIMER WRAPPER --------------------
async function time(label, fn) {
  console.time(label);
  try {
    return await fn();
  } finally {
    console.timeEnd(label);
  }
}

// -------------------- HELPERS --------------------
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function batchInsert(client, query, values) {
  for (const v of values) {
    await client.query(query, v);
  }
}

// -------------------- USERS --------------------
async function seedUsers() {
  const client = await pool.connect();
  const roles = ["resident", "admin", "worker"];

  const users = [];

  for (let i = 0; i < USER_COUNT; i++) {
    users.push([
      faker.internet.username().toLowerCase() + i,
      "12345678",
      faker.internet.email(),
      random(roles),
    ]);
  }

  await client.query("BEGIN");

  try {
    await batchInsert(
      client,
      `INSERT INTO users (username, password_hash, email, role)
       VALUES ($1, $2, $3, $4)`,
      users
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// -------------------- BUILDINGS --------------------
async function seedBuildings() {
  const client = await pool.connect();

  const buildings = [];

  for (let i = 0; i < BUILDING_COUNT; i++) {
    buildings.push([
      faker.location.streetAddress(),
      faker.number.int({ min: 1960, max: 2024 }),
      faker.number.int({ min: 3, max: 20 }),
    ]);
  }

  await client.query("BEGIN");

  try {
    await batchInsert(
      client,
      `INSERT INTO buildings (address, built_year, number_of_floors)
       VALUES ($1, $2, $3)`,
      buildings
    );

    await client.query("COMMIT");
  } finally {
    client.release();
  }
}

// -------------------- APARTMENTS --------------------
async function seedApartments() {
  const client = await pool.connect();

  const buildings = await client.query("SELECT id FROM buildings");
  const buildingIds = buildings.rows.map((r) => r.id);

  const apartments = [];

  for (let i = 0; i < APARTMENT_COUNT; i++) {
    apartments.push([
      random(buildingIds),
      `${faker.number.int({ min: 1, max: 999 })}`,
      faker.number.int({ min: 1, max: 20 }),
      faker.number.float({ min: 20, max: 120 }),
      faker.datatype.boolean(),
      null,
    ]);
  }

  await client.query("BEGIN");

  try {
    await batchInsert(
      client,
      `INSERT INTO apartments (building_id, number, floor, area, owned, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      apartments
    );

    await client.query("COMMIT");
  } finally {
    client.release();
  }
}

// -------------------- RESIDENTS --------------------
async function seedResidents() {
  const client = await pool.connect();

  const users = await client.query(
    "SELECT id FROM users WHERE role = 'resident'"
  );
  const apartments = await client.query("SELECT id, building_id FROM apartments");

  const residents = [];

  for (let i = 0; i < RESIDENT_COUNT; i++) {
    const apartment = random(apartments.rows);

    residents.push([
      random(users.rows).id,
      faker.person.fullName(),
      apartment.id,
      apartment.building_id,
      faker.phone.number(),
      faker.date.past(),
    ]);
  }

  await client.query("BEGIN");

  try {
    await batchInsert(
      client,
      `INSERT INTO residents (user_id, full_name, apartment_id, building_id, phone, registered_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      residents
    );

    await client.query("COMMIT");
  } finally {
    client.release();
  }
}

// -------------------- MAINTENANCE REQUESTS --------------------
async function seedRequests() {
  const client = await pool.connect();

  const residents = await client.query("SELECT id FROM residents");
  const apartments = await client.query("SELECT id FROM apartments");

  const types = ["cosmetic", "medium", "major", "emergency"];
  const status = ["new", "in work", "completed"];

  const requests = [];

  for (let i = 0; i < REQUEST_COUNT; i++) {
    requests.push([
      random(residents.rows).id,
      random(apartments.rows).id,
      faker.lorem.sentence(),
      random(types),
      random(status),
      faker.date.recent(),
      faker.date.recent(),
    ]);
  }

  await client.query("BEGIN");

  try {
    await batchInsert(
      client,
      `INSERT INTO maintenance_requests
       (resident_id, apartment_id, description, repair_type, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      requests
    );

    await client.query("COMMIT");
  } finally {
    client.release();
  }
}

// -------------------- PAYMENTS (FIXED) --------------------
async function seedPayments() {
  const client = await pool.connect();

  const residents = await client.query("SELECT id FROM residents");
  const status = ["payed", "not payed"];

  const payments = [];

  for (let i = 0; i < PAYMENT_COUNT; i++) {
    payments.push([
      random(residents.rows).id,

      // FIX: proper DATE format
      faker.date.between({
        from: "2023-01-01",
        to: "2026-01-01",
      }),

      faker.number.float({ min: 100, max: 2000 }),
      faker.date.recent(),
      random(status),
    ]);
  }

  await client.query("BEGIN");

  try {
    await batchInsert(
      client,
      `INSERT INTO payments (resident_id, month, amount, paid_at, status)
       VALUES ($1,$2,$3,$4,$5)`,
      payments
    );

    await client.query("COMMIT");
  } finally {
    client.release();
  }
}

// -------------------- WORK ORDERS --------------------
async function seedWorkOrders() {
  const client = await pool.connect();

  const requests = await client.query("SELECT id FROM maintenance_requests");
  const workers = await client.query(
    "SELECT id FROM users WHERE role = 'worker'"
  );

  const workOrders = [];

  for (let i = 0; i < WORK_ORDER_COUNT; i++) {
    workOrders.push([
      random(requests.rows).id,
      random(workers.rows)?.id || null,
      faker.date.future(),
      faker.date.recent(),
      faker.lorem.sentence(),
    ]);
  }

  await client.query("BEGIN");

  try {
    await batchInsert(
      client,
      `INSERT INTO work_orders (request_id, worker_id, scheduled_date, completed_at, notes)
       VALUES ($1,$2,$3,$4,$5)`,
      workOrders
    );

    await client.query("COMMIT");
  } finally {
    client.release();
  }
}

// -------------------- RUN ALL --------------------
async function run() {
  console.time("TOTAL SEED TIME");

  await time("users", seedUsers);
  await time("buildings", seedBuildings);
  await time("apartments", seedApartments);
  await time("residents", seedResidents);
  await time("requests", seedRequests);
  await time("payments", seedPayments);
  await time("work_orders", seedWorkOrders);

  console.timeEnd("TOTAL SEED TIME");

  await pool.end();
}

run().catch(console.error);