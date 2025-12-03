import { Request, Response } from 'express'
import { supabase } from '../config/database.js'
import { z } from 'zod'

const serviceChargeSchema = z.object({
  dispatchRecordId: z.string().uuid('Invalid dispatch record ID'),
  serviceTypeId: z.string().uuid('Invalid service type ID'),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  totalAmount: z.number().nonnegative('Total amount must be non-negative'),
})

export const getAllServiceCharges = async (req: Request, res: Response) => {
  try {
    const { dispatchRecordId } = req.query

    let query = supabase
      .from('service_charges')
      .select(`
        *,
        service_types:service_type_id(id, code, name, base_price, unit)
      `)
      .order('created_at', { ascending: false })

    if (dispatchRecordId) {
      query = query.eq('dispatch_record_id', dispatchRecordId as string)
    }

    const { data, error } = await query

    if (error) throw error

    const serviceCharges = data.map((charge: any) => ({
      id: charge.id,
      dispatchRecordId: charge.dispatch_record_id,
      serviceTypeId: charge.service_type_id,
      serviceType: charge.service_types ? {
        id: charge.service_types.id,
        code: charge.service_types.code,
        name: charge.service_types.name,
        basePrice: parseFloat(charge.service_types.base_price),
        unit: charge.service_types.unit,
      } : undefined,
      quantity: parseFloat(charge.quantity),
      unitPrice: parseFloat(charge.unit_price),
      totalAmount: parseFloat(charge.total_amount),
      createdAt: charge.created_at,
    }))

    return res.json(serviceCharges)
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch service charges' })
  }
}

export const getServiceChargeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('service_charges')
      .select(`
        *,
        service_types:service_type_id(id, code, name, base_price, unit)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Service charge not found' })
    }

    return res.json({
      id: data.id,
      dispatchRecordId: data.dispatch_record_id,
      serviceTypeId: data.service_type_id,
      serviceType: data.service_types ? {
        id: data.service_types.id,
        code: data.service_types.code,
        name: data.service_types.name,
        basePrice: parseFloat(data.service_types.base_price),
        unit: data.service_types.unit,
      } : undefined,
      quantity: parseFloat(data.quantity),
      unitPrice: parseFloat(data.unit_price),
      totalAmount: parseFloat(data.total_amount),
      createdAt: data.created_at,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch service charge' })
  }
}

export const createServiceCharge = async (req: Request, res: Response) => {
  try {
    const validated = serviceChargeSchema.parse(req.body)

    const { data, error } = await supabase
      .from('service_charges')
      .insert({
        dispatch_record_id: validated.dispatchRecordId,
        service_type_id: validated.serviceTypeId,
        quantity: validated.quantity,
        unit_price: validated.unitPrice,
        total_amount: validated.totalAmount,
      })
      .select(`
        *,
        service_types:service_type_id(id, code, name, base_price, unit)
      `)
      .single()

    if (error) throw error

    return res.status(201).json({
      id: data.id,
      dispatchRecordId: data.dispatch_record_id,
      serviceTypeId: data.service_type_id,
      serviceType: data.service_types ? {
        id: data.service_types.id,
        code: data.service_types.code,
        name: data.service_types.name,
        basePrice: parseFloat(data.service_types.base_price),
        unit: data.service_types.unit,
      } : undefined,
      quantity: parseFloat(data.quantity),
      unitPrice: parseFloat(data.unit_price),
      totalAmount: parseFloat(data.total_amount),
      createdAt: data.created_at,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    return res.status(500).json({ error: error.message || 'Failed to create service charge' })
  }
}

export const deleteServiceCharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('service_charges')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete service charge' })
  }
}

export const getAllServiceTypes = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query

    let query = supabase
      .from('service_types')
      .select('*')
      .order('name', { ascending: true })

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data, error } = await query

    if (error) throw error

    const serviceTypes = data.map((st: any) => ({
      id: st.id,
      code: st.code,
      name: st.name,
      description: st.description,
      basePrice: parseFloat(st.base_price),
      unit: st.unit,
      isActive: st.is_active,
      createdAt: st.created_at,
      updatedAt: st.updated_at,
    }))

    res.json(serviceTypes)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch service types' })
  }
}

