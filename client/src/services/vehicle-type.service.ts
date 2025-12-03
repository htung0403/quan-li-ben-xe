import api from '@/lib/api'
import type { VehicleType, VehicleTypeInput } from '@/types'

export const vehicleTypeService = {
  getAll: async (): Promise<VehicleType[]> => {
    const response = await api.get<VehicleType[]>('/vehicle-types')
    return response.data
  },

  getById: async (id: string): Promise<VehicleType> => {
    const response = await api.get<VehicleType>(`/vehicle-types/${id}`)
    return response.data
  },

  create: async (data: VehicleTypeInput): Promise<VehicleType> => {
    const response = await api.post<VehicleType>('/vehicle-types', data)
    return response.data
  },

  update: async (id: string, data: Partial<VehicleTypeInput>): Promise<VehicleType> => {
    const response = await api.put<VehicleType>(`/vehicle-types/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vehicle-types/${id}`)
  },
}

