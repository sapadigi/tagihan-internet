-- Add hutang field to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS hutang DECIMAL(12,2) DEFAULT 0;

-- Add some sample hutang data for testing
-- UPDATE customers SET hutang = 25000 WHERE customer_id = 'CUST-001';
-- UPDATE customers SET hutang = 50000 WHERE customer_id = 'CUST-002';
-- UPDATE customers SET hutang = 0 WHERE customer_id = 'CUST-003';

-- Check if the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'hutang';
