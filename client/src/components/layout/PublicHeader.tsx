import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"
import logo from "@/assets/logo.png"

interface NavItem {
  label: string
  path: string
  hasDropdown?: boolean
  dropdownItems?: { label: string; path: string }[]
  dropdownCategories?: {
    title: string
    path: string
    items: { label: string; path: string }[]
    underlineColor: "gray" | "teal"
  }[]
}

const navItems: NavItem[] = [
  { label: "Trang chủ", path: "/" },
  {
    label: "Sản phẩm",
    path: "/products",
    hasDropdown: true,
    dropdownCategories: [
      {
        title: "CỔNG VÀO RA TỰ ĐỘNG",
        path: "/products/gate",
        underlineColor: "gray",
        items: [
          { label: "Phần mềm quản lý vào - ra", path: "/products/gate/management" },
          { label: "Vé điện tử tại vào ra cổng", path: "/products/gate/electronic-ticket" },
          { label: "Thiết bị điều khiển cổng vào ra", path: "/products/gate/equipment" },
        ],
      },
      {
        title: "BẾN XE KHÁCH",
        path: "/products/bus-station",
        underlineColor: "teal",
        items: [
          { label: "Phần mềm quản lý bến xe", path: "/products/bus-station/management" },
          { label: "Ký số & Lệnh vận chuyển điện tử", path: "/products/bus-station/digital-signature" },
          { label: "Phần mềm bán vé tại bến", path: "/products/bus-station/ticket-sales" },
          { label: "Giải pháp thanh toán điện tử", path: "/products/bus-station/payment" },
        ],
      },
      {
        title: "DOANH NGHIỆP VẬN TẢI",
        path: "/products/transport",
        underlineColor: "teal",
        items: [
          { label: "Vé xe khách điện tử", path: "/products/transport/electronic-ticket" },
          { label: "Phần mềm bán vé điện tử", path: "/products/transport/ticket-software" },
          { label: "Lệnh vận chuyển điện tử", path: "/products/transport/dispatch-order" },
          { label: "Phần mềm quản lý chuyến xe", path: "/products/transport/trip-management" },
          { label: "Moblie app Lái Xe", path: "/products/transport/driver-app" },
        ],
      },
      {
        title: "ĐỐI TÁC SƠN PHÁT",
        path: "/products/partner",
        underlineColor: "gray",
        items: [
          { label: "Hóa đơn điện tử - Hilo Invoice", path: "/products/partner/hilo-invoice" },
          { label: "Hợp đồng điện tử - Hilo Contract", path: "/products/partner/hilo-contract" },
          { label: "Chữ ký số - Hilo CA", path: "/products/partner/hilo-ca" },
          { label: "Kiosk bán vé tự phục vụ", path: "/products/partner/kiosk" },
        ],
      },
    ],
  },
  { label: "Bảng giá", path: "/pricing" },
  { label: "Hướng dẫn sử dụng", path: "/guide" },
  { label: "Trợ giúp", path: "/help" },
]

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate("/")
  }

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="SONPHAT C&T"
              className="h-12 w-auto"
            />
            <span className="text-xl font-bold text-gray-900">SONPHAT C&T</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  to={item.path}
                  className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-gray-50"
                  }`}
                  onClick={() => !item.hasDropdown && setOpenDropdown(null)}
                  onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.hasDropdown && item.dropdownCategories && (
                  <div
                    className={`absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-4 transition-all duration-200 ${
                      openDropdown === item.label
                        ? "opacity-100 visible"
                        : "opacity-0 invisible"
                    }`}
                    style={{ width: "max-content", minWidth: "800px" }}
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <div className="grid grid-cols-4 gap-6 px-6">
                      {item.dropdownCategories.map((category) => (
                        <div key={category.path} className="min-w-[180px]">
                          <Link
                            to={category.path}
                            className={`block mb-3 pb-2 font-bold text-sm text-gray-900 border-b-2 ${
                              category.underlineColor === "teal"
                                ? "border-teal-500"
                                : "border-gray-600"
                            }`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            {category.title}
                          </Link>
                          <ul className="space-y-2">
                            {category.items.map((subItem) => (
                              <li key={subItem.path}>
                                <Link
                                  to={subItem.path}
                                  className="block text-sm text-teal-600 hover:text-primary hover:underline transition-colors"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  {subItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {item.hasDropdown && item.dropdownItems && !item.dropdownCategories && (
                  <div
                    className={`absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 transition-all duration-200 ${
                      openDropdown === item.label
                        ? "opacity-100 visible"
                        : "opacity-0 invisible"
                    }`}
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {item.dropdownItems.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.path}
                        to={dropdownItem.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <User className="h-4 w-4" />
                  <span>{user?.fullName || user?.username || "Người dùng"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Chuyển sang trang quản lý
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="sm">Liên hệ</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <div key={item.label}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium ${
                      isActive(item.path)
                        ? "text-primary bg-primary/10"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      if (item.hasDropdown) {
                        handleDropdownToggle(item.label)
                      } else {
                        setMobileMenuOpen(false)
                      }
                    }}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>
                  {item.hasDropdown &&
                    item.dropdownCategories &&
                    openDropdown === item.label && (
                      <div className="mt-1 ml-4 space-y-4">
                        {item.dropdownCategories.map((category) => (
                          <div key={category.path}>
                            <Link
                              to={category.path}
                              className={`block mb-2 pb-1 font-bold text-sm text-gray-900 border-b-2 ${
                                category.underlineColor === "teal"
                                  ? "border-teal-500"
                                  : "border-gray-600"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {category.title}
                            </Link>
                            <ul className="ml-2 space-y-1">
                              {category.items.map((subItem) => (
                                <li key={subItem.path}>
                                  <Link
                                    to={subItem.path}
                                    className="block px-2 py-1 text-sm text-teal-600 rounded-md hover:bg-gray-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {subItem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  {item.hasDropdown &&
                    item.dropdownItems &&
                    !item.dropdownCategories &&
                    openDropdown === item.label && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.path}
                            to={dropdownItem.path}
                            className="block px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-200 mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full" size="sm">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Chuyển sang trang quản lý
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                      size="sm"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full" size="sm">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full" size="sm">
                        Liên hệ
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

