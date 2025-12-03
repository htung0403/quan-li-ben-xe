import api from '@/lib/api'
import type { Operator, OperatorInput } from '@/types'

export const operatorService = {
  getAll: async (isActive?: boolean): Promise<Operator[]> => {
    const params = isActive !== undefined ? { isActive: isActive.toString() } : {}
    const response = await api.get<Operator[]>('/operators', { params })
    return response.data
  },

  getById: async (id: string): Promise<Operator> => {
    const response = await api.get<Operator>(`/operators/${id}`)
    return response.data
  },

  create: async (data: OperatorInput): Promise<Operator> => {
    const response = await api.post<Operator>('/operators', data)
    return response.data
  },

  update: async (id: string, data: Partial<OperatorInput>): Promise<Operator> => {
    const response = await api.put<Operator>(`/operators/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/operators/${id}`)
  },
}

