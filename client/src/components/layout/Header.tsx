import { Menu, Bell, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserDropdown } from "./UserDropdown"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="hidden lg:block">
            <nav className="flex items-center space-x-4 text-sm">
              {/* Breadcrumbs can be added here */}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          <UserDropdown
            variant="desktop"
            homeLink="/"
            homeLabel="Trang chủ"
            homeIcon={<Home className="h-4 w-4" />}
          />
        </div>
      </div>
    </header>
  )
}

