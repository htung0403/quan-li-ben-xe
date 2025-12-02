import type { InvoiceReport, RevenueReport } from "@/types"
import { format, subDays } from "date-fns"

// Tạo dữ liệu cho 7 ngày gần nhất
const generateDates = (days: number) => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i)
    return format(date, "yyyy-MM-dd")
  })
}

export const mockInvoiceReports: InvoiceReport[] = [
  {
    id: "inv-001",
    dispatchId: "disp1",
    vehiclePlateNumber: "29A-12345",
    route: "Hà Nội - Hải Phòng",
    amount: 150000,
    issueDate: new Date().toISOString(),
    status: "paid",
  },
  {
    id: "inv-002",
    dispatchId: "disp2",
    vehiclePlateNumber: "29B-67890",
    route: "Hà Nội - Quảng Ninh",
    amount: 200000,
    issueDate: new Date().toISOString(),
    status: "paid",
  },
  {
    id: "inv-003",
    dispatchId: "disp3",
    vehiclePlateNumber: "29A-11111",
    route: "Hà Nội - Hải Dương",
    amount: 180000,
    issueDate: subDays(new Date(), 1).toISOString(),
    status: "paid",
  },
  {
    id: "inv-004",
    dispatchId: "disp4",
    vehiclePlateNumber: "29C-22222",
    route: "Hà Nội - Bắc Ninh",
    amount: 220000,
    issueDate: subDays(new Date(), 1).toISOString(),
    status: "paid",
  },
  {
    id: "inv-005",
    dispatchId: "disp5",
    vehiclePlateNumber: "29A-12345",
    route: "Hà Nội - Hải Phòng",
    amount: 190000,
    issueDate: subDays(new Date(), 2).toISOString(),
    status: "paid",
  },
  {
    id: "inv-006",
    dispatchId: "disp6",
    vehiclePlateNumber: "29B-67890",
    route: "Hà Nội - Quảng Ninh",
    amount: 175000,
    issueDate: subDays(new Date(), 2).toISOString(),
    status: "paid",
  },
  {
    id: "inv-007",
    dispatchId: "disp7",
    vehiclePlateNumber: "29A-11111",
    route: "Hà Nội - Hải Dương",
    amount: 165000,
    issueDate: subDays(new Date(), 3).toISOString(),
    status: "paid",
  },
]

export const mockRevenueReports: RevenueReport[] = generateDates(7).map((date, index) => {
  const baseRevenue = 5000000 + Math.random() * 3000000
  const vehicleCount = 20 + Math.floor(Math.random() * 15)
  const transactionCount = vehicleCount + Math.floor(Math.random() * 10)

  return {
    date,
    totalRevenue: Math.floor(baseRevenue),
    vehicleCount,
    transactionCount,
  }
})

export const mockVehicleLogs = [
  {
    id: "log-001",
    vehiclePlateNumber: "29A-12345",
    route: "Hà Nội - Hải Phòng",
    entryTime: new Date().toISOString(),
    exitTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    driverName: "Nguyễn Văn A",
    status: "completed",
  },
  {
    id: "log-002",
    vehiclePlateNumber: "29B-67890",
    route: "Hà Nội - Quảng Ninh",
    entryTime: subDays(new Date(), 1).toISOString(),
    exitTime: new Date(subDays(new Date(), 1).getTime() + 3 * 60 * 60 * 1000).toISOString(),
    driverName: "Trần Văn B",
    status: "completed",
  },
]

export const mockStationActivity = [
  {
    id: "act-001",
    vehiclePlateNumber: "29A-12345",
    action: "entry",
    time: new Date().toISOString(),
    route: "Hà Nội - Hải Phòng",
    driverName: "Nguyễn Văn A",
  },
  {
    id: "act-002",
    vehiclePlateNumber: "29B-67890",
    action: "exit",
    time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    route: "Hà Nội - Quảng Ninh",
    driverName: "Trần Văn B",
  },
  {
    id: "act-003",
    vehiclePlateNumber: "29A-11111",
    action: "entry",
    time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    route: "Hà Nội - Hải Dương",
    driverName: "Lê Văn C",
  },
]

export const mockInvalidVehicles = [
  {
    id: "inv-001",
    plateNumber: "29A-11111",
    reason: "Đăng kiểm sắp hết hạn (còn 7 ngày)",
    date: new Date().toISOString(),
    vehicleType: "Xe khách",
  },
  {
    id: "inv-002",
    plateNumber: "29B-99999",
    reason: "Bảo hiểm đã hết hạn",
    date: subDays(new Date(), 1).toISOString(),
    vehicleType: "Xe khách",
  },
  {
    id: "inv-003",
    plateNumber: "29C-88888",
    reason: "Bằng lái lái xe sắp hết hạn",
    date: subDays(new Date(), 2).toISOString(),
    vehicleType: "Xe tải",
  },
]

