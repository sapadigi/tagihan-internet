// Test Neon Connection
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL = process.env.VITE_DATABASE_URL

console.log('Testing Neon Connection...')
console.log('DATABASE_URL exists:', !!DATABASE_URL)
console.log('DATABASE_URL:', DATABASE_URL ? DATABASE_URL.substring(0, 30) + '...' : 'NOT FOUND')

if (!DATABASE_URL) {
  console.error('❌ VITE_DATABASE_URL not found in environment')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function testConnection() {
  try {
    console.log('\n🔍 Testing database connection...')
    
    // Test connection
    const result = await sql`SELECT NOW() as current_time`
    console.log('✅ Connection successful!')
    console.log('⏰ Server time:', result[0].current_time)
    
    // Check bills
    console.log('\n📋 Checking bills table...')
    const bills = await sql`SELECT COUNT(*) as count FROM bills`
    console.log('📊 Total bills in database:', bills[0].count)
    
    // Get sample bills
    const sampleBills = await sql`
      SELECT 
        b.id,
        b.bill_number,
        b.customer_name,
        b.billing_month,
        b.billing_year,
        b.amount,
        b.status
      FROM bills b
      LIMIT 5
    `
    
    console.log('\n📄 Sample bills:')
    sampleBills.forEach(bill => {
      console.log(`  - ${bill.bill_number}: ${bill.customer_name} - Rp ${bill.amount.toLocaleString()} (${bill.status})`)
    })
    
    // Check customers
    console.log('\n👥 Checking customers table...')
    const customers = await sql`SELECT COUNT(*) as count FROM customers`
    console.log('📊 Total customers in database:', customers[0].count)
    
    console.log('\n✅ All tests passed!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

testConnection()
