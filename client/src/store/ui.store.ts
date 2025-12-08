import { create } from 'zustand'

interface UIState {
  title: string
  setTitle: (title: string) => void
  currentShift: string
  setCurrentShift: (shift: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  title: '',
  setTitle: (title) => set({ title }),
  currentShift: '<Trống>',
  setCurrentShift: (shift) => set({ currentShift: shift }),
}))
