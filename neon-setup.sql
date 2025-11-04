-- ================================================
-- NEON DATABASE SETUP SCRIPT
-- Tagihan Internet Management System
-- ================================================

-- Drop tables if exists (untuk clean install)
DROP TABLE IF EXISTS billing_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS packages CASCADE;

-- ================================================
-- CREATE TABLES
-- ================================================

-- 1. Packages Table
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    speed VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    package_name VARCHAR(100),
    package_speed VARCHAR(50),
    monthly_fee INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bills Table
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    billing_month VARCHAR(20) NOT NULL,
    billing_year INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    previous_debt INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(50),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Billing History Table
CREATE TABLE billing_history (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- CREATE INDEXES
-- ================================================

CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_package ON customers(package_name);
CREATE INDEX idx_bills_customer ON bills(customer_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_billing_period ON bills(billing_year, billing_month);
CREATE INDEX idx_payments_bill ON payments(bill_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);

-- ================================================
-- INSERT DEFAULT PACKAGES
-- ================================================

INSERT INTO packages (name, speed, price, description, is_active) VALUES
('Basic', '10 Mbps', 100000, 'Paket internet dasar untuk kebutuhan browsing', true),
('Standard', '20 Mbps', 150000, 'Paket internet standar untuk streaming dan gaming', true),
('Premium', '50 Mbps', 200000, 'Paket internet premium untuk kebutuhan bisnis', true),
('Putus', '0 Mbps', 0, 'Paket untuk pelanggan yang putus layanan, hanya menagih hutang tanpa biaya bulanan', true);

-- ================================================
-- INSERT SAMPLE CUSTOMERS
-- ================================================

INSERT INTO customers (name, email, phone, address, package_name, package_speed, monthly_fee, status) VALUES
-- Active customers
('Budi Santoso', 'budi.santoso@email.com', '081234567890', 'Jl. Merdeka No. 123, Jakarta Pusat', 'Standard', '20 Mbps', 150000, 'active'),
('Siti Nurhaliza', 'siti.nurhaliza@email.com', '081234567891', 'Jl. Sudirman No. 456, Bandung', 'Premium', '50 Mbps', 200000, 'active'),
('Ahmad Rahman', 'ahmad.rahman@email.com', '081234567892', 'Jl. Gatot Subroto No. 789, Surabaya', 'Basic', '10 Mbps', 100000, 'active'),
('Dewi Lestari', 'dewi.lestari@email.com', '081234567893', 'Jl. Diponegoro No. 321, Yogyakarta', 'Standard', '20 Mbps', 150000, 'active'),
('Eko Prasetyo', 'eko.prasetyo@email.com', '081234567894', 'Jl. Ahmad Yani No. 654, Semarang', 'Premium', '50 Mbps', 200000, 'active'),
('Fitri Handayani', 'fitri.handayani@email.com', '081234567895', 'Jl. Imam Bonjol No. 987, Medan', 'Basic', '10 Mbps', 100000, 'active'),
('Gunawan Wijaya', 'gunawan.wijaya@email.com', '081234567896', 'Jl. Hayam Wuruk No. 147, Makassar', 'Standard', '20 Mbps', 150000, 'active'),
('Hendra Kusuma', 'hendra.kusuma@email.com', '081234567897', 'Jl. Thamrin No. 258, Palembang', 'Premium', '50 Mbps', 200000, 'active'),
('Indah Permata', 'indah.permata@email.com', '081234567898', 'Jl. Asia Afrika No. 369, Malang', 'Basic', '10 Mbps', 100000, 'active'),
('Joko Widodo', 'joko.widodo@email.com', '081234567899', 'Jl. Proklamasi No. 741, Solo', 'Standard', '20 Mbps', 150000, 'active'),

-- More customers
('Kartika Sari', 'kartika.sari@email.com', '081234567800', 'Jl. Pemuda No. 852, Bali', 'Premium', '50 Mbps', 200000, 'active'),
('Lukman Hakim', 'lukman.hakim@email.com', '081234567801', 'Jl. Pahlawan No. 963, Pontianak', 'Basic', '10 Mbps', 100000, 'active'),
('Maya Anggraini', 'maya.anggraini@email.com', '081234567802', 'Jl. Veteran No. 159, Banjarmasin', 'Standard', '20 Mbps', 150000, 'active'),
('Nugroho Santoso', 'nugroho.santoso@email.com', '081234567803', 'Jl. Gajah Mada No. 357, Balikpapan', 'Premium', '50 Mbps', 200000, 'active'),
('Olivia Tan', 'olivia.tan@email.com', '081234567804', 'Jl. Pangeran Antasari No. 486, Manado', 'Basic', '10 Mbps', 100000, 'active'),

-- Suspended customers
('Putri Maharani', 'putri.maharani@email.com', '081234567805', 'Jl. Cendrawasih No. 753, Pekanbaru', 'Standard', '20 Mbps', 150000, 'suspended'),
('Rudi Hartono', 'rudi.hartono@email.com', '081234567806', 'Jl. Garuda No. 864, Jambi', 'Basic', '10 Mbps', 100000, 'suspended'),

-- Terminated customer
('Sari Dewi', 'sari.dewi@email.com', '081234567807', 'Jl. Mawar No. 975, Padang', 'Putus', '0 Mbps', 0, 'terminated'),

-- More active customers
('Taufik Hidayat', 'taufik.hidayat@email.com', '081234567808', 'Jl. Melati No. 159, Lampung', 'Standard', '20 Mbps', 150000, 'active'),
('Usman Ali', 'usman.ali@email.com', '081234567809', 'Jl. Anggrek No. 357, Bengkulu', 'Premium', '50 Mbps', 200000, 'active');

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check packages count
SELECT 'Packages Count' as info, COUNT(*) as total FROM packages;

-- Check customers count
SELECT 'Customers Count' as info, COUNT(*) as total FROM customers;

-- Check customers by status
SELECT 'Customers by Status' as info, status, COUNT(*) as total 
FROM customers 
GROUP BY status;

-- Check customers by package
SELECT 'Customers by Package' as info, package_name, COUNT(*) as total 
FROM customers 
GROUP BY package_name
ORDER BY total DESC;

-- Show all packages
SELECT * FROM packages ORDER BY price;

-- Show sample customers
SELECT id, name, phone, package_name, monthly_fee, status FROM customers LIMIT 10;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================

SELECT '✅ Database setup completed successfully!' as message;
SELECT '📦 Total Packages: 4' as summary;
SELECT '👥 Total Customers: 20' as summary;
