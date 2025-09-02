-- Fix for "column reference 'bill_number' is ambiguous" error
-- Run this SQL script in your Supabase SQL Editor

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS generate_bill_number(DATE);
DROP FUNCTION IF EXISTS generate_payment_number(DATE);

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
    -- This prevents the "ambiguous column reference" error
    SELECT COALESCE(MAX(CAST(SUBSTRING(bills.bill_number FROM 13) AS INTEGER)), 0) + 1
    INTO next_id
    FROM bills
    WHERE bills.bill_number ~ ('^BILL-' || year_month || '-[0-9]+$');
    
    -- Generate new bill number
    new_bill_number := 'BILL-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN new_bill_number;
END;
$$ language 'plpgsql';

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
    -- This prevents the "ambiguous column reference" error
    SELECT COALESCE(MAX(CAST(SUBSTRING(payments.payment_number FROM 12) AS INTEGER)), 0) + 1
    INTO next_id
    FROM payments
    WHERE payments.payment_number ~ ('^PAY-' || year_month || '-[0-9]+$');
    
    -- Generate new payment number
    new_payment_number := 'PAY-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN new_payment_number;
END;
$$ language 'plpgsql';

-- Test the functions to make sure they work
-- Comment out the lines below if you don't want to test immediately

-- SELECT generate_bill_number(CURRENT_DATE) as test_bill_number;
-- SELECT generate_payment_number(CURRENT_DATE) as test_payment_number;

-- The above functions should now work without the "ambiguous column reference" error
