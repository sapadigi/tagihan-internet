import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_jaoNX63yHqiw@ep-flat-rain-adxuna30-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'

async function addCompensationColumn() {
  const sql = neon(DATABASE_URL)

  try {
    console.log('🔧 Adding compensation column to bills table...')

    // Add compensation column
    await sql`
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS compensation INTEGER DEFAULT 0
    `

    console.log('✅ Compensation column added successfully!')

    // Verify the column was added
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

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

addCompensationColumn()
