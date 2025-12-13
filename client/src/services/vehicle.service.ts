import api from '@/lib/api'
import type { Vehicle, VehicleInput } from '@/types'

export const vehicleService = {
  getAll: async (operatorId?: string, isActive?: boolean): Promise<Vehicle[]> => {
    const params: Record<string, string> = {}
    if (operatorId) params.operatorId = operatorId
    if (isActive !== undefined) params.isActive = isActive.toString()
    const response = await api.get<Vehicle[]>('/vehicles', { params })
    return response.data
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/vehicles/${id}`)
    return response.data
  },

  create: async (data: VehicleInput): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/vehicles', data)
    return response.data
  },

  update: async (id: string, data: Partial<VehicleInput>): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`)
  },

  getDocumentAuditLogs: async (vehicleId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/vehicles/${vehicleId}/document-audit-logs`)
    return response.data
  },
}
