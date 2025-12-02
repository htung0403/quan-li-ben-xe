import api from '@/lib/api'
import type { LoginCredentials, User } from '@/types'
import { mockLogin, mockGetCurrentUser } from '@/mocks/auth.mock'

// Set to true to use mock data, false to use real API
const USE_MOCK_DATA = true

export const authService = {
  login: async (credentials: LoginCredentials) => {
    if (USE_MOCK_DATA) {
      // Use mock data
      const data = await mockLogin(credentials.username, credentials.password)
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      return data
    } else {
      // Use real API
      const response = await api.post<{ token: string; user: User }>('/auth/login', credentials)
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
      }
      return response.data
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    // Also remove mock user data
    if (USE_MOCK_DATA) {
      localStorage.removeItem('mock_user_data')
    }
  },

  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK_DATA) {
      // Use mock data
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No token found')
      }
      return await mockGetCurrentUser(token)
    } else {
      // Use real API
      const response = await api.get<User>('/auth/me')
      return response.data
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token')
  },
}

