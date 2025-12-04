import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { supabase } from '../config/database.js'
import { loginSchema, registerSchema } from '../utils/validation.js'

export const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body)
    const { usernameOrEmail, password } = validated

    // Try to find user by username first
    let { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, full_name, email, role')
      .eq('username', usernameOrEmail)
      .single()

    // If not found by username, try to find by email
    if (error || !user) {
      const emailResult = await supabase
        .from('users')
        .select('id, username, password_hash, full_name, email, role')
        .eq('email', usernameOrEmail)
        .single()
      user = emailResult.data
      error = emailResult.error
    }

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET!
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret not configured' })
    }
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      } as SignOptions
    )

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Login failed' })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body)
    const { username, password, fullName, email, phone, role } = validated
    
    // Set default role to 'user' if not provided
    const userRole = role || 'user'

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    // Check if email already exists (if provided)
    if (email) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' })
      }
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        role: userRole,
        is_active: true,
      })
      .select('id, username, full_name, email, phone, role')
      .single()

    if (error || !newUser) {
      return res.status(500).json({ error: 'Failed to create user' })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET!
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret not configured' })
    }
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      } as SignOptions
    )

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Registration failed' })
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authReq = req as any
    const userId = authReq.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, full_name, email, role')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get user' })
  }
}

