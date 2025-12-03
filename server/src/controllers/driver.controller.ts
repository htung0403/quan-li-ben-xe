import { Request, Response } from 'express'
import { supabase } from '../config/database.js'
import { z } from 'zod'

const driverSchema = z.object({
  operatorId: z.string().uuid('Invalid operator ID'),
  fullName: z.string().min(1, 'Full name is required'),
  idNumber: z.string().min(1, 'ID number is required'),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseClass: z.string().min(1, 'License class is required'),
  licenseIssueDate: z.string().optional(),
  licenseExpiryDate: z.string().min(1, 'License expiry date is required'),
  healthCertificateExpiry: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const { operatorId, isActive } = req.query

    let query = supabase
      .from('drivers')
      .select(`
        *,
        operators:operator_id(id, name, code)
      `)
      .order('created_at', { ascending: false })

    if (operatorId) {
      query = query.eq('operator_id', operatorId as string)
    }
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query

    if (error) throw error

    const drivers = data.map((driver: any) => ({
      id: driver.id,
      operatorId: driver.operator_id,
      operator: driver.operators ? {
        id: driver.operators.id,
        name: driver.operators.name,
        code: driver.operators.code,
      } : undefined,
      fullName: driver.full_name,
      idNumber: driver.id_number,
      dateOfBirth: driver.date_of_birth,
      phone: driver.phone,
      email: driver.email,
      address: driver.address,
      licenseNumber: driver.license_number,
      licenseClass: driver.license_class,
      licenseIssueDate: driver.license_issue_date,
      licenseExpiryDate: driver.license_expiry_date,
      healthCertificateExpiry: driver.health_certificate_expiry,
      imageUrl: driver.image_url,
      isActive: driver.is_active,
      notes: driver.notes,
      createdAt: driver.created_at,
      updatedAt: driver.updated_at,
    }))

    return res.json(drivers)
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return res.status(500).json({ error: 'Failed to fetch drivers' })
  }
}

export const getDriverById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        operators:operator_id(id, name, code)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Driver not found' })
    }

    return res.json({
      id: data.id,
      operatorId: data.operator_id,
      operator: (data as any).operators ? {
        id: (data as any).operators.id,
        name: (data as any).operators.name,
        code: (data as any).operators.code,
      } : undefined,
      fullName: data.full_name,
      idNumber: data.id_number,
      dateOfBirth: data.date_of_birth,
      phone: data.phone,
      email: data.email,
      address: data.address,
      licenseNumber: data.license_number,
      licenseClass: data.license_class,
      licenseIssueDate: data.license_issue_date,
      licenseExpiryDate: data.license_expiry_date,
      healthCertificateExpiry: data.health_certificate_expiry,
      imageUrl: data.image_url,
      isActive: data.is_active,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error fetching driver:', error)
    return res.status(500).json({ error: 'Failed to fetch driver' })
  }
}

export const createDriver = async (req: Request, res: Response) => {
  try {
    const validated = driverSchema.parse(req.body)
    const {
      operatorId,
      fullName,
      idNumber,
      dateOfBirth,
      phone,
      email,
      address,
      licenseNumber,
      licenseClass,
      licenseIssueDate,
      licenseExpiryDate,
      healthCertificateExpiry,
      imageUrl,
      notes,
    } = validated

    const { data, error } = await supabase
      .from('drivers')
      .insert({
        operator_id: operatorId,
        full_name: fullName,
        id_number: idNumber,
        date_of_birth: dateOfBirth || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        license_number: licenseNumber,
        license_class: licenseClass,
        license_issue_date: licenseIssueDate || null,
        license_expiry_date: licenseExpiryDate,
        health_certificate_expiry: healthCertificateExpiry || null,
        image_url: imageUrl || null,
        notes: notes || null,
        is_active: true,
      })
      .select(`
        *,
        operators:operator_id(id, name, code)
      `)
      .single()

    if (error) throw error

    return res.status(201).json({
      id: data.id,
      operatorId: data.operator_id,
      operator: (data as any).operators ? {
        id: (data as any).operators.id,
        name: (data as any).operators.name,
        code: (data as any).operators.code,
      } : undefined,
      fullName: data.full_name,
      idNumber: data.id_number,
      dateOfBirth: data.date_of_birth,
      phone: data.phone,
      email: data.email,
      address: data.address,
      licenseNumber: data.license_number,
      licenseClass: data.license_class,
      licenseIssueDate: data.license_issue_date,
      licenseExpiryDate: data.license_expiry_date,
      healthCertificateExpiry: data.health_certificate_expiry,
      imageUrl: data.image_url,
      isActive: data.is_active,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error: any) {
    console.error('Error creating driver:', error)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Driver with this ID number or license already exists' })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    return res.status(500).json({ error: error.message || 'Failed to create driver' })
  }
}

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const validated = driverSchema.partial().parse(req.body)

    const updateData: any = {}
    if (validated.operatorId) updateData.operator_id = validated.operatorId
    if (validated.fullName) updateData.full_name = validated.fullName
    if (validated.idNumber) updateData.id_number = validated.idNumber
    if (validated.dateOfBirth !== undefined) updateData.date_of_birth = validated.dateOfBirth || null
    if (validated.phone !== undefined) updateData.phone = validated.phone || null
    if (validated.email !== undefined) updateData.email = validated.email || null
    if (validated.address !== undefined) updateData.address = validated.address || null
    if (validated.licenseNumber) updateData.license_number = validated.licenseNumber
    if (validated.licenseClass) updateData.license_class = validated.licenseClass
    if (validated.licenseIssueDate !== undefined) updateData.license_issue_date = validated.licenseIssueDate || null
    if (validated.licenseExpiryDate) updateData.license_expiry_date = validated.licenseExpiryDate
    if (validated.healthCertificateExpiry !== undefined) updateData.health_certificate_expiry = validated.healthCertificateExpiry || null
    if (validated.imageUrl !== undefined) updateData.image_url = validated.imageUrl || null
    if (validated.notes !== undefined) updateData.notes = validated.notes || null

    const { data, error } = await supabase
      .from('drivers')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        operators:operator_id(id, name, code)
      `)
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Driver not found' })
    }

    return res.json({
      id: data.id,
      operatorId: data.operator_id,
      operator: (data as any).operators ? {
        id: (data as any).operators.id,
        name: (data as any).operators.name,
        code: (data as any).operators.code,
      } : undefined,
      fullName: data.full_name,
      idNumber: data.id_number,
      dateOfBirth: data.date_of_birth,
      phone: data.phone,
      email: data.email,
      address: data.address,
      licenseNumber: data.license_number,
      licenseClass: data.license_class,
      licenseIssueDate: data.license_issue_date,
      licenseExpiryDate: data.license_expiry_date,
      healthCertificateExpiry: data.health_certificate_expiry,
      imageUrl: data.image_url,
      isActive: data.is_active,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error: any) {
    console.error('Error updating driver:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    return res.status(500).json({ error: error.message || 'Failed to update driver' })
  }
}

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id)

    if (error) throw error

    return res.status(204).send()
  } catch (error) {
    console.error('Error deleting driver:', error)
    return res.status(500).json({ error: 'Failed to delete driver' })
  }
}
