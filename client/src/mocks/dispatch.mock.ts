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
    route: "Hà Nội - Hải Phòng",
    entryTime: createTime(6, 30),
    status: "in-station",
  },
  {
    id: "disp2",
    vehicleId: "v2",
    vehiclePlateNumber: "29B-67890",
    driverId: "d2",
    driverName: "Trần Văn B",
    route: "Hà Nội - Quảng Ninh",
    entryTime: createTime(7, 15),
    status: "permit-issued",
    permitNumber: "PL-2024-001",
    departureTime: createTime(8, 0),
  },
  {
    id: "disp3",
    vehicleId: "v3",
    vehiclePlateNumber: "29A-11111",
    driverId: "d3",
    driverName: "Lê Văn C",
    route: "Hà Nội - Hải Dương",
    entryTime: createTime(5, 45),
    status: "paid",
    permitNumber: "PL-2024-002",
    departureTime: createTime(7, 30),
    totalAmount: 150000,
  },
  {
    id: "disp4",
    vehicleId: "v4",
    vehiclePlateNumber: "29C-22222",
    driverId: "d4",
    driverName: "Phạm Văn D",
    route: "Hà Nội - Bắc Ninh",
    entryTime: createTime(8, 0),
    status: "departed",
    permitNumber: "PL-2024-003",
    departureTime: createTime(9, 0),
    exitTime: createTime(9, 5),
    passengerCount: 35,
    exitPassengerCount: 35,
    totalAmount: 200000,
  },
  {
    id: "disp5",
    vehicleId: "v1",
    vehiclePlateNumber: "29A-12345",
    driverId: "d1",
    driverName: "Nguyễn Văn A",
    route: "Hà Nội - Hải Phòng",
    entryTime: createTime(9, 30),
    status: "in-station",
  },
  {
    id: "disp6",
    vehicleId: "v2",
    vehiclePlateNumber: "29B-67890",
    driverId: "d2",
    driverName: "Trần Văn B",
    route: "Hà Nội - Quảng Ninh",
    entryTime: createTime(10, 0),
    status: "permit-issued",
    permitNumber: "PL-2024-004",
    departureTime: createTime(10, 30),
  },
  {
    id: "disp7",
    vehicleId: "v3",
    vehiclePlateNumber: "29A-11111",
    driverId: "d6",
    driverName: "Vũ Văn F",
    route: "Hà Nội - Hải Dương",
    entryTime: createTime(11, 15),
    status: "paid",
    permitNumber: "PL-2024-005",
    departureTime: createTime(12, 0),
    totalAmount: 180000,
  },
  {
    id: "disp8",
    vehicleId: "v4",
    vehiclePlateNumber: "29C-22222",
    driverId: "d4",
    driverName: "Phạm Văn D",
    route: "Hà Nội - Bắc Ninh",
    entryTime: createTime(12, 30),
    status: "departed",
    permitNumber: "PL-2024-006",
    departureTime: createTime(13, 0),
    exitTime: createTime(13, 10),
    passengerCount: 40,
    exitPassengerCount: 38,
    totalAmount: 220000,
  },
  {
    id: "disp9",
    vehicleId: "v1",
    vehiclePlateNumber: "29A-12345",
    driverId: "d1",
    driverName: "Nguyễn Văn A",
    route: "Hà Nội - Hải Phòng",
    entryTime: createTime(13, 45),
    status: "invalid",
    notes: "Giấy tờ sắp hết hạn",
  },
  {
    id: "disp10",
    vehicleId: "v2",
    vehiclePlateNumber: "29B-67890",
    driverId: "d2",
    driverName: "Trần Văn B",
    route: "Hà Nội - Quảng Ninh",
    entryTime: createTime(14, 0),
    status: "departed",
    permitNumber: "PL-2024-007",
    departureTime: createTime(14, 30),
    exitTime: createTime(14, 35),
    passengerCount: 38,
    exitPassengerCount: 38,
    totalAmount: 190000,
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
    route: "Hà Nội - Hải Phòng",
    entryTime: createYesterdayTime(6, 0),
    exitTime: createYesterdayTime(6, 30),
    status: "departed",
    permitNumber: "PL-2024-008",
    departureTime: createYesterdayTime(6, 15),
    passengerCount: 42,
    exitPassengerCount: 42,
    totalAmount: 210000,
  },
  {
    id: "disp-hist-2",
    vehicleId: "v2",
    vehiclePlateNumber: "29B-67890",
    driverId: "d2",
    driverName: "Trần Văn B",
    route: "Hà Nội - Quảng Ninh",
    entryTime: createYesterdayTime(7, 0),
    exitTime: createYesterdayTime(7, 45),
    status: "departed",
    permitNumber: "PL-2024-009",
    departureTime: createYesterdayTime(7, 30),
    passengerCount: 35,
    exitPassengerCount: 35,
    totalAmount: 175000,
  },
]

