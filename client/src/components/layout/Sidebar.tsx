import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  CalendarClock,
  Bus,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"

const navigation = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Điều độ xe", href: "/dispatch", icon: CalendarClock },
  { name: "Quản lý xe", href: "/vehicles", icon: Bus },
  { name: "Quản lý lái xe", href: "/drivers", icon: Users },
  { name: "Báo cáo", href: "/reports", icon: BarChart3 },
  // { name: "Cài đặt", href: "/settings", icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 border-r border-indigo-200/50 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center border-b border-indigo-200/50 px-6 py-4">
            <img src={logo} alt="Quản Lý Bến Xe" className="h-28 w-auto object-fit drop-shadow-lg" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-[1.02]"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 hover:text-indigo-700 hover:shadow-sm"
                  )}
                >
                  <item.icon className={cn(
                    "h-6 w-6 transition-colors",
                    isActive ? "text-white" : "text-indigo-600"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t border-indigo-200/50 p-4 bg-gradient-to-t from-red-50 to-transparent">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gradient-to-r hover:from-red-100 hover:to-rose-100 hover:text-red-600 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-6 w-6 text-red-500" />
              <span className="font-medium">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

