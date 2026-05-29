-- 1. Users (Base table)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT CHECK (role IN ('resident', 'admin', 'worker')) NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- 2. Buildings (Base table)
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    built_year INT,
    number_of_floors INT
);

-- 3. Apartments (Depends on buildings and users)
CREATE TABLE apartments (
    id SERIAL PRIMARY KEY,
    building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    floor INT,
    area FLOAT,
    owned BOOLEAN DEFAULT FALSE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Residents (Depends on users, apartments, and buildings)
CREATE TABLE residents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    apartment_id INT REFERENCES apartments(id) ON DELETE CASCADE,
    building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
    phone TEXT,
    registered_at DATE
);

-- 5. Payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    resident_id INT REFERENCES residents(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    paid_at TIMESTAMP,
    status TEXT CHECK (status IN ('payed', 'not payed')) DEFAULT 'not payed'
);

-- 6. Services
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    monthly_fee NUMERIC(10,2) NOT NULL
);

-- 7. Maintenance Requests
CREATE TABLE maintenance_requests (
    id SERIAL PRIMARY KEY,
    resident_id INT REFERENCES residents(id) ON DELETE CASCADE,
    apartment_id INT REFERENCES apartments(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    repair_type TEXT CHECK (repair_type IN ('cosmetic', 'medium', 'major', 'emergency')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('new', 'in work', 'completed')) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP
);

-- 8. Work Orders
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    request_id INT REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    worker_id INT REFERENCES users(id),
    scheduled_date DATE,
    completed_at TIMESTAMP,
    notes TEXT
);

-- 9. Expenses
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(10,2),
    date DATE,
    category TEXT
);

-- 10. Announcements
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    author_id INT REFERENCES users(id)
);

-- 11. Event Log
CREATE TABLE event_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, 
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT NOT NULL
);

-- 12. Backup Logs
CREATE TABLE backup_logs (
    backup_id SERIAL PRIMARY KEY,
    backup_type VARCHAR(20) CHECK (backup_type IN ('copy', 'recover')),
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by INT REFERENCES users(id),
    notes TEXT
);


ALTER TABLE maintenance_requests
ADD COLUMN IF NOT EXISTS repair_type TEXT DEFAULT 'medium';

ALTER TABLE maintenance_requests
DROP CONSTRAINT IF EXISTS maintenance_requests_repair_type_check;

ALTER TABLE maintenance_requests
ADD CONSTRAINT maintenance_requests_repair_type_check
CHECK (repair_type IN ('cosmetic', 'medium', 'major', 'emergency'));

ALTER TABLE apartments
DROP CONSTRAINT IF EXISTS apartments_building_id_fkey,
ADD CONSTRAINT apartments_building_id_fkey
FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

ALTER TABLE residents
DROP CONSTRAINT IF EXISTS residents_apartment_id_fkey,
ADD CONSTRAINT residents_apartment_id_fkey
FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE;

ALTER TABLE residents
DROP CONSTRAINT IF EXISTS residents_building_id_fkey,
ADD CONSTRAINT residents_building_id_fkey
FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;

ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_resident_id_fkey,
ADD CONSTRAINT payments_resident_id_fkey
FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE;

ALTER TABLE maintenance_requests
DROP CONSTRAINT IF EXISTS maintenance_requests_resident_id_fkey,
ADD CONSTRAINT maintenance_requests_resident_id_fkey
FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE;

ALTER TABLE maintenance_requests
DROP CONSTRAINT IF EXISTS maintenance_requests_apartment_id_fkey,
ADD CONSTRAINT maintenance_requests_apartment_id_fkey
FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE;

ALTER TABLE work_orders
DROP CONSTRAINT IF EXISTS work_orders_request_id_fkey,
ADD CONSTRAINT work_orders_request_id_fkey
FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE;