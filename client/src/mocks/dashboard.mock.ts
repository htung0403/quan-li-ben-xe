import { format, subDays } from "date-fns"

export const mockDashboardStats = {
  vehiclesInStation: 24,
  vehiclesDepartedToday: 156,
  revenueToday: 12500000,
  invalidVehicles: 3,
}

// Dữ liệu biểu đồ lượt xe theo giờ (6h - 17h)
export const mockChartData = [
  { hour: "06:00", count: 12 },
  { hour: "07:00", count: 28 },
  { hour: "08:00", count: 35 },
  { hour: "09:00", count: 42 },
  { hour: "10:00", count: 38 },
  { hour: "11:00", count: 45 },
  { hour: "12:00", count: 52 },
  { hour: "13:00", count: 48 },
  { hour: "14:00", count: 55 },
  { hour: "15:00", count: 62 },
  { hour: "16:00", count: 58 },
  { hour: "17:00", count: 65 },
]

// Cảnh báo giấy tờ sắp hết hạn
export const mockWarnings = [
  {
    type: "vehicle" as const,
    plateNumber: "29A-11111",
    document: "Đăng kiểm",
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    type: "driver" as const,
    name: "Nguyễn Văn C",
    document: "Bằng lái",
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  },
  {
    type: "vehicle" as const,
    plateNumber: "29B-99999",
    document: "Bảo hiểm",
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  },
]

// Hoạt động gần đây
export const mockRecentActivity = [
  {
    id: "act-001",
    vehiclePlateNumber: "29A-12345",
    route: "Hà Nội - Hải Phòng",
    entryTime: new Date().toISOString(),
    status: "in-station" as const,
    driverName: "Nguyễn Văn A",
  },
  {
    id: "act-002",
    vehiclePlateNumber: "29B-67890",
    route: "Hà Nội - Quảng Ninh",
    entryTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: "departed" as const,
    driverName: "Trần Văn B",
  },
  {
    id: "act-003",
    vehiclePlateNumber: "29A-11111",
    route: "Hà Nội - Hải Dương",
    entryTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: "in-station" as const,
    driverName: "Lê Văn C",
  },
  {
    id: "act-004",
    vehiclePlateNumber: "29C-22222",
    route: "Hà Nội - Bắc Ninh",
    entryTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: "departed" as const,
    driverName: "Phạm Văn D",
  },
]

