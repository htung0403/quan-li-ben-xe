import { create } from 'zustand'
import type { User } from '@/types'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username: string, password: string, rememberMe = false) => {
    try {
      const data = await authService.login({ username, password, rememberMe })
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    if (authService.isAuthenticated()) {
      try {
        const user = await authService.getCurrentUser()
        set({ user, isAuthenticated: true, isLoading: false })
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } else {
      set({ isLoading: false })
    }
  },
}))

