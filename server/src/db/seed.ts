import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { supabase } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function seed() {
  try {
    console.log('Reading mock data file...')
    const seedPath = join(__dirname, 'mock_data.sql')
    const seedSql = readFileSync(seedPath, 'utf-8')

    console.log('Executing seed data...')
    
    // Try to execute the whole block
    const { error } = await supabase.rpc('exec_sql', { sql: seedSql })
    
    if (error) {
      console.error('Error executing seed data via RPC:', error)
      console.log('Please run the content of src/db/mock_data.sql manually in your Supabase SQL editor.')
    } else {
      console.log('Seed data inserted successfully!')
    }

  } catch (error) {
    console.error('Seed error:', error)
    console.log('\nPlease run src/db/mock_data.sql manually in your Supabase SQL editor.')
  }
}

seed()
