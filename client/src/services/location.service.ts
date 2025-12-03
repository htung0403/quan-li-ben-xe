import api from '@/lib/api'
import type { Location, LocationInput } from '@/types'

export const locationService = {
  getAll: async (province?: string, isActive?: boolean): Promise<Location[]> => {
    const params: Record<string, string> = {}
    if (province) params.province = province
    if (isActive !== undefined) params.isActive = isActive.toString()
    const response = await api.get<Location[]>('/locations', { params })
    return response.data
  },

  getById: async (id: string): Promise<Location> => {
    const response = await api.get<Location>(`/locations/${id}`)
    return response.data
  },

  create: async (data: LocationInput): Promise<Location> => {
    const response = await api.post<Location>('/locations', data)
    return response.data
  },

  update: async (id: string, data: Partial<LocationInput>): Promise<Location> => {
    const response = await api.put<Location>(`/locations/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/locations/${id}`)
  },
}

