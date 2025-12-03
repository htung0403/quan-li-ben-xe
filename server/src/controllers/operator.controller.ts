import { Request, Response } from 'express'
import { supabase } from '../config/database.js'
import { z } from 'zod'

const operatorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  taxCode: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  representativeName: z.string().optional(),
  contractNumber: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
})

export const getAllOperators = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query

    let query = supabase
      .from('operators')
      .select('*')
      .order('created_at', { ascending: false })

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query

    if (error) throw error

    const operators = data.map((op: any) => ({
      id: op.id,
      name: op.name,
      code: op.code,
      taxCode: op.tax_code,
      address: op.address,
      phone: op.phone,
      email: op.email,
      representativeName: op.representative_name,
      contractNumber: op.contract_number,
      contractStartDate: op.contract_start_date,
      contractEndDate: op.contract_end_date,
      isActive: op.is_active,
      createdAt: op.created_at,
      updatedAt: op.updated_at,
    }))

    return res.json(operators)
  } catch (error) {
    console.error('Error fetching operators:', error)
    return res.status(500).json({ error: 'Failed to fetch operators' })
  }
}

export const getOperatorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Operator not found' })
    }

    return res.json({
      id: data.id,
      name: data.name,
      code: data.code,
      taxCode: data.tax_code,
      address: data.address,
      phone: data.phone,
      email: data.email,
      representativeName: data.representative_name,
      contractNumber: data.contract_number,
      contractStartDate: data.contract_start_date,
      contractEndDate: data.contract_end_date,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error fetching operator:', error)
    return res.status(500).json({ error: 'Failed to fetch operator' })
  }
}

export const createOperator = async (req: Request, res: Response) => {
  try {
    const validated = operatorSchema.parse(req.body)

    const { data, error } = await supabase
      .from('operators')
      .insert({
        name: validated.name,
        code: validated.code,
        tax_code: validated.taxCode || null,
        address: validated.address || null,
        phone: validated.phone || null,
        email: validated.email || null,
        representative_name: validated.representativeName || null,
        contract_number: validated.contractNumber || null,
        contract_start_date: validated.contractStartDate || null,
        contract_end_date: validated.contractEndDate || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({
      id: data.id,
      name: data.name,
      code: data.code,
      taxCode: data.tax_code,
      address: data.address,
      phone: data.phone,
      email: data.email,
      representativeName: data.representative_name,
      contractNumber: data.contract_number,
      contractStartDate: data.contract_start_date,
      contractEndDate: data.contract_end_date,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error: any) {
    console.error('Error creating operator:', error)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Operator with this code already exists' })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    return res.status(500).json({ error: error.message || 'Failed to create operator' })
  }
}

export const updateOperator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const validated = operatorSchema.partial().parse(req.body)

    const updateData: any = {}
    if (validated.name) updateData.name = validated.name
    if (validated.code) updateData.code = validated.code
    if (validated.taxCode !== undefined) updateData.tax_code = validated.taxCode || null
    if (validated.address !== undefined) updateData.address = validated.address || null
    if (validated.phone !== undefined) updateData.phone = validated.phone || null
    if (validated.email !== undefined) updateData.email = validated.email || null
    if (validated.representativeName !== undefined) updateData.representative_name = validated.representativeName || null
    if (validated.contractNumber !== undefined) updateData.contract_number = validated.contractNumber || null
    if (validated.contractStartDate !== undefined) updateData.contract_start_date = validated.contractStartDate || null
    if (validated.contractEndDate !== undefined) updateData.contract_end_date = validated.contractEndDate || null

    const { data, error } = await supabase
      .from('operators')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Operator not found' })
    }

    return res.json({
      id: data.id,
      name: data.name,
      code: data.code,
      taxCode: data.tax_code,
      address: data.address,
      phone: data.phone,
      email: data.email,
      representativeName: data.representative_name,
      contractNumber: data.contract_number,
      contractStartDate: data.contract_start_date,
      contractEndDate: data.contract_end_date,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error: any) {
    console.error('Error updating operator:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    return res.status(500).json({ error: error.message || 'Failed to update operator' })
  }
}

export const deleteOperator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('operators')
      .delete()
      .eq('id', id)

    if (error) throw error

    return res.status(204).send()
  } catch (error) {
    console.error('Error deleting operator:', error)
    return res.status(500).json({ error: 'Failed to delete operator' })
  }
}

