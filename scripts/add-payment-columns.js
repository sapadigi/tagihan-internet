import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_jaoNX63yHqiw@ep-flat-rain-adxuna30-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'

async function addPaymentColumns() {
  const sql = neon(DATABASE_URL)

  try {
    console.log('🔧 Adding payment columns to bills table...')

    // Add paid_amount column
    await sql`
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0
    `
    console.log('✅ paid_amount column added')

    // Add remaining_amount column
    await sql`
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS remaining_amount INTEGER DEFAULT 0
    `
    console.log('✅ remaining_amount column added')

    // Add payment_date column
    await sql`
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP
    `
    console.log('✅ payment_date column added')

    // Update remaining_amount for existing bills (should equal total_amount if not paid)
    await sql`
      UPDATE bills 
      SET remaining_amount = total_amount 
      WHERE remaining_amount = 0 AND status != 'paid'
    `
    console.log('✅ Updated remaining_amount for existing bills')

    // Verify the columns were added
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'bills'
      ORDER BY ordinal_position
    `

    console.log('\n📋 Bills table structure:')
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default || 'none'})`)
    })

    console.log('\n✅ All payment columns added successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

addPaymentColumns()
