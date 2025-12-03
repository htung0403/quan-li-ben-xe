import bcrypt from 'bcryptjs'
import { supabase } from '../config/database.js'
import dotenv from 'dotenv'

dotenv.config()

async function createAdmin() {
  const username = process.argv[2] || 'admin'
  const password = process.argv[3] || 'admin123'
  const fullName = process.argv[4] || 'Administrator'

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      console.log(`User "${username}" already exists. Updating password...`)
      const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username)

      if (error) throw error
      console.log(`✅ Password updated for user "${username}"`)
    } else {
      // Create new user
      const { data: _data, error } = await supabase
        .from('users')
        .insert({
          username,
          password_hash: passwordHash,
          full_name: fullName,
          role: 'admin',
        })
        .select()
        .single()

      if (error) throw error
      console.log(`✅ Admin user created successfully!`)
      console.log(`   Username: ${username}`)
      console.log(`   Full Name: ${fullName}`)
      console.log(`   Role: admin`)
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdmin()

