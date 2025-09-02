-- Quick Database Setup for Billing System
-- Copy and paste this entire SQL into Supabase SQL Editor and run it

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  previous_debt DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
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
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'card', 'ewallet')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reference_number VARCHAR(100),
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_history table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  billing_month DATE NOT NULL,
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
    new_bill_number TEXT;
BEGIN
    year_month := TO_CHAR(billing_date, 'YYYY-MM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(bills.bill_number FROM 13) AS INTEGER)), 0) + 1
    INTO next_id
    FROM bills
    WHERE bills.bill_number ~ ('^BILL-' || year_month || '-[0-9]+$');
    
    new_bill_number := 'BILL-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN new_bill_number;
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
    year_month := TO_CHAR(payment_date, 'YYYY-MM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 12) AS INTEGER)), 0) + 1
    INTO next_id
    FROM payments
    WHERE payment_number ~ ('^PAY-' || year_month || '-[0-9]+$');
    
    payment_number := 'PAY-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN payment_number;
END;
$$ language 'plpgsql';

-- Create function to update bill status and remaining amount
CREATE OR REPLACE FUNCTION update_bill_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.remaining_amount := NEW.total_amount - NEW.paid_amount;
    
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

-- Enable Row Level Security
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON bills FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON bills FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON bills FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON payments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON payments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON payments FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON billing_history FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON billing_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON billing_history FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON billing_history FOR DELETE USING (true);

-- Success message
SELECT 'Billing system database setup completed successfully!' as message;