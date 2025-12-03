import api from '@/lib/api'
import type { Schedule, ScheduleInput } from '@/types'

export const scheduleService = {
  getAll: async (routeId?: string, operatorId?: string, isActive?: boolean): Promise<Schedule[]> => {
    const params: Record<string, string> = {}
    if (routeId) params.routeId = routeId
    if (operatorId) params.operatorId = operatorId
    if (isActive !== undefined) params.isActive = isActive.toString()
    const response = await api.get<Schedule[]>('/schedules', { params })
    return response.data
  },

  getById: async (id: string): Promise<Schedule> => {
    const response = await api.get<Schedule>(`/schedules/${id}`)
    return response.data
  },

  create: async (data: ScheduleInput): Promise<Schedule> => {
    const response = await api.post<Schedule>('/schedules', data)
    return response.data
  },

  update: async (id: string, data: Partial<ScheduleInput>): Promise<Schedule> => {
    const response = await api.put<Schedule>(`/schedules/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/schedules/${id}`)
  },
}

