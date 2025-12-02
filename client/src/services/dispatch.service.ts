import api from '@/lib/api'
import type { DispatchRecord, DispatchInput, DispatchStatus } from '@/types'

export const dispatchService = {
  getAll: async (status?: DispatchStatus): Promise<DispatchRecord[]> => {
    const params = status ? { status } : {}
    const response = await api.get<DispatchRecord[]>('/dispatch', { params })
    return response.data
  },

  getById: async (id: string): Promise<DispatchRecord> => {
    const response = await api.get<DispatchRecord>(`/dispatch/${id}`)
    return response.data
  },

  create: async (data: DispatchInput): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>('/dispatch', data)
    return response.data
  },

  updateStatus: async (
    id: string,
    status: DispatchStatus,
    data?: Partial<DispatchRecord>
  ): Promise<DispatchRecord> => {
    const response = await api.patch<DispatchRecord>(`/dispatch/${id}/status`, {
      status,
      ...data,
    })
    return response.data
  },

  issuePermit: async (id: string, permitData: {
    permitNumber: string
    departureTime: string
    seatCount: number
  }): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>(`/dispatch/${id}/permit`, permitData)
    return response.data
  },

  processPayment: async (id: string, amount: number): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>(`/dispatch/${id}/payment`, { amount })
    return response.data
  },

  depart: async (id: string, exitTime: string, passengerCount: number): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>(`/dispatch/${id}/depart`, {
      exitTime,
      passengerCount,
    })
    return response.data
  },
}

