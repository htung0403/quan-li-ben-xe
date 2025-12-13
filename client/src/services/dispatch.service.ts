import api from '@/lib/api'
import type { DispatchRecord, DispatchInput, DispatchStatus } from '@/types'

export const dispatchService = {
  getAll: async (status?: DispatchStatus, vehicleId?: string, driverId?: string, routeId?: string): Promise<DispatchRecord[]> => {
    const params: Record<string, string> = {}
    if (status) params.status = status
    if (vehicleId) params.vehicleId = vehicleId
    if (driverId) params.driverId = driverId
    if (routeId) params.routeId = routeId
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

  // New workflow methods
  recordPassengerDrop: async (id: string, passengersArrived: number, routeId?: string): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>(`/dispatch/${id}/passenger-drop`, {
      passengersArrived,
      routeId,
    })
    return response.data
  },

  issuePermit: async (
    id: string,
    data: {
      transportOrderCode?: string
      plannedDepartureTime: string
      seatCount: number
      permitStatus?: 'approved' | 'rejected'
      rejectionReason?: string
      routeId?: string
      scheduleId?: string
      replacementVehicleId?: string
    }
  ): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>(`/dispatch/${id}/permit`, data)
    return response.data
  },

  processPayment: async (
    id: string,
    data: {
      paymentAmount: number
      paymentMethod?: 'cash' | 'bank_transfer' | 'card'
      invoiceNumber?: string
    }
  ): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>(`/dispatch/${id}/payment`, data)
    return response.data
  },

  issueDepartureOrder: async (id: string, passengersDeparting: number): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>(`/dispatch/${id}/departure-order`, {
      passengersDeparting,
    })
    return response.data
  },

  recordExit: async (id: string, exitTime?: string, passengersDeparting?: number): Promise<DispatchRecord> => {
    const response = await api.post<DispatchRecord>(`/dispatch/${id}/exit`, {
      exitTime,
      passengersDeparting
    })
    return response.data
  },

  // Legacy methods for backward compatibility
  updateStatus: async (
    id: string,
    status: DispatchStatus,
    data?: Partial<DispatchRecord>
  ): Promise<DispatchRecord> => {
    // Map old status to new workflow
    if (status === 'permit_issued') {
      return dispatchService.issuePermit(id, {
        transportOrderCode: data?.transportOrderCode || '',
        plannedDepartureTime: data?.plannedDepartureTime || new Date().toISOString(),
        seatCount: data?.seatCount || 0,
      })
    }
    if (status === 'paid') {
      return dispatchService.processPayment(id, {
        paymentAmount: data?.paymentAmount || 0,
      })
    }
    if (status === 'departed') {
      return dispatchService.recordExit(id)
    }
    throw new Error('Legacy updateStatus is deprecated. Use specific workflow methods.')
  },

  depart: async (id: string, _exitTime: string, passengerCount: number): Promise<DispatchRecord> => {
    // Use new workflow
    await dispatchService.issueDepartureOrder(id, passengerCount)
    return dispatchService.recordExit(id)
  },
}
