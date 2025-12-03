import { useState, useEffect } from "react"
import { Calendar, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { vehicleService } from "@/services/vehicle.service"
import type { Vehicle, VehicleDocuments } from "@/types"
import { format } from "date-fns"

interface DocumentValidityDialogProps {
  vehicleId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DocumentValidityDialog({
  vehicleId,
  open,
  onClose,
  onSuccess
}: DocumentValidityDialogProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [documents, setDocuments] = useState<VehicleDocuments>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && vehicleId) {
      loadVehicle()
    }
  }, [open, vehicleId])

  const loadVehicle = async () => {
    try {
      const data = await vehicleService.getById(vehicleId)
      setVehicle(data)
      setDocuments(data.documents || {})
    } catch (error) {
      console.error("Failed to load vehicle:", error)
    }
  }

  const handleSave = async () => {
    if (!vehicle) return

    // Validate required fields - chỉ kiểm tra expiryDate vì đây là dialog sửa hiệu lực
    const requiredDocs = ['registration', 'operation_permit', 'inspection', 'insurance'] as const
    for (const docType of requiredDocs) {
      const doc = documents[docType]
      if (!doc || !doc.expiryDate) {
        alert(`Vui lòng nhập ngày hết hạn cho ${getDocumentLabel(docType)}`)
        return
      }
    }

    setIsLoading(true)
    try {
      // Update vehicle documents - đảm bảo gửi đầy đủ thông tin
      // Lấy thông tin hiện có từ vehicle, chỉ cập nhật expiryDate
      const documentsToUpdate: VehicleDocuments = {}
      for (const docType of requiredDocs) {
        const doc = documents[docType]
        if (doc && doc.expiryDate) {
          const existingDoc = vehicle.documents?.[docType]
          
          // Đảm bảo tất cả trường bắt buộc là string, không được null/undefined
          const number = existingDoc?.number || `AUTO-${docType}-${vehicle.plateNumber}`
          const issueDate = existingDoc?.issueDate || new Date().toISOString().split('T')[0]
          const expiryDate = doc.expiryDate
          
          // Nếu document đã tồn tại, giữ nguyên thông tin cũ, chỉ cập nhật expiryDate
          if (existingDoc) {
            documentsToUpdate[docType] = {
              number: number,
              issueDate: issueDate,
              expiryDate: expiryDate,
              // Chỉ thêm các trường optional nếu chúng có giá trị (không phải null/undefined)
              ...(existingDoc.issuingAuthority && { issuingAuthority: existingDoc.issuingAuthority }),
              ...(existingDoc.documentUrl && { documentUrl: existingDoc.documentUrl }),
              ...(existingDoc.notes && { notes: existingDoc.notes }),
              isValid: checkDocumentValidity(expiryDate)
            }
          } else {
            // Nếu document chưa tồn tại, tạo mới với thông tin tối thiểu
            documentsToUpdate[docType] = {
              number: number,
              issueDate: issueDate,
              expiryDate: expiryDate,
              isValid: checkDocumentValidity(expiryDate)
            }
          }
        }
      }

      // Log để debug
      console.log('Updating documents:', JSON.stringify(documentsToUpdate, null, 2))

      await vehicleService.update(vehicle.id, {
        documents: documentsToUpdate
      })

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error: any) {
      console.error("Failed to update documents:", error)
      console.error("Error response:", error?.response?.data)
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = "Không thể cập nhật hiệu lực giấy tờ. Vui lòng thử lại sau."
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.response?.data?.errors) {
        // Nếu có nhiều lỗi validation
        const errors = error.response.data.errors
        errorMessage = Array.isArray(errors) 
          ? errors.map((e: any) => e.message || e).join('\n')
          : JSON.stringify(errors)
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getDocumentLabel = (docType: keyof VehicleDocuments): string => {
    const labels: Record<string, string> = {
      registration: 'Đăng ký xe',
      operation_permit: 'Phù hiệu',
      inspection: 'Đăng kiểm',
      insurance: 'Bảo hiểm'
    }
    return labels[docType] || docType
  }

  const updateDocumentDate = (docType: keyof VehicleDocuments, value: string) => {
    setDocuments(prev => {
      const updated = { ...prev }
      if (!updated[docType]) {
        // Nếu document chưa tồn tại, tạo mới với thông tin từ vehicle hiện tại hoặc giá trị mặc định
        const existingDoc = vehicle?.documents?.[docType]
        updated[docType] = {
          number: existingDoc?.number || '',
          issueDate: existingDoc?.issueDate || new Date().toISOString().split('T')[0],
          expiryDate: value,
          isValid: checkDocumentValidity(value)
        }
      } else {
        updated[docType] = {
          ...updated[docType]!,
          expiryDate: value,
          isValid: checkDocumentValidity(value)
        }
      }
      return updated
    })
  }

  const checkDocumentValidity = (expiryDate: string): boolean => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return expiry >= today
  }

  const getDocumentStatus = (expiryDate?: string): { isValid: boolean; icon: JSX.Element } => {
    if (!expiryDate) {
      return {
        isValid: false,
        icon: <X className="h-5 w-5 text-red-500" />
      }
    }
    const isValid = checkDocumentValidity(expiryDate)
    return {
      isValid,
      icon: isValid 
        ? <CheckCircle className="h-5 w-5 text-green-500" />
        : <X className="h-5 w-5 text-red-500" />
    }
  }

  const registrationExpiry = documents.registration?.expiryDate || ''
  const permitExpiry = documents.operation_permit?.expiryDate || ''
  const inspectionExpiry = documents.inspection?.expiryDate || ''
  const insuranceExpiry = documents.insurance?.expiryDate || ''

  const registrationStatus = getDocumentStatus(registrationExpiry)
  const permitStatus = getDocumentStatus(permitExpiry)
  const inspectionStatus = getDocumentStatus(inspectionExpiry)
  const insuranceStatus = getDocumentStatus(insuranceExpiry)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sửa hiệu lực giấy tờ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Đăng ký xe */}
          <div>
            <Label htmlFor="registrationExpiry">
              Đăng ký xe <span className="text-red-500">(*)</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="registrationExpiry"
                type="date"
                value={registrationExpiry ? format(new Date(registrationExpiry), "yyyy-MM-dd") : ""}
                onChange={(e) => updateDocumentDate('registration', e.target.value)}
                className="pr-20"
                required
              />
              <Calendar className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {registrationStatus.icon}
              </div>
            </div>
          </div>

          {/* Hạn phù hiệu */}
          <div>
            <Label htmlFor="permitExpiry">
              Hạn phù hiệu <span className="text-red-500">(*)</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="permitExpiry"
                type="date"
                value={permitExpiry ? format(new Date(permitExpiry), "yyyy-MM-dd") : ""}
                onChange={(e) => updateDocumentDate('operation_permit', e.target.value)}
                className="pr-20"
                required
              />
              <Calendar className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {permitStatus.icon}
              </div>
            </div>
          </div>

          {/* Hạn đăng kiểm */}
          <div>
            <Label htmlFor="inspectionExpiry">
              Hạn đăng kiểm <span className="text-red-500">(*)</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="inspectionExpiry"
                type="date"
                value={inspectionExpiry ? format(new Date(inspectionExpiry), "yyyy-MM-dd") : ""}
                onChange={(e) => updateDocumentDate('inspection', e.target.value)}
                className="pr-20"
                required
              />
              <Calendar className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {inspectionStatus.icon}
              </div>
            </div>
          </div>

          {/* Hạn bảo hiểm */}
          <div>
            <Label htmlFor="insuranceExpiry">
              Hạn bảo hiểm <span className="text-red-500">(*)</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="insuranceExpiry"
                type="date"
                value={insuranceExpiry ? format(new Date(insuranceExpiry), "yyyy-MM-dd") : ""}
                onChange={(e) => updateDocumentDate('insurance', e.target.value)}
                className="pr-20"
                required
              />
              <Calendar className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {insuranceStatus.icon}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            HỦY
          </Button>
          <Button 
            type="button"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "LƯU"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

