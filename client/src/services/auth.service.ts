import api from '@/lib/api'
import type { LoginCredentials, User } from '@/types'

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('auth_token')
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token')
  },
}

