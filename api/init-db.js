import { neon } from '@neondatabase/serverless';

export async function initializeDatabase() {
  try {
    // Get database URL from environment
    const dbUrl = import.meta.env.VITE_DATABASE_URL;
    if (!dbUrl) {
      throw new Error('VITE_DATABASE_URL tidak ditemukan di environment variables');
    }
    
    const sql = neon(dbUrl);
    console.log('Creating database tables...');

    // Create packages table
    await sql`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        speed VARCHAR(50) NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
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
      )
    `;

    // Create bills table
    await sql`
      CREATE TABLE IF NOT EXISTS bills (
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
    `;

    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        payment_method VARCHAR(50),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create billing_history table
    await sql`
      CREATE TABLE IF NOT EXISTS billing_history (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables created successfully!');

    // Insert default packages if not exists
    const existingPackages = await sql`SELECT COUNT(*) as count FROM packages`;
    
    if (existingPackages[0].count === '0') {
      console.log('Inserting default packages...');
      
      await sql`
        INSERT INTO packages (name, speed, price, description, is_active)
        VALUES 
          ('Basic', '10 Mbps', 100000, 'Paket internet dasar untuk kebutuhan browsing', true),
          ('Standard', '20 Mbps', 150000, 'Paket internet standar untuk streaming dan gaming', true),
          ('Premium', '50 Mbps', 200000, 'Paket internet premium untuk kebutuhan bisnis', true),
          ('Putus', '0 Mbps', 0, 'Paket untuk pelanggan yang putus layanan, hanya menagih hutang tanpa biaya bulanan', true)
      `;
      
      console.log('Default packages inserted!');
    }

    // Insert sample customers if not exists
    const existingCustomers = await sql`SELECT COUNT(*) as count FROM customers`;
    
    if (existingCustomers[0].count === '0') {
      console.log('Inserting sample customers...');
      
      await sql`
        INSERT INTO customers (name, email, phone, address, package_name, package_speed, monthly_fee, status)
        VALUES 
          ('Budi Santoso', 'budi@email.com', '081234567890', 'Jl. Merdeka No. 123, Jakarta', 'Standard', '20 Mbps', 150000, 'active'),
          ('Siti Nurhaliza', 'siti@email.com', '081234567891', 'Jl. Sudirman No. 456, Bandung', 'Premium', '50 Mbps', 200000, 'active'),
          ('Ahmad Rahman', 'ahmad@email.com', '081234567892', 'Jl. Gatot Subroto No. 789, Surabaya', 'Basic', '10 Mbps', 100000, 'active')
      `;
      
      console.log('Sample customers inserted!');
    }

    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error: error.message };
  }
}
