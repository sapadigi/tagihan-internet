-- Create missing functions for bill generation
-- Run this in your Supabase SQL Editor

-- Function to generate bill number
CREATE OR REPLACE FUNCTION generate_bill_number(billing_date DATE)
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    next_id INTEGER;
    new_bill_number TEXT;
BEGIN
    -- Format: BILL-YYYY-MM-XXXX
    year_month := TO_CHAR(billing_date, 'YYYY-MM');
    
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(bill_number FROM 13) AS INTEGER)), 0) + 1
    INTO next_id
    FROM bills
    WHERE bill_number ~ ('^BILL-' || year_month || '-[0-9]+$');
    
    -- Generate new bill number
    new_bill_number := 'BILL-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN new_bill_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number(payment_date DATE)
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    next_id INTEGER;
    new_payment_number TEXT;
BEGIN
    -- Format: PAY-YYYY-MM-XXXX
    year_month := TO_CHAR(payment_date, 'YYYY-MM');
    
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 12) AS INTEGER)), 0) + 1
    INTO next_id
    FROM payments
    WHERE payment_number ~ ('^PAY-' || year_month || '-[0-9]+$');
    
    -- Generate new payment number
    new_payment_number := 'PAY-' || year_month || '-' || LPAD(next_id::TEXT, 4, '0');
    
    RETURN new_payment_number;
END;
$$ LANGUAGE plpgsql;

-- Test the functions
SELECT generate_bill_number(CURRENT_DATE) as test_bill_number;
SELECT generate_payment_number(CURRENT_DATE) as test_payment_number;
