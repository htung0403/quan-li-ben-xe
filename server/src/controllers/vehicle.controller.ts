import { Request, Response } from 'express'
import { supabase } from '../config/database.js'
import { z } from 'zod'

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required'),
  vehicleTypeId: z.string().uuid().optional(),
  operatorId: z.string().uuid('Invalid operator ID'),
  seatCapacity: z.number().int().positive('Seat capacity must be positive'),
  manufactureYear: z.number().int().optional(),
  chassisNumber: z.string().optional(),
  engineNumber: z.string().optional(),
  color: z.string().optional(),
  notes: z.string().optional(),
  documents: z.object({
    registration: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      issuingAuthority: z.string().optional(),
      documentUrl: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    inspection: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      issuingAuthority: z.string().optional(),
      documentUrl: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    insurance: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      issuingAuthority: z.string().optional(),
      documentUrl: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    operation_permit: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      issuingAuthority: z.string().optional(),
      documentUrl: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    emblem: z.object({
      number: z.string(),
      issueDate: z.string(),
      expiryDate: z.string(),
      issuingAuthority: z.string().optional(),
      documentUrl: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
  }).optional(),
})

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const { operatorId, isActive } = req.query

    let query = supabase
      .from('vehicles')
      .select(`
        *,
        operators:operator_id(id, name, code),
        vehicle_types:vehicle_type_id(id, name)
      `)
      .order('created_at', { ascending: false })

    if (operatorId) {
      query = query.eq('operator_id', operatorId as string)
    }
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: vehicles, error: vehiclesError } = await query

    if (vehiclesError) throw vehiclesError

    // Fetch documents
    const vehicleIds = vehicles.map((v: any) => v.id)
    const { data: documents } = await supabase
      .from('vehicle_documents')
      .select('*')
      .in('vehicle_id', vehicleIds)

    const vehiclesWithDocs = vehicles.map((vehicle: any) => {
      const vehicleDocs = documents?.filter((doc: any) => doc.vehicle_id === vehicle.id) || []
      
      const docsMap: any = {}
      vehicleDocs.forEach((doc: any) => {
        const today = new Date().toISOString().split('T')[0]
        docsMap[doc.document_type] = {
          number: doc.document_number,
          issueDate: doc.issue_date,
          expiryDate: doc.expiry_date,
          issuingAuthority: doc.issuing_authority,
          documentUrl: doc.document_url,
          notes: doc.notes,
          isValid: doc.expiry_date >= today,
        }
      })

      return {
        id: vehicle.id,
        plateNumber: vehicle.plate_number,
        vehicleTypeId: vehicle.vehicle_type_id,
        vehicleType: vehicle.vehicle_types ? {
          id: vehicle.vehicle_types.id,
          name: vehicle.vehicle_types.name,
        } : undefined,
        operatorId: vehicle.operator_id,
        operator: vehicle.operators ? {
          id: vehicle.operators.id,
          name: vehicle.operators.name,
          code: vehicle.operators.code,
        } : undefined,
        seatCapacity: vehicle.seat_capacity,
        manufactureYear: vehicle.manufacture_year,
        chassisNumber: vehicle.chassis_number,
        engineNumber: vehicle.engine_number,
        color: vehicle.color,
        isActive: vehicle.is_active,
        notes: vehicle.notes,
        documents: {
          registration: docsMap.registration || undefined,
          inspection: docsMap.inspection || undefined,
          insurance: docsMap.insurance || undefined,
          operation_permit: docsMap.operation_permit || undefined,
          emblem: docsMap.emblem || undefined,
        },
        createdAt: vehicle.created_at,
        updatedAt: vehicle.updated_at,
      }
    })

    res.json(vehiclesWithDocs)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: error.message || 'Failed to fetch vehicles' })
  }
}

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select(`
        *,
        operators:operator_id(id, name, code),
        vehicle_types:vehicle_type_id(id, name)
      `)
      .eq('id', id)
      .single()

    if (vehicleError) throw vehicleError
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    const { data: documents } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', id)

    const docsMap: any = {}
    const today = new Date().toISOString().split('T')[0]
    documents?.forEach((doc: any) => {
      docsMap[doc.document_type] = {
        number: doc.document_number,
        issueDate: doc.issue_date,
        expiryDate: doc.expiry_date,
        issuingAuthority: doc.issuing_authority,
        documentUrl: doc.document_url,
        notes: doc.notes,
        isValid: doc.expiry_date >= today,
      }
    })

    return res.json({
      id: vehicle.id,
      plateNumber: vehicle.plate_number,
      vehicleTypeId: vehicle.vehicle_type_id,
      vehicleType: (vehicle as any).vehicle_types ? {
        id: (vehicle as any).vehicle_types.id,
        name: (vehicle as any).vehicle_types.name,
      } : undefined,
      operatorId: vehicle.operator_id,
      operator: (vehicle as any).operators ? {
        id: (vehicle as any).operators.id,
        name: (vehicle as any).operators.name,
        code: (vehicle as any).operators.code,
      } : undefined,
      seatCapacity: vehicle.seat_capacity,
      manufactureYear: vehicle.manufacture_year,
      chassisNumber: vehicle.chassis_number,
      engineNumber: vehicle.engine_number,
      color: vehicle.color,
      isActive: vehicle.is_active,
      notes: vehicle.notes,
      documents: {
        registration: docsMap.registration || undefined,
        inspection: docsMap.inspection || undefined,
        insurance: docsMap.insurance || undefined,
        operation_permit: docsMap.operation_permit || undefined,
        emblem: docsMap.emblem || undefined,
      },
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: error.message || 'Failed to fetch vehicle' })
  }
}

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const validated = vehicleSchema.parse(req.body)
    const { plateNumber, vehicleTypeId, operatorId, seatCapacity, manufactureYear, chassisNumber, engineNumber, color, notes, documents } = validated

    // Insert vehicle
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        plate_number: plateNumber,
        vehicle_type_id: vehicleTypeId || null,
        operator_id: operatorId,
        seat_capacity: seatCapacity,
        manufacture_year: manufactureYear || null,
        chassis_number: chassisNumber || null,
        engine_number: engineNumber || null,
        color: color || null,
        notes: notes || null,
        is_active: true,
      })
      .select(`
        *,
        operators:operator_id(id, name, code),
        vehicle_types:vehicle_type_id(id, name)
      `)
      .single()

    if (vehicleError) throw vehicleError

    // Insert documents
    if (documents) {
      const documentTypes = ['registration', 'inspection', 'insurance', 'operation_permit', 'emblem'] as const
      const documentsToInsert = documentTypes
        .filter((type) => documents[type])
        .map((type) => ({
          vehicle_id: vehicle.id,
          document_type: type,
          document_number: documents[type]!.number,
          issue_date: documents[type]!.issueDate,
          expiry_date: documents[type]!.expiryDate,
          issuing_authority: documents[type]!.issuingAuthority || null,
          document_url: documents[type]!.documentUrl || null,
          notes: documents[type]!.notes || null,
        }))

      if (documentsToInsert.length > 0) {
        const { error: docsError } = await supabase
          .from('vehicle_documents')
          .insert(documentsToInsert)

        if (docsError) throw docsError
      }
    }

    // Fetch the complete vehicle with documents
    const { data: allDocs } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', vehicle.id)

    const docsMap: any = {}
    const today = new Date().toISOString().split('T')[0]
    allDocs?.forEach((doc: any) => {
      docsMap[doc.document_type] = {
        number: doc.document_number,
        issueDate: doc.issue_date,
        expiryDate: doc.expiry_date,
        issuingAuthority: doc.issuing_authority,
        documentUrl: doc.document_url,
        notes: doc.notes,
        isValid: doc.expiry_date >= today,
      }
    })

    return res.status(201).json({
      id: vehicle.id,
      plateNumber: vehicle.plate_number,
      vehicleTypeId: vehicle.vehicle_type_id,
      vehicleType: (vehicle as any).vehicle_types ? {
        id: (vehicle as any).vehicle_types.id,
        name: (vehicle as any).vehicle_types.name,
      } : undefined,
      operatorId: vehicle.operator_id,
      operator: (vehicle as any).operators ? {
        id: (vehicle as any).operators.id,
        name: (vehicle as any).operators.name,
        code: (vehicle as any).operators.code,
      } : undefined,
      seatCapacity: vehicle.seat_capacity,
      manufactureYear: vehicle.manufacture_year,
      chassisNumber: vehicle.chassis_number,
      engineNumber: vehicle.engine_number,
      color: vehicle.color,
      isActive: vehicle.is_active,
      notes: vehicle.notes,
      documents: {
        registration: docsMap.registration || undefined,
        inspection: docsMap.inspection || undefined,
        insurance: docsMap.insurance || undefined,
        operation_permit: docsMap.operation_permit || undefined,
        emblem: docsMap.emblem || undefined,
      },
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
    })
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Vehicle with this plate number already exists' })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: error.message || 'Failed to create vehicle' })
  }
}

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const validated = vehicleSchema.partial().parse(req.body)

    // Update vehicle
    const updateData: any = {}
    if (validated.plateNumber) updateData.plate_number = validated.plateNumber
    if (validated.vehicleTypeId !== undefined) updateData.vehicle_type_id = validated.vehicleTypeId || null
    if (validated.operatorId) updateData.operator_id = validated.operatorId
    if (validated.seatCapacity) updateData.seat_capacity = validated.seatCapacity
    if (validated.manufactureYear !== undefined) updateData.manufacture_year = validated.manufactureYear || null
    if (validated.chassisNumber !== undefined) updateData.chassis_number = validated.chassisNumber || null
    if (validated.engineNumber !== undefined) updateData.engine_number = validated.engineNumber || null
    if (validated.color !== undefined) updateData.color = validated.color || null
    if (validated.notes !== undefined) updateData.notes = validated.notes || null

    if (Object.keys(updateData).length > 0) {
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id)

      if (vehicleError) throw vehicleError
    }

    // Update documents if provided
    if (validated.documents) {
      const documentTypes = ['registration', 'inspection', 'insurance', 'operation_permit', 'emblem'] as const
      
      for (const type of documentTypes) {
        if (validated.documents[type]) {
          const doc = validated.documents[type]!
          
          // Check if document already exists
          const { data: existingDoc } = await supabase
            .from('vehicle_documents')
            .select('id')
            .eq('vehicle_id', id)
            .eq('document_type', type)
            .single()

          if (existingDoc) {
            // Update existing document
            const { error: updateError } = await supabase
              .from('vehicle_documents')
              .update({
                document_number: doc.number,
                issue_date: doc.issueDate,
                expiry_date: doc.expiryDate,
                issuing_authority: doc.issuingAuthority || null,
                document_url: doc.documentUrl || null,
                notes: doc.notes || null,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingDoc.id)

            if (updateError) throw updateError
          } else {
            // Insert new document
            const { error: insertError } = await supabase
              .from('vehicle_documents')
              .insert({
                vehicle_id: id,
                document_type: type,
                document_number: doc.number,
                issue_date: doc.issueDate,
                expiry_date: doc.expiryDate,
                issuing_authority: doc.issuingAuthority || null,
                document_url: doc.documentUrl || null,
                notes: doc.notes || null,
              })

            if (insertError) throw insertError
          }
        }
      }
    }

    // Fetch updated vehicle
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select(`
        *,
        operators:operator_id(id, name, code),
        vehicle_types:vehicle_type_id(id, name)
      `)
      .eq('id', id)
      .single()

    const { data: documents } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', id)

    const docsMap: any = {}
    const today = new Date().toISOString().split('T')[0]
    documents?.forEach((doc: any) => {
      docsMap[doc.document_type] = {
        number: doc.document_number,
        issueDate: doc.issue_date,
        expiryDate: doc.expiry_date,
        issuingAuthority: doc.issuing_authority,
        documentUrl: doc.document_url,
        notes: doc.notes,
        isValid: doc.expiry_date >= today,
      }
    })

    return res.json({
      id: vehicle.id,
      plateNumber: vehicle.plate_number,
      vehicleTypeId: vehicle.vehicle_type_id,
      vehicleType: (vehicle as any).vehicle_types ? {
        id: (vehicle as any).vehicle_types.id,
        name: (vehicle as any).vehicle_types.name,
      } : undefined,
      operatorId: vehicle.operator_id,
      operator: (vehicle as any).operators ? {
        id: (vehicle as any).operators.id,
        name: (vehicle as any).operators.name,
        code: (vehicle as any).operators.code,
      } : undefined,
      seatCapacity: vehicle.seat_capacity,
      manufactureYear: vehicle.manufacture_year,
      chassisNumber: vehicle.chassis_number,
      engineNumber: vehicle.engine_number,
      color: vehicle.color,
      isActive: vehicle.is_active,
      notes: vehicle.notes,
      documents: {
        registration: docsMap.registration || undefined,
        inspection: docsMap.inspection || undefined,
        insurance: docsMap.insurance || undefined,
        operation_permit: docsMap.operation_permit || undefined,
        emblem: docsMap.emblem || undefined,
      },
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: error.message || 'Failed to update vehicle' })
  }
}

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete vehicle' })
  }
}
