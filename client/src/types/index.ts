// User types
export interface User {
  id: string
  username: string
  fullName: string
  role: 'admin' | 'dispatcher' | 'accountant' | 'reporter'
  email?: string
  phone?: string
}

export interface LoginCredentials {
  usernameOrEmail: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  username: string
  password: string
  fullName: string
  email?: string
  phone?: string
  role?: 'admin' | 'dispatcher' | 'accountant' | 'reporter'
}

// Operator types
export interface Operator {
  id: string
  name: string
  code: string
  taxCode?: string
  address?: string
  phone?: string
  email?: string
  representativeName?: string
  contractNumber?: string
  contractStartDate?: string
  contractEndDate?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface OperatorInput {
  name: string
  code: string
  taxCode?: string
  address?: string
  phone?: string
  email?: string
  representativeName?: string
  contractNumber?: string
  contractStartDate?: string
  contractEndDate?: string
}

// Vehicle Type types
export interface VehicleType {
  id: string
  name: string
  description?: string
  createdAt?: string
}

export interface VehicleTypeInput {
  name: string
  description?: string
}

// Vehicle types
export interface Vehicle {
  id: string
  plateNumber: string
  vehicleTypeId?: string
  vehicleType?: VehicleType
  operatorId: string
  operator?: Operator
  seatCapacity: number
  manufactureYear?: number
  chassisNumber?: string
  engineNumber?: string
  color?: string
  isActive: boolean
  notes?: string
  documents?: VehicleDocuments
  createdAt?: string
  updatedAt?: string
}

export interface VehicleDocuments {
  registration?: DocumentInfo
  inspection?: DocumentInfo
  insurance?: DocumentInfo
  operation_permit?: DocumentInfo
  emblem?: DocumentInfo
}

export interface DocumentInfo {
  number: string
  issueDate: string
  expiryDate: string
  issuingAuthority?: string
  documentUrl?: string
  notes?: string
  isValid: boolean
}

export interface VehicleInput {
  plateNumber: string
  vehicleTypeId?: string
  operatorId: string
  seatCapacity: number
  manufactureYear?: number
  chassisNumber?: string
  engineNumber?: string
  color?: string
  notes?: string
  documents?: VehicleDocuments
}

// Driver types
export interface Driver {
  id: string
  operatorId: string
  operator?: Operator
  fullName: string
  idNumber: string
  dateOfBirth?: string
  phone?: string
  email?: string
  address?: string
  licenseNumber: string
  licenseClass: string
  licenseIssueDate?: string
  licenseExpiryDate: string
  healthCertificateExpiry?: string
  imageUrl?: string
  isActive: boolean
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface DriverInput {
  operatorId: string
  fullName: string
  idNumber: string
  dateOfBirth?: string
  phone?: string
  email?: string
  address?: string
  licenseNumber: string
  licenseClass: string
  licenseIssueDate?: string
  licenseExpiryDate: string
  healthCertificateExpiry?: string
  imageUrl?: string
  notes?: string
}

// Location types
export interface Location {
  id: string
  name: string
  code: string
  province?: string
  district?: string
  address?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  createdAt?: string
}

export interface LocationInput {
  name: string
  code: string
  province?: string
  district?: string
  address?: string
  latitude?: number
  longitude?: number
}

// Route types
export interface Route {
  id: string
  routeCode: string
  routeName: string
  originId: string
  origin?: Location
  destinationId: string
  destination?: Location
  distanceKm?: number
  estimatedDurationMinutes?: number
  isActive: boolean
  stops?: RouteStop[]
  createdAt?: string
  updatedAt?: string
}

export interface RouteStop {
  id: string
  routeId: string
  locationId: string
  location?: Location
  stopOrder: number
  distanceFromOriginKm?: number
  estimatedMinutesFromOrigin?: number
  createdAt?: string
}

export interface RouteInput {
  routeCode: string
  routeName: string
  originId: string
  destinationId: string
  distanceKm?: number
  estimatedDurationMinutes?: number
  stops?: Omit<RouteStop, 'id' | 'routeId' | 'createdAt'>[]
}

// Schedule types
export interface Schedule {
  id: string
  scheduleCode: string
  routeId: string
  route?: Route
  operatorId: string
  operator?: Operator
  departureTime: string
  frequencyType: 'daily' | 'weekly' | 'specific_days'
  daysOfWeek?: number[]
  effectiveFrom: string
  effectiveTo?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ScheduleInput {
  scheduleCode: string
  routeId: string
  operatorId: string
  departureTime: string
  frequencyType: 'daily' | 'weekly' | 'specific_days'
  daysOfWeek?: number[]
  effectiveFrom: string
  effectiveTo?: string
}

// Dispatch types
export type DispatchStatus =
  | 'entered'
  | 'passengers_dropped'
  | 'permit_issued'
  | 'permit_rejected'
  | 'paid'
  | 'departure_ordered'
  | 'departed'

export type PermitStatus = 'approved' | 'rejected' | 'pending'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'card'

export interface DispatchRecord {
  id: string
  vehicleId: string
  vehicle?: Vehicle
  vehiclePlateNumber: string
  driverId: string
  driver?: Driver
  driverName: string
  scheduleId?: string
  schedule?: Schedule
  routeId: string
  route?: Route
  routeName: string
  
  // Entry
  entryTime: string
  entryBy?: string
  
  // Passenger drop-off
  passengerDropTime?: string
  passengersArrived?: number
  passengerDropBy?: string
  
  // Boarding permit
  boardingPermitTime?: string
  plannedDepartureTime?: string
  transportOrderCode?: string
  seatCount?: number
  permitStatus?: PermitStatus
  rejectionReason?: string
  boardingPermitBy?: string
  
  // Payment
  paymentTime?: string
  paymentAmount?: number
  paymentMethod?: PaymentMethod
  invoiceNumber?: string
  paymentBy?: string
  
  // Departure order
  departureOrderTime?: string
  passengersDeparting?: number
  departureOrderBy?: string
  
  // Exit
  exitTime?: string
  exitBy?: string
  
  // Status
  currentStatus: DispatchStatus
  notes?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface DispatchInput {
  vehicleId: string
  driverId: string
  scheduleId?: string
  routeId: string
  entryTime: string
  notes?: string
}

// Violation types
export interface ViolationType {
  id: string
  code: string
  name: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  createdAt?: string
}

export interface Violation {
  id: string
  dispatchRecordId?: string
  vehicleId?: string
  driverId?: string
  violationTypeId: string
  violationType?: ViolationType
  violationDate: string
  description?: string
  resolutionStatus: 'pending' | 'resolved' | 'dismissed'
  resolutionNotes?: string
  recordedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface ViolationInput {
  dispatchRecordId?: string
  vehicleId?: string
  driverId?: string
  violationTypeId: string
  violationDate: string
  description?: string
}

// Service types
export interface ServiceType {
  id: string
  code: string
  name: string
  description?: string
  basePrice: number
  unit?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ServiceCharge {
  id: string
  dispatchRecordId: string
  serviceTypeId: string
  serviceType?: ServiceType
  quantity: number
  unitPrice: number
  totalAmount: number
  createdAt?: string
}

export interface ServiceChargeInput {
  dispatchRecordId: string
  serviceTypeId: string
  quantity?: number
  unitPrice: number
  totalAmount: number
}

// Invoice types
export interface Invoice {
  id: string
  invoiceNumber: string
  dispatchRecordId?: string
  operatorId: string
  operator?: Operator
  issueDate: string
  dueDate?: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled'
  paymentDate?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface InvoiceInput {
  invoiceNumber: string
  dispatchRecordId?: string
  operatorId: string
  issueDate: string
  dueDate?: string
  subtotal: number
  taxAmount?: number
  totalAmount: number
  notes?: string
}

// Report types
export interface ReportFilter {
  startDate: string
  endDate: string
  vehicleId?: string
  driverId?: string
  operatorId?: string
  routeId?: string
  status?: DispatchStatus
}

export interface RevenueReport {
  date: string
  totalRevenue: number
  vehicleCount: number
  transactionCount: number
}

export interface InvoiceReport {
  id: string
  invoiceNumber: string
  dispatchId: string
  operatorName: string
  amount: number
  issueDate: string
  status: string
}
