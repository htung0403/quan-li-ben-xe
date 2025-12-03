import api from '@/lib/api'

export interface DashboardStats {
  vehiclesInStation: number
  vehiclesDepartedToday: number
  revenueToday: number
  invalidVehicles: number
}

export interface ChartDataPoint {
  hour: string
  count: number
}

export interface RecentActivity {
  id: string
  vehiclePlateNumber: string
  route: string
  entryTime: string
  status: string
}

export interface Warning {
  type: 'vehicle' | 'driver'
  plateNumber?: string
  name?: string
  document: string
  expiryDate: Date
}

export interface DashboardData {
  stats: DashboardStats
  chartData: ChartDataPoint[]
  recentActivity: RecentActivity[]
  warnings: Warning[]
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/dashboard')
    return response.data
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats')
    return response.data
  },

  getChartData: async (): Promise<ChartDataPoint[]> => {
    const response = await api.get<ChartDataPoint[]>('/dashboard/chart')
    return response.data
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    const response = await api.get<RecentActivity[]>('/dashboard/recent-activity')
    return response.data
  },

  getWarnings: async (): Promise<Warning[]> => {
    const response = await api.get<Warning[]>('/dashboard/warnings')
    return response.data
  },
}

