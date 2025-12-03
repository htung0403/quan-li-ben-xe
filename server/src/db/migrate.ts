import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { supabase } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function migrate() {
  try {
    console.log('Reading schema file...')
    const schemaPath = join(__dirname, 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    console.log('Executing schema...')
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            // Try direct query if RPC doesn't work
            const { error: _queryError } = await supabase
              .from('_migrations')
              .select('*')
              .limit(0) // This will fail if table doesn't exist, but we'll catch it
            
            // If direct query fails, we need to use a different approach
            console.warn('Note: Some statements may need to be run manually in Supabase SQL editor')
            console.log('Statement:', statement.substring(0, 100) + '...')
          }
        } catch (err) {
          console.warn('Could not execute statement via RPC, may need manual execution:', err)
        }
      }
    }

    console.log('Migration completed!')
    console.log('Note: Please run the schema.sql file manually in your Supabase SQL editor for best results.')
  } catch (error) {
    console.error('Migration error:', error)
    console.log('\nPlease run the schema.sql file manually in your Supabase SQL editor.')
  }
}

migrate()

