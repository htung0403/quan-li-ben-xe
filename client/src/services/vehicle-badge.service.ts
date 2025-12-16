// Service for fetching vehicle badge data from Firebase Realtime Database
const FIREBASE_API_URL = 
  import.meta.env.VITE_PHUHIEU_FIREBASE || 
  'https://projectapi-3ba88-default-rtdb.asia-southeast1.firebasedatabase.app/datasheet/PHUHIEUXE.json'

export interface VehicleBadge {
  id: string
  badge_color: string
  badge_number: string
  badge_type: string
  bus_route_ref: string
  business_license_ref: string
  created_at: string
  created_by: string
  email_notification_sent: boolean
  expiry_date: string
  file_code: string
  issue_date: string
  issue_type: string
  license_plate_sheet: string
  notes: string
  notification_ref: string
  previous_badge_number: string
  renewal_due_date: string
  renewal_reason: string
  renewal_reminder_shown: boolean
  replacement_vehicle_id: string
  revocation_date: string
  revocation_decision: string
  revocation_reason: string
  route_id: string
  status: string
  vehicle_id: string
  warn_duplicate_plate: boolean
}

export interface VehicleBadgeResponse {
  [key: string]: VehicleBadge
}

export const vehicleBadgeService = {
  getAll: async (): Promise<VehicleBadge[]> => {
    try {
      if (!FIREBASE_API_URL) {
        throw new Error('Firebase API URL is not configured. Please set VITE_PHUHIEU_FIREBASE in .env file')
      }
      
      const response = await fetch(FIREBASE_API_URL)
      if (!response.ok) {
        throw new Error(`Failed to fetch vehicle badges: ${response.status} ${response.statusText}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType}. Check if the URL is correct.`)
      }
      
      const data: VehicleBadgeResponse = await response.json()
      
      // Convert object to array and ensure id is set
      return Object.entries(data).map(([key, value]) => ({
        ...value,
        id: value.id || key,
      }))
    } catch (error) {
      console.error('Error fetching vehicle badges:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<VehicleBadge | null> => {
    try {
      const badges = await vehicleBadgeService.getAll()
      return badges.find((badge) => badge.id === id) || null
    } catch (error) {
      console.error('Error fetching vehicle badge by id:', error)
      throw error
    }
  },
}

