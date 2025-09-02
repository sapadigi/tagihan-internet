// Database setup script for billing system
import { supabase } from './src/lib/supabase.js';

async function setupDatabase() {
  console.log('🚀 Setting up billing database tables...');

  try {
    // Create bills table
    console.log('📋 Creating bills table...');
    const { error: billsError } = await supabase.rpc('exec_sql', {
      sql: `
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

        -- Create function to generate bill number with proper table qualification
        CREATE OR REPLACE FUNCTION generate_bill_number(billing_date DATE)
        RETURNS TEXT AS $$
        DECLARE
            year_month TEXT;
            next_id INTEGER;
            new_bill_number TEXT;
        BEGIN
            -- Format: BILL-YYYY-MM-XXXX
            year_month := TO_CHAR(billing_date, 'YYYY-MM');
            
            -- Get the next sequence number for this month with proper table qualification
            SELECT COALESCE(MAX(CAST(SUBSTRING(bills.bill_number FROM 13) AS INTEGER)), 0) + 1
            INTO next_id
            FROM bills
            WHERE bills.bill_number ~ ('^BILL-' || year_month || '-[0-9]+$');
            
            -- Generate new bill number
            new_bill_number := 'BILL-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
            
            RETURN new_bill_number;
        END;
        $$ language 'plpgsql';
      `
    });

    if (billsError) {
      console.error('❌ Error creating bills table:', billsError);
    } else {
      console.log('✅ Bills table created successfully');
    }

    // Create payments table
    console.log('💳 Creating payments table...');
    const { error: paymentsError } = await supabase.rpc('exec_sql', {
      sql: `
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

        -- Create function to generate payment number with proper table qualification
        CREATE OR REPLACE FUNCTION generate_payment_number(payment_date DATE)
        RETURNS TEXT AS $$
        DECLARE
            year_month TEXT;
            next_id INTEGER;
            new_payment_number TEXT;
        BEGIN
            -- Format: PAY-YYYY-MM-XXXX
            year_month := TO_CHAR(payment_date, 'YYYY-MM');
            
            -- Get the next sequence number for this month with proper table qualification
            SELECT COALESCE(MAX(CAST(SUBSTRING(payments.payment_number FROM 12) AS INTEGER)), 0) + 1
            INTO next_id
            FROM payments
            WHERE payments.payment_number ~ ('^PAY-' || year_month || '-[0-9]+$');
            
            -- Generate new payment number
            new_payment_number := 'PAY-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
            
            RETURN new_payment_number;
        END;
        $$ language 'plpgsql';
      `
    });

    if (paymentsError) {
      console.error('❌ Error creating payments table:', paymentsError);
    } else {
      console.log('✅ Payments table created successfully');
    }

    // Create billing_history table
    console.log('📊 Creating billing_history table...');
    const { error: historyError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (historyError) {
      console.error('❌ Error creating billing_history table:', historyError);
    } else {
      console.log('✅ Billing history table created successfully');
    }

    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Run the setup
setupDatabase();