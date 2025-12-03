import api from '@/lib/api'
import type { Route, RouteInput } from '@/types'

export const routeService = {
  getAll: async (originId?: string, destinationId?: string, isActive?: boolean): Promise<Route[]> => {
    const params: Record<string, string> = {}
    if (originId) params.originId = originId
    if (destinationId) params.destinationId = destinationId
    if (isActive !== undefined) params.isActive = isActive.toString()
    const response = await api.get<Route[]>('/routes', { params })
    return response.data
  },

  getById: async (id: string): Promise<Route> => {
    const response = await api.get<Route>(`/routes/${id}`)
    return response.data
  },

  create: async (data: RouteInput): Promise<Route> => {
    const response = await api.post<Route>('/routes', data)
    return response.data
  },

  update: async (id: string, data: Partial<RouteInput>): Promise<Route> => {
    const response = await api.put<Route>(`/routes/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/routes/${id}`)
  },
}

