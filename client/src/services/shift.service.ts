import api from '@/lib/api'

export interface Shift {
  id: string
  name: string
  startTime: string // Format: HH:mm
  endTime: string // Format: HH:mm
  createdAt?: string
  updatedAt?: string
}

export interface ShiftInput {
  name: string
  startTime: string
  endTime: string
}

export const shiftService = {
  getAll: async (): Promise<Shift[]> => {
    try {
      const response = await api.get<Shift[]>('/shifts')
      return response.data
    } catch (error) {
      // If API doesn't exist yet, return default shifts
      console.warn('Shifts API not available, using default shifts')
      return [
        { id: '1', name: 'Ca 1', startTime: '06:00', endTime: '14:00' },
        { id: '2', name: 'Ca 2', startTime: '14:00', endTime: '22:00' },
        { id: '3', name: 'Ca 3', startTime: '22:00', endTime: '06:00' },
        { id: '4', name: 'Hành chính', startTime: '07:30', endTime: '17:00' },
      ]
    }
  },

  getById: async (id: string): Promise<Shift> => {
    const response = await api.get<Shift>(`/shifts/${id}`)
    return response.data
  },

  create: async (data: ShiftInput): Promise<Shift> => {
    const response = await api.post<Shift>('/shifts', data)
    return response.data
  },

  update: async (id: string, data: Partial<ShiftInput>): Promise<Shift> => {
    const response = await api.put<Shift>(`/shifts/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/shifts/${id}`)
  },
}

