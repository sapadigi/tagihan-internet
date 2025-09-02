// Fix for ambiguous column reference error
import { createClient } from '@supabase/supabase-js';

// Using environment variables directly for Node.js compatibility
const supabaseUrl = 'https://rdczahbtuvohfrcnzqne.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkY3phaGJ0dXZvaGZyY256cW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MDAyMjUsImV4cCI6MjA3MjM3NjIyNX0.75AefoX6X2BBplCJ9V_VF9Lldn-4AAZ9JcjxK2801rY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAmbiguousColumnError() {
  console.log('🔧 Fixing ambiguous column reference error...');

  try {
    // Drop and recreate the generate_bill_number function with proper table qualification
    console.log('📋 Updating generate_bill_number function...');
    const { error: billFunctionError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing function
        DROP FUNCTION IF EXISTS generate_bill_number(DATE);
        
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

    if (billFunctionError) {
      console.error('❌ Error updating generate_bill_number function:', billFunctionError);
    } else {
      console.log('✅ generate_bill_number function updated successfully');
    }

    // Drop and recreate the generate_payment_number function with proper table qualification
    console.log('💳 Updating generate_payment_number function...');
    const { error: paymentFunctionError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing function
        DROP FUNCTION IF EXISTS generate_payment_number(DATE);
        
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

    if (paymentFunctionError) {
      console.error('❌ Error updating generate_payment_number function:', paymentFunctionError);
    } else {
      console.log('✅ generate_payment_number function updated successfully');
    }

    console.log('🎉 Ambiguous column reference fix completed!');
    console.log('✨ You can now try generating bills again.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixAmbiguousColumnError();
