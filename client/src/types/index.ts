// Vehicle types
export interface Vehicle {
  id: string
  plateNumber: string
  vehicleType: string
  seatCapacity: number
  operatorId: string
  operatorName?: string
  status: VehicleStatus
  documents: VehicleDocuments
  createdAt?: string
  updatedAt?: string
}

export type VehicleStatus = 'active' | 'inactive' | 'maintenance'

export interface VehicleDocuments {
  registration: DocumentInfo
  inspection: DocumentInfo
  permit: DocumentInfo
  insurance: DocumentInfo
}

export interface DocumentInfo {
  number: string
  issueDate: string
  expiryDate: string
  isValid: boolean
  imageUrl?: string
}

// Driver types
export interface Driver {
  id: string
  fullName: string
  phoneNumber: string
  email?: string
  licenseNumber: string
  licenseExpiry: string
  contractExpiry?: string
  status: DriverStatus
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export type DriverStatus = 'active' | 'inactive' | 'suspended'

// Dispatch types
export interface DispatchRecord {
  id: string
  vehicleId: string
  vehiclePlateNumber: string
  driverId: string
  driverName: string
  route: string
  entryTime: string
  exitTime?: string
  status: DispatchStatus
  passengerCount?: number
  exitPassengerCount?: number
  permitNumber?: string
  departureTime?: string
  totalAmount?: number
  notes?: string
}

export type DispatchStatus = 
  | 'in-station' 
  | 'permit-issued' 
  | 'paid' 
  | 'departed'
  | 'invalid'

// Report types
export interface ReportFilter {
  startDate: string
  endDate: string
  vehicleId?: string
  driverId?: string
  status?: DispatchStatus
}

export interface InvoiceReport {
  id: string
  dispatchId: string
  vehiclePlateNumber: string
  route: string
  amount: number
  issueDate: string
  status: string
}

export interface RevenueReport {
  date: string
  totalRevenue: number
  vehicleCount: number
  transactionCount: number
}

// User types
export interface User {
  id: string
  username: string
  fullName: string
  role: string
  email?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

// Form input types
export interface VehicleInput {
  plateNumber: string
  vehicleType: string
  seatCapacity: number
  operatorId: string
  documents: VehicleDocuments
}

export interface DriverInput {
  fullName: string
  phoneNumber: string
  email?: string
  licenseNumber: string
  licenseExpiry: string
  contractExpiry?: string
}

export interface DispatchInput {
  vehicleId: string
  driverId: string
  route: string
  entryTime: string
  passengerCount?: number
}

