import { Request, Response } from 'express'
import { supabase } from '../config/database.js'

export const getAllVehicleBadges = async (req: Request, res: Response) => {
  try {
    const { status, badgeType, badgeColor, vehicleId, routeId } = req.query

    let query = supabase
      .from('vehicle_badges')
      .select(`
        *,
        vehicles!vehicle_badges_vehicle_id_fkey(id, plate_number, seat_capacity),
        routes!vehicle_badges_route_id_fkey(id, route_code, route_name),
        operators!vehicle_badges_issuing_authority_id_fkey(id, name, code)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status as string)
    }
    if (badgeType) {
      query = query.eq('badge_type', badgeType as string)
    }
    if (badgeColor) {
      query = query.eq('badge_color', badgeColor as string)
    }
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId as string)
    }
    if (routeId) {
      query = query.eq('route_id', routeId as string)
    }

    const { data: badges, error } = await query

    if (error) throw error

    res.json(badges)
  } catch (error) {
    console.error('Error fetching vehicle badges:', error)
    res.status(500).json({ 
      error: 'Failed to fetch vehicle badges',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getVehicleBadgeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: badge, error } = await supabase
      .from('vehicle_badges')
      .select(`
        *,
        vehicles!vehicle_badges_vehicle_id_fkey(id, plate_number, seat_capacity, operator_id),
        routes!vehicle_badges_route_id_fkey(id, route_code, route_name, origin_id, destination_id),
        operators!vehicle_badges_issuing_authority_id_fkey(id, name, code)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!badge) {
      return res.status(404).json({ error: 'Vehicle badge not found' })
    }

    return res.json(badge)
  } catch (error) {
    console.error('Error fetching vehicle badge:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch vehicle badge',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getVehicleBadgeStats = async (_req: Request, res: Response) => {
  try {
    // Get total badges
    const { count: totalCount } = await supabase
      .from('vehicle_badges')
      .select('*', { count: 'exact', head: true })

    // Get active badges
    const { count: activeCount } = await supabase
      .from('vehicle_badges')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get expired badges
    const { count: expiredCount } = await supabase
      .from('vehicle_badges')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'expired')

    // Get badges expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const { count: expiringSoonCount } = await supabase
      .from('vehicle_badges')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])

    res.json({
      total: totalCount || 0,
      active: activeCount || 0,
      expired: expiredCount || 0,
      expiringSoon: expiringSoonCount || 0,
    })
  } catch (error) {
    console.error('Error fetching vehicle badge stats:', error)
    res.status(500).json({ 
      error: 'Failed to fetch vehicle badge statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
