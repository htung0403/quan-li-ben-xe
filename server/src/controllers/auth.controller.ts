import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { supabase } from '../config/database.js'
import { loginSchema } from '../utils/validation.js'

export const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body)
    const { username, password } = validated

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, full_name, email, role')
      .eq('username', username)
      .single()

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

