import type { DispatchRecord } from "@/types"

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

// Tạo các record với thời gian khác nhau trong ngày
const createTime = (hours: number, minutes: number) => {
  const date = new Date(today)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const mockDispatchRecords: DispatchRecord[] = [
  {
    id: "disp1",
    vehicleId: "v1",
    vehiclePlateNumber: "29A-12345",
    driverId: "d1",
    driverName: "Nguyễn Văn A",
    routeId: "r1",
    routeName: "Hà Nội - Hải Phòng",
    entryTime: createTime(6, 30),
    currentStatus: "entered",
  },
  {
    id: "disp2",
    vehicleId: "v2",
    vehiclePlateNumber: "29B-67890",
    driverId: "d2",
    driverName: "Trần Văn B",
    routeId: "r2",
    routeName: "Hà Nội - Quảng Ninh",
    entryTime: createTime(7, 15),
    currentStatus: "permit_issued",
    transportOrderCode: "PL-2024-001",
    plannedDepartureTime: createTime(8, 0),
  },
  {
    id: "disp3",
    vehicleId: "v3",
    vehiclePlateNumber: "29A-11111",
    driverId: "d3",
    driverName: "Lê Văn C",
    routeId: "r3",
    routeName: "Hà Nội - Hải Dương",
    entryTime: createTime(5, 45),
    currentStatus: "paid",
    transportOrderCode: "PL-2024-002",
    plannedDepartureTime: createTime(7, 30),
    paymentAmount: 150000,
  },
  {
    id: "disp4",
    vehicleId: "v4",
    vehiclePlateNumber: "29C-22222",
    driverId: "d4",
    driverName: "Phạm Văn D",
    routeId: "r4",
    routeName: "Hà Nội - Bắc Ninh",
    entryTime: createTime(8, 0),
    currentStatus: "departed",
    transportOrderCode: "PL-2024-003",
    plannedDepartureTime: createTime(9, 0),
    exitTime: createTime(9, 5),
    passengersDeparting: 35,
    paymentAmount: 200000,
  },
  {
    id: "disp5",
    vehicleId: "v1",
    vehiclePlateNumber: "29A-12345",
    driverId: "d1",
    driverName: "Nguyễn Văn A",
    routeId: "r1",
    routeName: "Hà Nội - Hải Phòng",
    entryTime: createTime(9, 30),
    currentStatus: "entered",
  },
  {
    id: "disp6",
    vehicleId: "v2",
    vehiclePlateNumber: "29B-67890",
    driverId: "d2",
    driverName: "Trần Văn B",
    routeId: "r2",
    routeName: "Hà Nội - Quảng Ninh",
    entryTime: createTime(10, 0),
    currentStatus: "permit_issued",
    transportOrderCode: "PL-2024-004",
    plannedDepartureTime: createTime(10, 30),
  },
  {
    id: "disp7",
    vehicleId: "v3",
    vehiclePlateNumber: "29A-11111",
    driverId: "d6",
    driverName: "Vũ Văn F",
    routeId: "r3",
    routeName: "Hà Nội - Hải Dương",
    entryTime: createTime(11, 15),
    currentStatus: "paid",
    transportOrderCode: "PL-2024-005",
    plannedDepartureTime: createTime(12, 0),
    paymentAmount: 180000,
  },
  {
    id: "disp8",
    vehicleId: "v4",
    vehiclePlateNumber: "29C-22222",
    driverId: "d4",
    driverName: "Phạm Văn D",
    routeId: "r4",
    routeName: "Hà Nội - Bắc Ninh",
    entryTime: createTime(12, 30),
    currentStatus: "departed",
    transportOrderCode: "PL-2024-006",
    plannedDepartureTime: createTime(13, 0),
    exitTime: createTime(13, 10),
    passengersDeparting: 38,
    paymentAmount: 220000,
  },
  {
    id: "disp9",
    vehicleId: "v1",
    vehiclePlateNumber: "29A-12345",
    driverId: "d1",
    driverName: "Nguyễn Văn A",
    routeId: "r1",
    routeName: "Hà Nội - Hải Phòng",
    entryTime: createTime(13, 45),
    currentStatus: "permit_rejected",
    notes: "Giấy tờ sắp hết hạn",
  },
  {
    id: "disp10",
    vehicleId: "v2",
    vehiclePlateNumber: "29B-67890",
    driverId: "d2",
    driverName: "Trần Văn B",
    routeId: "r2",
    routeName: "Hà Nội - Quảng Ninh",
    entryTime: createTime(14, 0),
    currentStatus: "departed",
    transportOrderCode: "PL-2024-007",
    plannedDepartureTime: createTime(14, 30),
    exitTime: createTime(14, 35),
    passengersDeparting: 38,
    paymentAmount: 190000,
  },
]

// Records từ những ngày trước
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)

const createYesterdayTime = (hours: number, minutes: number) => {
  const date = new Date(yesterday)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const mockHistoricalRecords: DispatchRecord[] = [
  {
    id: "disp-hist-1",
    vehicleId: "v1",
    vehiclePlateNumber: "29A-12345",
    driverId: "d1",
    driverName: "Nguyễn Văn A",
    routeId: "r1",
    routeName: "Hà Nội - Hải Phòng",
    entryTime: createYesterdayTime(6, 0),
    exitTime: createYesterdayTime(6, 30),
    currentStatus: "departed",
    transportOrderCode: "PL-2024-008",
    plannedDepartureTime: createYesterdayTime(6, 15),
    passengersDeparting: 42,
    paymentAmount: 210000,
  },
  {
    id: "disp-hist-2",
    vehicleId: "v2",
    vehiclePlateNumber: "29B-67890",
    driverId: "d2",
    driverName: "Trần Văn B",
    routeId: "r2",
    routeName: "Hà Nội - Quảng Ninh",
    entryTime: createYesterdayTime(7, 0),
    exitTime: createYesterdayTime(7, 45),
    currentStatus: "departed",
    transportOrderCode: "PL-2024-009",
    plannedDepartureTime: createYesterdayTime(7, 30),
    passengersDeparting: 35,
    paymentAmount: 175000,
  },
]

