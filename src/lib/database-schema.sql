-- Database schema for Internet Billing System
-- Run these SQL commands in your Supabase SQL editor

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id VARCHAR(20) UNIQUE NOT NULL, -- Custom ID like CUST-001
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  package_name VARCHAR(100),
  package_speed VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
  monthly_fee DECIMAL(12,2) DEFAULT 0,
  hutang DECIMAL(12,2) DEFAULT 0, -- Total debt/outstanding amount
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packages table (for reference)
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  speed VARCHAR(50) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample packages
INSERT INTO packages (name, speed, price, description) VALUES
('Home 25 Mbps', '25 Mbps', 500000, 'Paket internet rumahan dengan kecepatan 25 Mbps'),
('Home 50 Mbps', '50 Mbps', 750000, 'Paket internet rumahan dengan kecepatan 50 Mbps'),
('Business 100 Mbps', '100 Mbps', 2500000, 'Paket internet bisnis dengan kecepatan 100 Mbps'),
('Enterprise 200 Mbps', '200 Mbps', 4500000, 'Paket internet enterprise dengan kecepatan 200 Mbps'),
('Education 75 Mbps', '75 Mbps', 1200000, 'Paket khusus institusi pendidikan dengan kecepatan 75 Mbps');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for customers table
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate customer ID
CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS TRIGGER AS $$
DECLARE
    next_id INTEGER;
    new_customer_id VARCHAR(20);
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(customer_id FROM 6) AS INTEGER)), 0) + 1
    INTO next_id
    FROM customers
    WHERE customer_id ~ '^CUST-[0-9]+$';
    
    -- Generate new customer ID
    new_customer_id := 'CUST-' || LPAD(next_id::TEXT, 3, '0');
    
    -- Assign to NEW record
    NEW.customer_id := new_customer_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-generating customer ID
CREATE TRIGGER generate_customer_id_trigger
    BEFORE INSERT ON customers
    FOR EACH ROW
    WHEN (NEW.customer_id IS NULL)
    EXECUTE FUNCTION generate_customer_id();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON customers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON packages FOR SELECT USING (true);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number VARCHAR(50) UNIQUE NOT NULL, -- Format: BILL-YYYY-MM-XXXX
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  previous_debt DECIMAL(12,2) DEFAULT 0, -- Debt from previous month
  total_amount DECIMAL(12,2) NOT NULL, -- amount + previous_debt
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_amount DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_number VARCHAR(50) UNIQUE NOT NULL, -- Format: PAY-YYYY-MM-XXXX
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'card', 'ewallet')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reference_number VARCHAR(100), -- For bank transfer reference
  notes TEXT,
  created_by VARCHAR(100), -- Admin who recorded the payment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_history table for tracking bill generation
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  billing_month DATE NOT NULL, -- First day of the billing month
  total_customers INTEGER NOT NULL,
  total_bills_generated INTEGER NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  generation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_billing_period ON bills(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Create trigger for bills table
CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate bill number
CREATE OR REPLACE FUNCTION generate_bill_number(billing_date DATE)
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    next_id INTEGER;
    bill_number TEXT;
BEGIN
    -- Format: BILL-YYYY-MM-XXXX
    year_month := TO_CHAR(billing_date, 'YYYY-MM');
    
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(bills.bill_number FROM 13) AS INTEGER)), 0) + 1
    INTO next_id
    FROM bills
    WHERE bills.bill_number ~ ('^BILL-' || year_month || '-[0-9]+$');
    
    -- Generate new bill number
    bill_number := 'BILL-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN bill_number;
END;
$$ language 'plpgsql';

-- Create function to generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number(payment_date DATE)
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    next_id INTEGER;
    payment_number TEXT;
BEGIN
    -- Format: PAY-YYYY-MM-XXXX
    year_month := TO_CHAR(payment_date, 'YYYY-MM');
    
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(payments.payment_number FROM 12) AS INTEGER)), 0) + 1
    INTO next_id
    FROM payments
    WHERE payments.payment_number ~ ('^PAY-' || year_month || '-[0-9]+$');
    
    -- Generate new payment number
    payment_number := 'PAY-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN payment_number;
END;
$$ language 'plpgsql';

-- Create function to update bill status and remaining amount
CREATE OR REPLACE FUNCTION update_bill_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update remaining amount
    NEW.remaining_amount := NEW.total_amount - NEW.paid_amount;
    
    -- Update status based on payment
    IF NEW.paid_amount >= NEW.total_amount THEN
        NEW.status := 'paid';
        NEW.payment_date := COALESCE(NEW.payment_date, NOW());
    ELSIF NEW.due_date < CURRENT_DATE AND NEW.paid_amount < NEW.total_amount THEN
        NEW.status := 'overdue';
    ELSE
        NEW.status := 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic bill status update
CREATE TRIGGER update_bill_status_trigger
    BEFORE INSERT OR UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION update_bill_status();

-- Enable Row Level Security for new tables
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Create policies for bills table
CREATE POLICY "Enable read access for all users" ON bills FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON bills FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON bills FOR DELETE USING (true);

-- Create policies for payments table
CREATE POLICY "Enable read access for all users" ON payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON payments FOR DELETE USING (true);

-- Create policies for billing_history table
CREATE POLICY "Enable read access for all users" ON billing_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON billing_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON billing_history FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON billing_history FOR DELETE USING (true);