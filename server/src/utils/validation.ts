import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const driverSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiry: z.string().min(1, 'License expiry is required'),
  contractExpiry: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

export const vehicleSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  seatCapacity: z.number().int().positive('Seat capacity must be positive'),
  operatorId: z.string().min(1, 'Operator ID is required'),
  operatorName: z.string().optional(),
  documents: z.object({
    registration: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      isValid: z.boolean(),
      imageUrl: z.string().optional(),
    }),
    inspection: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      isValid: z.boolean(),
      imageUrl: z.string().optional(),
    }),
    permit: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      isValid: z.boolean(),
      imageUrl: z.string().optional(),
    }),
    insurance: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      isValid: z.boolean(),
      imageUrl: z.string().optional(),
    }),
  }),
})

export const dispatchSchema = z.object({
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  driverId: z.string().uuid('Invalid driver ID'),
  route: z.string().min(1, 'Route is required'),
  entryTime: z.string().datetime('Invalid entry time'),
  passengerCount: z.number().int().nonnegative().optional(),
})

