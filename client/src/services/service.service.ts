import api from '@/lib/api'
import type { Service, ServiceInput } from '@/types'

export const serviceService = {
  getAll: async (isActive?: boolean): Promise<Service[]> => {
    const params: Record<string, string> = {}
    if (isActive !== undefined) params.isActive = isActive.toString()
    const response = await api.get<Service[]>('/services', { params })
    return response.data
  },

  getById: async (id: string): Promise<Service> => {
    const response = await api.get<Service>(`/services/${id}`)
    return response.data
  },

  create: async (data: ServiceInput): Promise<Service> => {
    const response = await api.post<Service>('/services', data)
    return response.data
  },

  update: async (id: string, data: Partial<ServiceInput>): Promise<Service> => {
    const response = await api.put<Service>(`/services/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`)
  },
}

