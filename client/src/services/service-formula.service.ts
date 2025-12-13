import api from '@/lib/api'
import type { ServiceFormula, ServiceFormulaInput } from '@/types'

export const serviceFormulaService = {
  getAll: async (formulaType?: 'quantity' | 'price', isActive?: boolean): Promise<ServiceFormula[]> => {
    const params: Record<string, string> = {}
    if (formulaType) params.formulaType = formulaType
    if (isActive !== undefined) params.isActive = isActive.toString()
    const response = await api.get<ServiceFormula[]>('/service-formulas', { params })
    return response.data
  },

  getById: async (id: string): Promise<ServiceFormula> => {
    const response = await api.get<ServiceFormula>(`/service-formulas/${id}`)
    return response.data
  },

  create: async (data: ServiceFormulaInput): Promise<ServiceFormula> => {
    const response = await api.post<ServiceFormula>('/service-formulas', data)
    return response.data
  },

  update: async (id: string, data: Partial<ServiceFormulaInput>): Promise<ServiceFormula> => {
    const response = await api.put<ServiceFormula>(`/service-formulas/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/service-formulas/${id}`)
  },
}

