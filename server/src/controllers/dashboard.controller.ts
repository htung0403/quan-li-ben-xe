import { Response } from 'express'
import { supabase } from '../config/database.js'
import { AuthRequest } from '../middleware/auth.js'

export const getDashboardData = async (_req: AuthRequest, res: Response) => {
  try {
    const [stats, chartData, recentActivity, warnings] = await Promise.all([
      getStatsData(),
      getChartDataData(),
      getRecentActivityData(),
      getWarningsData(),
    ])

    return res.json({
      stats,
      chartData,
      recentActivity,
      warnings,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
}

export const getStats = async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await getStatsData()
    return res.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
}

export const getChartData = async (_req: AuthRequest, res: Response) => {
  try {
    const chartData = await getChartDataData()
    return res.json(chartData)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return res.status(500).json({ error: 'Failed to fetch chart data' })
  }
}

export const getRecentActivity = async (_req: AuthRequest, res: Response) => {
  try {
    const activity = await getRecentActivityData()
    return res.json(activity)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return res.status(500).json({ error: 'Failed to fetch recent activity' })
  }
}

export const getWarnings = async (_req: AuthRequest, res: Response) => {
  try {
    const warnings = await getWarningsData()
    return res.json(warnings)
  } catch (error) {
    console.error('Error fetching warnings:', error)
    return res.status(500).json({ error: 'Failed to fetch warnings' })
  }
}

// Helper functions
async function getStatsData() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  // Vehicles in station (status = 'entered' or other non-departed statuses, and exit_time is NULL)
  const { count: vehiclesInStation } = await supabase
    .from('dispatch_records')
    .select('*', { count: 'exact', head: true })
    .in('current_status', ['entered', 'passengers_dropped', 'permit_issued', 'paid', 'departure_ordered'])
    .is('exit_time', null)

  // Vehicles departed today
  const { count: vehiclesDepartedToday } = await supabase
    .from('dispatch_records')
    .select('*', { count: 'exact', head: true })
    .eq('current_status', 'departed')
    .gte('exit_time', todayStart.toISOString())
    .lte('exit_time', todayEnd.toISOString())

  // Revenue today (from invoices)
  const { data: invoicesToday } = await supabase
    .from('invoices')
    .select('total_amount')
    .gte('issue_date', todayStart.toISOString().split('T')[0])
    .lte('issue_date', todayEnd.toISOString().split('T')[0])

  const revenueToday = invoicesToday?.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0) || 0

  // Invalid vehicles (vehicles with expired documents)
  const today = new Date().toISOString().split('T')[0]
  const { count: invalidVehicles } = await supabase
    .from('vehicle_documents')
    .select('*', { count: 'exact', head: true })
    .lt('expiry_date', today)

  return {
    vehiclesInStation: vehiclesInStation || 0,
    vehiclesDepartedToday: vehiclesDepartedToday || 0,
    revenueToday: revenueToday,
    invalidVehicles: invalidVehicles,
  }
}

async function getChartDataData() {
  const chartDate = new Date()
  const hours = Array.from({ length: 12 }, (_, i) => i + 6) // 6h to 17h

  const chartData = await Promise.all(
    hours.map(async (hour) => {
      const hourStart = new Date(chartDate)
      hourStart.setHours(hour, 0, 0, 0)
      const hourEnd = new Date(chartDate)
      hourEnd.setHours(hour, 59, 59, 999)

      const { count } = await supabase
        .from('dispatch_records')
        .select('*', { count: 'exact', head: true })
        .gte('entry_time', hourStart.toISOString())
        .lte('entry_time', hourEnd.toISOString())

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count: count || 0,
      }
    })
  )

  return chartData
}

async function getRecentActivityData() {
  const { data, error } = await supabase
    .from('dispatch_records')
    .select(`
      id,
      entry_time,
      current_status,
      vehicles:vehicle_id(plate_number),
      routes:route_id(route_name)
    `)
    .order('entry_time', { ascending: false })
    .limit(10)

  if (error) throw error

  return (data || []).map((record: any) => ({
    id: record.id,
    vehiclePlateNumber: record.vehicles?.plate_number || '',
    route: record.routes?.route_name || '',
    entryTime: record.entry_time,
    status: record.current_status,
  }))
}

async function getWarningsData() {
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]

  const warnings: any[] = []

  // Check vehicle documents expiring within 30 days
  const { data: vehicleDocs } = await supabase
    .from('vehicle_documents')
    .select(`
      expiry_date,
      document_type,
      vehicles:vehicle_id(plate_number)
    `)
    .gte('expiry_date', todayStr)
    .lte('expiry_date', thirtyDaysFromNowStr)

  if (vehicleDocs) {
    const docTypeMap: Record<string, string> = {
      'registration': 'Đăng kiểm',
      'inspection': 'Đăng kiểm',
      'insurance': 'Bảo hiểm',
      'operation_permit': 'Phù hiệu',
      'emblem': 'Phù hiệu',
    }

    for (const doc of vehicleDocs) {
      const vehicle = Array.isArray(doc.vehicles) ? doc.vehicles[0] : doc.vehicles
      warnings.push({
        type: 'vehicle',
        plateNumber: vehicle?.plate_number || '',
        document: docTypeMap[doc.document_type] || doc.document_type,
        expiryDate: doc.expiry_date,
      })
    }
  }

  // Check driver licenses expiring within 30 days
  const { data: drivers } = await supabase
    .from('drivers')
    .select('id, full_name, license_expiry_date')
    .gte('license_expiry_date', todayStr)
    .lte('license_expiry_date', thirtyDaysFromNowStr)

  if (drivers) {
    for (const driver of drivers) {
      warnings.push({
        type: 'driver',
        name: driver.full_name,
        document: 'Bằng lái',
        expiryDate: driver.license_expiry_date,
      })
    }
  }

  return warnings.sort((a, b) => 
    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  )
}

