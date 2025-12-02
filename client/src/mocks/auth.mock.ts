import type { User } from "@/types"

// Mock users database
export const mockUsers: Array<{
  username: string
  password: string
  user: User
}> = [
  {
    username: "admin",
    password: "admin123",
    user: {
      id: "u1",
      username: "admin",
      fullName: "Quản trị viên",
      role: "admin",
      email: "admin@benxe.com",
    },
  },
  {
    username: "manager",
    password: "manager123",
    user: {
      id: "u2",
      username: "manager",
      fullName: "Nguyễn Văn Quản Lý",
      role: "manager",
      email: "manager@benxe.com",
    },
  },
  {
    username: "staff",
    password: "staff123",
    user: {
      id: "u3",
      username: "staff",
      fullName: "Trần Thị Nhân Viên",
      role: "staff",
      email: "staff@benxe.com",
    },
  },
  {
    username: "operator",
    password: "operator123",
    user: {
      id: "u4",
      username: "operator",
      fullName: "Lê Văn Điều Độ",
      role: "operator",
      email: "operator@benxe.com",
    },
  },
]

// Mock token generator (simple base64 for demo)
const generateMockToken = (userId: string): string => {
  return btoa(`mock_token_${userId}_${Date.now()}`)
}

// Store user data in localStorage for mock authentication
const STORAGE_KEY_USER = 'mock_user_data'

// Mock login function
export const mockLogin = async (
  username: string,
  password: string
): Promise<{ token: string; user: User }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const userData = mockUsers.find(
    (u) => u.username === username && u.password === password
  )

  if (!userData) {
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng")
  }

  const token = generateMockToken(userData.user.id)
  
  // Store user data in localStorage for mock
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData.user))

  return {
    token,
    user: userData.user,
  }
}

// Mock get current user
export const mockGetCurrentUser = async (token: string): Promise<User> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Get user from localStorage (for mock)
  const userData = localStorage.getItem(STORAGE_KEY_USER)
  
  if (!userData) {
    throw new Error("Invalid token")
  }

  try {
    const user = JSON.parse(userData) as User
    return user
  } catch {
    throw new Error("Invalid token")
  }
}

