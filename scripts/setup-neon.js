// Setup Neon Database with sample data
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const DATABASE_URL = process.env.VITE_DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ VITE_DATABASE_URL not found in .env file')
  process.exit(1)
}

console.log('🚀 Setting up Neon Database...')
console.log('📡 Connecting to:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'Neon')

const sql = neon(DATABASE_URL)

async function setupDatabase() {
  try {
    console.log('🗑️  Dropping existing tables...\n')
    
    // Drop tables (ignore errors if they don't exist)
    try { await sql.query('DROP TABLE IF EXISTS billing_history CASCADE') } catch (e) {}
    try { await sql.query('DROP TABLE IF EXISTS payments CASCADE') } catch (e) {}
    try { await sql.query('DROP TABLE IF EXISTS bills CASCADE') } catch (e) {}
    try { await sql.query('DROP TABLE IF EXISTS customers CASCADE') } catch (e) {}
    try { await sql.query('DROP TABLE IF EXISTS packages CASCADE') } catch (e) {}
    
    console.log('✅ Tables dropped\n')
    console.log('📋 Creating tables...\n')
    
    // Create packages table
    await sql.query(`
      CREATE TABLE packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        speed VARCHAR(50) NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created table: packages')
    
    // Create customers table
    await sql.query(`
      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT,
        package_name VARCHAR(100),
        package_speed VARCHAR(50),
        monthly_fee INTEGER NOT NULL,
        hutang INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created table: customers')
    
    // Create bills table
    await sql.query(`
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
      )
    `)
    console.log('✅ Created table: bills')
    
    // Create payments table
    await sql.query(`
      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        payment_method VARCHAR(50),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created table: payments')
    
    // Create billing_history table
    await sql.query(`
      CREATE TABLE billing_history (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Created table: billing_history')
    
    console.log('\n📑 Creating indexes...\n')
    
    // Create indexes
    await sql.query('CREATE INDEX idx_customers_status ON customers(status)')
    await sql.query('CREATE INDEX idx_customers_package ON customers(package_name)')
    await sql.query('CREATE INDEX idx_bills_customer ON bills(customer_id)')
    await sql.query('CREATE INDEX idx_bills_status ON bills(status)')
    await sql.query('CREATE INDEX idx_bills_billing_period ON bills(billing_year, billing_month)')
    await sql.query('CREATE INDEX idx_payments_bill ON payments(bill_id)')
    await sql.query('CREATE INDEX idx_payments_customer ON payments(customer_id)')
    
    console.log('✅ All indexes created')
    
    console.log('\n� Inserting packages...\n')
    
    // Insert packages
    await sql.query(`
      INSERT INTO packages (name, speed, price, description, is_active) VALUES
      ('Paket Voucher', '10 Mbps', 100000, 'Paket voucher internet untuk kebutuhan browsing', true),
      ('Paket Anak', '10 Mbps', 150000, 'Paket internet untuk anak-anak dan kebutuhan keluarga', true),
      ('Paket Keluarga', '10 Mbps', 200000, 'Paket internet keluarga untuk kebutuhan maksimal', true),
      ('Putus', '0 Mbps', 0, 'Paket untuk pelanggan yang putus layanan, hanya menagih hutang tanpa biaya bulanan', true)
    `)
    console.log('✅ Inserted 4 packages')
    
    console.log('\n👥 Inserting customers...\n')
    
    // Insert customers
    await sql.query(`
      INSERT INTO customers (name, email, phone, address, package_name, package_speed, monthly_fee, hutang, status) VALUES
      ('Pa Bayu', 'pa.bayu@tbw.net', '08129695655', '', 'Paket Voucher', '10 Mbps', 100000, 0, 'active'),
      ('Pa Ipan', 'pa.ipan@tbw.net', '081313071917', '', 'Paket Anak', '10 Mbps', 150000, 150000, 'active'),
      ('Bu Siti', 'bu.siti@tbw.net', '088220787016', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Pa Rizky', 'pa.rizky@tbw.net', '081296562013', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Pa Faisal', 'pa.faisal@tbw.net', '085770222733', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Pa Asep', 'pa.asep@tbw.net', '085920032227', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Anggia TB', 'anggia.tb@tbw.net', '085223125780', '', 'Paket Voucher', '10 Mbps', 100000, 0, 'active'),
      ('Ramdani', 'ramdani@tbw.net', '087712380873', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Bu Rosmawati', 'bu.rosmawati@tbw.net', '087850747660', '', 'Paket Anak', '10 Mbps', 150000, 300000, 'active'),
      ('Pa Ahmad', 'pa.ahmad@tbw.net', '081323658985', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Yeti', 'yeti@tbw.net', '085951556195', '', 'Paket Keluarga', '10 Mbps', 200000, 200000, 'active'),
      ('Susi', 'susi@tbw.net', '08773664147', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Endang', 'endang@tbw.net', '087844720321', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Lilip', 'lilip@tbw.net', '083120238470', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Bu Yoyoh', 'bu.yoyoh@tbw.net', '089651543687', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Bu Enur', 'bu.enur@tbw.net', '081248182113', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Patonah', 'patonah@tbw.net', '081997830939', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Iah Siti Solihah', 'iah.siti.solihah@tbw.net', '08996982447', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Risa Rismawati', 'risa.rismawati@tbw.net', '08987782521', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active'),
      ('Pa Candra', 'pa.candra@tbw.net', '6281394569287', '', 'Paket Anak', '10 Mbps', 150000, 0, 'active')
    `)
    console.log('✅ Inserted 20 customers')
    
    console.log('\n📋 Inserting bills (November 2025)...\n')
    
    // Insert bills
    await sql.query(`
      INSERT INTO bills (bill_number, customer_id, customer_name, billing_month, billing_year, amount, previous_debt, total_amount, status, due_date) VALUES
      ('BILL-2025-11-0001', 1, 'Pa Bayu', 'November', 2025, 100000, 0, 100000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0002', 2, 'Pa Ipan', 'November', 2025, 150000, 150000, 300000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0003', 3, 'Bu Siti', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0004', 4, 'Pa Rizky', 'November', 2025, 150000, 0, 150000, 'paid', '2025-11-30'),
      ('BILL-2025-11-0005', 5, 'Pa Faisal', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0006', 6, 'Pa Asep', 'November', 2025, 150000, 0, 150000, 'paid', '2025-11-30'),
      ('BILL-2025-11-0007', 7, 'Anggia TB', 'November', 2025, 100000, 0, 100000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0008', 8, 'Ramdani', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0009', 9, 'Bu Rosmawati', 'November', 2025, 150000, 300000, 450000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0010', 10, 'Pa Ahmad', 'November', 2025, 150000, 0, 150000, 'paid', '2025-11-30'),
      ('BILL-2025-11-0011', 11, 'Yeti', 'November', 2025, 200000, 200000, 400000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0012', 12, 'Susi', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0013', 13, 'Endang', 'November', 2025, 150000, 0, 150000, 'paid', '2025-11-30'),
      ('BILL-2025-11-0014', 14, 'Lilip', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0015', 15, 'Bu Yoyoh', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0016', 16, 'Bu Enur', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0017', 17, 'Patonah', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0018', 18, 'Iah Siti Solihah', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30'),
      ('BILL-2025-11-0019', 19, 'Risa Rismawati', 'November', 2025, 150000, 0, 150000, 'paid', '2025-11-30'),
      ('BILL-2025-11-0020', 20, 'Pa Candra', 'November', 2025, 150000, 0, 150000, 'unpaid', '2025-11-30')
    `)
    console.log('✅ Inserted 20 bills')
    
    console.log('\n💰 Inserting payments...\n')
    
    // Insert payments
    await sql.query(`
      INSERT INTO payments (bill_id, customer_id, amount, payment_method, notes) VALUES
      (4, 4, 150000, 'cash', 'Pembayaran tagihan November 2025'),
      (6, 6, 150000, 'transfer', 'Transfer BCA'),
      (10, 10, 150000, 'cash', 'Lunas'),
      (13, 13, 150000, 'cash', 'Pembayaran cash'),
      (19, 19, 150000, 'transfer', 'Transfer Mandiri')
    `)
    console.log('✅ Inserted 5 payments')
    
    console.log('\n✅ Database setup completed!\n')
    
    // Verify data
    console.log('📊 Verifying data...\n')
    
    const packages = await sql`SELECT COUNT(*) as count FROM packages`
    console.log(`📦 Packages: ${packages[0].count}`)
    
    const customers = await sql`SELECT COUNT(*) as count FROM customers`
    console.log(`👥 Customers: ${customers[0].count}`)
    
    const bills = await sql`SELECT COUNT(*) as count FROM bills`
    console.log(`📋 Bills: ${bills[0].count}`)
    
    const payments = await sql`SELECT COUNT(*) as count FROM payments`
    console.log(`💰 Payments: ${payments[0].count}`)
    
    const unpaidBills = await sql`SELECT COUNT(*) as count FROM bills WHERE status = 'unpaid'`
    console.log(`⏳ Unpaid Bills: ${unpaidBills[0].count}`)
    
    const paidBills = await sql`SELECT COUNT(*) as count FROM bills WHERE status = 'paid'`
    console.log(`✅ Paid Bills: ${paidBills[0].count}`)
    
    console.log('\n🎉 Setup completed successfully!')
    console.log('💡 Your application is now ready to use Neon Database')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase()
