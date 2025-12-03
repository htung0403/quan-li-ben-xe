import { Request, Response } from 'express'
import { supabase } from '../config/database.js'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth.js'

const dispatchSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  driverId: z.string().uuid('Invalid driver ID'),
  scheduleId: z.string().uuid().optional(),
  routeId: z.string().uuid('Invalid route ID'),
  entryTime: z.string().datetime('Invalid entry time'),
  notes: z.string().optional(),
})

export const getAllDispatchRecords = async (req: Request, res: Response) => {
  try {
    const { status, vehicleId, driverId, routeId } = req.query

    let query = supabase
      .from('dispatch_records')
      .select('*')
      .order('entry_time', { ascending: false })

    if (status) {
      query = query.eq('current_status', status as string)
    }
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId as string)
    }
    if (driverId) {
      query = query.eq('driver_id', driverId as string)
    }
    if (routeId) {
      query = query.eq('route_id', routeId as string)
    }

    const { data: records, error } = await query

    if (error) throw error

    // Fetch related data
    const vehicleIds = [...new Set(records.map((r: any) => r.vehicle_id))]
    const driverIds = [...new Set(records.map((r: any) => r.driver_id))]
    const routeIds = [...new Set(records.map((r: any) => r.route_id))]

    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, plate_number')
      .in('id', vehicleIds)

    const { data: drivers } = await supabase
      .from('drivers')
      .select('id, full_name')
      .in('id', driverIds)

    const { data: routes } = await supabase
      .from('routes')
      .select('id, route_name')
      .in('id', routeIds)

    const vehicleMap = new Map(vehicles?.map((v: any) => [v.id, v.plate_number]) || [])
    const driverMap = new Map(drivers?.map((d: any) => [d.id, d.full_name]) || [])
    const routeMap = new Map(routes?.map((r: any) => [r.id, r.route_name]) || [])

    const result = records.map((record: any) => ({
      id: record.id,
      vehicleId: record.vehicle_id,
      vehiclePlateNumber: vehicleMap.get(record.vehicle_id) || '',
      driverId: record.driver_id,
      driverName: driverMap.get(record.driver_id) || '',
      scheduleId: record.schedule_id,
      routeId: record.route_id,
      routeName: routeMap.get(record.route_id) || '',
      entryTime: record.entry_time,
      entryBy: record.entry_by,
      passengerDropTime: record.passenger_drop_time,
      passengersArrived: record.passengers_arrived,
      passengerDropBy: record.passenger_drop_by,
      boardingPermitTime: record.boarding_permit_time,
      plannedDepartureTime: record.planned_departure_time,
      transportOrderCode: record.transport_order_code,
      seatCount: record.seat_count,
      permitStatus: record.permit_status,
      rejectionReason: record.rejection_reason,
      boardingPermitBy: record.boarding_permit_by,
      paymentTime: record.payment_time,
      paymentAmount: record.payment_amount ? parseFloat(record.payment_amount) : null,
      paymentMethod: record.payment_method,
      invoiceNumber: record.invoice_number,
      paymentBy: record.payment_by,
      departureOrderTime: record.departure_order_time,
      passengersDeparting: record.passengers_departing,
      departureOrderBy: record.departure_order_by,
      exitTime: record.exit_time,
      exitBy: record.exit_by,
      currentStatus: record.current_status,
      notes: record.notes,
      metadata: record.metadata,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }))

    return res.json(result)
  } catch (error) {
    console.error('Error fetching dispatch records:', error)
    return res.status(500).json({ error: 'Failed to fetch dispatch records' })
  }
}

export const getDispatchRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: record, error } = await supabase
      .from('dispatch_records')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!record) {
      return res.status(404).json({ error: 'Dispatch record not found' })
    }

    // Fetch related data
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id, plate_number')
      .eq('id', record.vehicle_id)
      .single()

    const { data: driver } = await supabase
      .from('drivers')
      .select('id, full_name')
      .eq('id', record.driver_id)
      .single()

    const { data: route } = await supabase
      .from('routes')
      .select('id, route_name')
      .eq('id', record.route_id)
      .single()

    return res.json({
      id: record.id,
      vehicleId: record.vehicle_id,
      vehiclePlateNumber: vehicle?.plate_number || '',
      driverId: record.driver_id,
      driverName: driver?.full_name || '',
      scheduleId: record.schedule_id,
      routeId: record.route_id,
      routeName: route?.route_name || '',
      entryTime: record.entry_time,
      entryBy: record.entry_by,
      passengerDropTime: record.passenger_drop_time,
      passengersArrived: record.passengers_arrived,
      passengerDropBy: record.passenger_drop_by,
      boardingPermitTime: record.boarding_permit_time,
      plannedDepartureTime: record.planned_departure_time,
      transportOrderCode: record.transport_order_code,
      seatCount: record.seat_count,
      permitStatus: record.permit_status,
      rejectionReason: record.rejection_reason,
      boardingPermitBy: record.boarding_permit_by,
      paymentTime: record.payment_time,
      paymentAmount: record.payment_amount ? parseFloat(record.payment_amount) : null,
      paymentMethod: record.payment_method,
      invoiceNumber: record.invoice_number,
      paymentBy: record.payment_by,
      departureOrderTime: record.departure_order_time,
      passengersDeparting: record.passengers_departing,
      departureOrderBy: record.departure_order_by,
      exitTime: record.exit_time,
      exitBy: record.exit_by,
      currentStatus: record.current_status,
      notes: record.notes,
      metadata: record.metadata,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    })
  } catch (error) {
    console.error('Error fetching dispatch record:', error)
    return res.status(500).json({ error: 'Failed to fetch dispatch record' })
  }
}

export const createDispatchRecord = async (req: AuthRequest, res: Response) => {
  try {
    const validated = dispatchSchema.parse(req.body)
    const { vehicleId, driverId, scheduleId, routeId, entryTime, notes } = validated
    const userId = req.user?.id

    const { data, error } = await supabase
      .from('dispatch_records')
      .insert({
        vehicle_id: vehicleId,
        driver_id: driverId,
        schedule_id: scheduleId || null,
        route_id: routeId,
        entry_time: entryTime,
        entry_by: userId || null,
        current_status: 'entered',
        notes: notes || null,
      })
      .select('*')
      .single()

    if (error) throw error

    // Fetch related data
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id, plate_number')
      .eq('id', data.vehicle_id)
      .single()

    const { data: driver } = await supabase
      .from('drivers')
      .select('id, full_name')
      .eq('id', data.driver_id)
      .single()

    const { data: route } = await supabase
      .from('routes')
      .select('id, route_name')
      .eq('id', data.route_id)
      .single()

    return res.status(201).json({
      id: data.id,
      vehicleId: data.vehicle_id,
      vehiclePlateNumber: vehicle?.plate_number || '',
      driverId: data.driver_id,
      driverName: driver?.full_name || '',
      scheduleId: data.schedule_id,
      routeId: data.route_id,
      routeName: route?.route_name || '',
      entryTime: data.entry_time,
      entryBy: data.entry_by,
      currentStatus: data.current_status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error: any) {
    console.error('Error creating dispatch record:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    return res.status(500).json({ error: error.message || 'Failed to create dispatch record' })
  }
}

// Update dispatch status - passengers dropped
export const recordPassengerDrop = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { passengersArrived } = req.body
    const userId = req.user?.id

    const { data, error } = await supabase
      .from('dispatch_records')
      .update({
        passenger_drop_time: new Date().toISOString(),
        passengers_arrived: passengersArrived || null,
        passenger_drop_by: userId || null,
        current_status: 'passengers_dropped',
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Dispatch record not found' })
    }

    return res.json({ message: 'Passenger drop recorded', dispatch: data })
  } catch (error: any) {
    console.error('Error recording passenger drop:', error)
    return res.status(500).json({ error: error.message || 'Failed to record passenger drop' })
  }
}

// Issue boarding permit
export const issuePermit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { transportOrderCode, plannedDepartureTime, seatCount, permitStatus, rejectionReason } = req.body
    const userId = req.user?.id

    if (!transportOrderCode && permitStatus !== 'rejected') {
      return res.status(400).json({ error: 'Transport order code is required for approval' })
    }

    const updateData: any = {
      boarding_permit_time: new Date().toISOString(),
      boarding_permit_by: userId || null,
      permit_status: permitStatus || 'approved',
    }

    if (permitStatus === 'approved') {
      updateData.transport_order_code = transportOrderCode
      updateData.planned_departure_time = plannedDepartureTime
      updateData.seat_count = seatCount
      updateData.current_status = 'permit_issued'
      updateData.rejection_reason = null
    } else if (permitStatus === 'rejected') {
      updateData.current_status = 'permit_rejected'
      updateData.rejection_reason = rejectionReason || null
    }

    const { data, error } = await supabase
      .from('dispatch_records')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Dispatch record not found' })
    }

    return res.json({ message: 'Permit processed', dispatch: data })
  } catch (error: any) {
    console.error('Error issuing permit:', error)
    return res.status(500).json({ error: error.message || 'Failed to issue permit' })
  }
}

// Process payment
export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { paymentAmount, paymentMethod, invoiceNumber } = req.body
    const userId = req.user?.id

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' })
    }

    const { data, error } = await supabase
      .from('dispatch_records')
      .update({
        payment_time: new Date().toISOString(),
        payment_amount: paymentAmount,
        payment_method: paymentMethod || 'cash',
        invoice_number: invoiceNumber || null,
        payment_by: userId || null,
        current_status: 'paid',
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Dispatch record not found' })
    }

    return res.json({ message: 'Payment processed', dispatch: data })
  } catch (error: any) {
    console.error('Error processing payment:', error)
    return res.status(500).json({ error: error.message || 'Failed to process payment' })
  }
}

// Issue departure order
export const issueDepartureOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { passengersDeparting } = req.body
    const userId = req.user?.id

    const { data, error } = await supabase
      .from('dispatch_records')
      .update({
        departure_order_time: new Date().toISOString(),
        passengers_departing: passengersDeparting || null,
        departure_order_by: userId || null,
        current_status: 'departure_ordered',
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Dispatch record not found' })
    }

    return res.json({ message: 'Departure order issued', dispatch: data })
  } catch (error: any) {
    console.error('Error issuing departure order:', error)
    return res.status(500).json({ error: error.message || 'Failed to issue departure order' })
  }
}

// Record exit
export const recordExit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const { data, error } = await supabase
      .from('dispatch_records')
      .update({
        exit_time: new Date().toISOString(),
        exit_by: userId || null,
        current_status: 'departed',
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Dispatch record not found' })
    }

    return res.json({ message: 'Exit recorded', dispatch: data })
  } catch (error: any) {
    console.error('Error recording exit:', error)
    return res.status(500).json({ error: error.message || 'Failed to record exit' })
  }
}

// Legacy endpoints for backward compatibility
export const updateDispatchStatus = async (_req: Request, res: Response) => {
  return res.status(400).json({ 
    error: 'This endpoint is deprecated. Use specific workflow endpoints instead.' 
  })
}

export const depart = async (_req: Request, res: Response) => {
  return res.status(400).json({ 
    error: 'This endpoint is deprecated. Use /depart endpoint instead.' 
  })
}
