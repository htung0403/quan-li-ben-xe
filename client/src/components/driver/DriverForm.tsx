import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "react-toastify"
import { QrCode, Search, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { QRScanner } from "@/components/QRScanner"
import { DatePicker } from "@/components/DatePicker"
import { driverService } from "@/services/driver.service"
import { operatorService } from "@/services/operator.service"
import api from "@/lib/api"
import { Driver, DriverInput, Operator } from "@/types"

const LICENSE_CLASSES = [
  "A", "A1", "A2", "A3", "A4", "B", "B1", "B2", "BE", "C", "C1", "C1E",
  "CE", "D", "D1", "D1E", "D2", "D2E", "DE", "D,FC", "E", "E,FC", "F",
  "FB2", "FC", "FD", "FE"
]

const driverSchema = z.object({
  operatorId: z.string().uuid("Vui lòng chọn nhà xe"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  idNumber: z.string().min(1, "Số CMND/CCCD là bắt buộc"),
  phone: z.string().optional(),
  licenseNumber: z.string().min(1, "Số bằng lái là bắt buộc"),
  licenseClass: z.string().min(1, "Hạng bằng lái là bắt buộc"),
  licenseExpiryDate: z.string().min(1, "Ngày hết hạn bằng lái là bắt buộc"),
  province: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
})

type DriverFormData = z.infer<typeof driverSchema>

interface DriverFormProps {
  driver: Driver | null
  mode: "create" | "edit"
  onClose: () => void
}

export function DriverForm({ driver, mode, onClose }: DriverFormProps) {
  const [qrScannerOpen, setQrScannerOpen] = useState(false)
  const [operators, setOperators] = useState<Operator[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [licenseExpiryDate, setLicenseExpiryDate] = useState<Date | null>(
    driver?.licenseExpiryDate ? new Date(driver.licenseExpiryDate) : null
  )
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: driver
      ? {
          operatorId: driver.operatorId,
          fullName: driver.fullName,
          idNumber: driver.idNumber,
          phone: driver.phone || "",
          licenseNumber: driver.licenseNumber,
          licenseClass: driver.licenseClass,
          licenseExpiryDate: driver.licenseExpiryDate
            ? new Date(driver.licenseExpiryDate).toISOString().split("T")[0]
            : "",
          province: driver.province || "",
          district: driver.district || "",
          address: driver.address || "",
          imageUrl: driver.imageUrl || "",
        }
      : undefined,
  })

  useEffect(() => {
    loadOperators()
    if (driver) {
      setSelectedOperatorId(driver.operatorId)
      setImageUrl(driver.imageUrl || "")
    }
  }, [driver])

  const loadOperators = async () => {
    try {
      const data = await operatorService.getAll(true) // Only active operators
      setOperators(data)
    } catch (error) {
      console.error("Failed to load operators:", error)
      toast.error("Không thể tải danh sách đơn vị vận tải")
    }
  }

  const filteredOperators = operators.filter((operator) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return operator.name.toLowerCase().includes(query) || 
             operator.code.toLowerCase().includes(query)
    }
    return true
  })

  const handleOperatorSelect = (operatorId: string) => {
    setSelectedOperatorId(operatorId)
    setValue("operatorId", operatorId)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await api.post<{ url: string }>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setImageUrl(response.data.url)
      setValue("imageUrl", response.data.url)
      toast.success('Upload ảnh thành công')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('Không thể upload ảnh. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl("")
    setValue("imageUrl", "")
  }

  const parseQRData = (qrText: string) => {
    try {
      const parts = qrText.split(";")
      if (parts.length < 7) {
        throw new Error("Định dạng QR code không hợp lệ")
      }

      const licenseNumber = parts[0].trim()
      const fullName = parts[1].trim()
      const licenseExpiryText = parts[5].trim()

      // Parse ngày hết hạn (có thể là "Không thời hạn" hoặc ddmmyyyy)
      let licenseExpiry = ""
      if (licenseExpiryText !== "Không thời hạn" && licenseExpiryText.length === 8) {
        // Convert ddmmyyyy to yyyy-mm-dd
        const day = licenseExpiryText.substring(0, 2)
        const month = licenseExpiryText.substring(2, 4)
        const year = licenseExpiryText.substring(4, 8)
        licenseExpiry = `${year}-${month}-${day}`
      } else if (licenseExpiryText === "Không thời hạn") {
        // Set a far future date for "no expiry"
        licenseExpiry = "2099-12-31"
      }

      // Điền vào form
      setValue("licenseNumber", licenseNumber)
      setValue("fullName", fullName)
      if (licenseExpiry) {
        setValue("licenseExpiryDate", licenseExpiry)
      }

      return true
    } catch (error) {
      console.error("Error parsing QR data:", error)
      toast.error("Không thể đọc dữ liệu từ QR code. Vui lòng thử lại.")
      return false
    }
  }

  const onSubmit = async (data: DriverFormData) => {
    try {
      if (mode === "create") {
        await driverService.create(data as DriverInput)
        toast.success("Thêm lái xe thành công")
      } else if (driver) {
        await driverService.update(driver.id, data)
        toast.success("Cập nhật lái xe thành công")
      }
      onClose()
    } catch (error) {
      console.error("Failed to save driver:", error)
      toast.error("Có lỗi xảy ra khi lưu thông tin lái xe")
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Header with title and QR button */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Thông tin lái xe</h3>
            {mode === "create" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setQrScannerOpen(true)}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Quét QR bằng lái
              </Button>
            )}
          </div>

          {/* Main 2 column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Sub-columns for ID and License info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Column 1a - ID Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">Số CMND/CCCD <span className="text-red-500">*</span></Label>
                    <Input
                      id="idNumber"
                      placeholder="Số CMND/CCCD"
                      {...register("idNumber")}
                    />
                    {errors.idNumber && (
                      <p className="text-sm text-red-600">{errors.idNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ tên <span className="text-red-500">*</span></Label>
                    <Input
                      id="fullName"
                      placeholder="Họ tên (*)"
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      placeholder="Số điện thoại (*)"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
                    <Input
                      id="province"
                      placeholder="Tỉnh/Thành phố (*)"
                      {...register("province")}
                    />
                  </div>
                </div>

                {/* Column 1b - License Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Số GPLX <span className="text-red-500">*</span></Label>
                    <Input
                      id="licenseNumber"
                      placeholder="Số GPLX (*)"
                      {...register("licenseNumber")}
                    />
                    {errors.licenseNumber && (
                      <p className="text-sm text-red-600">{errors.licenseNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseClass">Hạng GPLX <span className="text-red-500">*</span></Label>
                    <Select 
                      id="licenseClass"
                      defaultValue={driver?.licenseClass || ""}
                      {...register("licenseClass")}
                      className="max-h-[200px]"
                    >
                      <option value="">Chọn hạng GPLX</option>
                      {LICENSE_CLASSES.map((license) => (
                        <option key={license} value={license}>
                          {license}
                        </option>
                      ))}
                    </Select>
                    {errors.licenseClass && (
                      <p className="text-sm text-red-600">{errors.licenseClass.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiryDate">Hạn hiệu lực GPLX <span className="text-red-500">*</span></Label>
                    <DatePicker
                      date={licenseExpiryDate}
                      onDateChange={(date) => {
                        setLicenseExpiryDate(date || null)
                        if (date) {
                          const dateString = date.toISOString().split("T")[0]
                          setValue("licenseExpiryDate", dateString)
                        }
                      }}
                      placeholder="Chọn hạn GPLX"
                    />
                    {errors.licenseExpiryDate && (
                      <p className="text-sm text-red-600">{errors.licenseExpiryDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">Quận/Huyện <span className="text-red-500">*</span></Label>
                    <Input
                      id="district"
                      placeholder="Quận/Huyện(*)"
                      {...register("district")}
                    />
                  </div>
                </div>
              </div>

              {/* Full address below */}
              <div className="space-y-2">
                <Label htmlFor="fullAddress">Địa chỉ cụ thể</Label>
                <Input
                  id="fullAddress"
                  placeholder="Địa chỉ cụ thể"
                  {...register("address")}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Column 2a - Operator selection */}
              <div className="space-y-2">
                <Label>Doanh nghiệp vận tải</Label>
                <div className="border rounded-md p-4 space-y-2 h-[400px] overflow-y-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm..."
                      className="w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    {filteredOperators.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Không có dữ liệu
                      </p>
                    ) : (
                      filteredOperators.map((operator) => (
                        <div 
                          key={operator.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <input 
                            type="radio" 
                            id={`operator-${operator.id}`}
                            name="operatorId"
                            className="h-4 w-4"
                            checked={selectedOperatorId === operator.id}
                            onChange={() => handleOperatorSelect(operator.id)}
                          />
                          <Label 
                            htmlFor={`operator-${operator.id}`}
                            className="font-normal flex-1 cursor-pointer text-sm"
                          >
                            {operator.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 border-t text-sm text-gray-600">
                    Tổng: {filteredOperators.length}
                  </div>
                </div>
                {errors.operatorId && (
                  <p className="text-sm text-red-600">{errors.operatorId.message}</p>
                )}
              </div>

              {/* Column 2b - Image Upload */}
              <div className="space-y-2">
                <Label>Ảnh lái xe</Label>
                {imageUrl ? (
                  <div className="relative border rounded-md p-2 bg-gray-50">
                    <img 
                      src={imageUrl} 
                      alt="Driver" 
                      className="w-full aspect-[3/4] object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 bg-white/80 hover:bg-white"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-md p-4 text-center aspect-[3/4] flex flex-col items-center justify-center">
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      <Upload className="h-8 w-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploading ? "Đang upload..." : "Click để upload ảnh"}
                      </p>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]">
            Hủy
          </Button>
          <Button type="submit" className="min-w-[100px]">
            Lưu
          </Button>
        </div>
      </form>

      {/* QR Scanner Dialog */}
      <Dialog open={qrScannerOpen} onOpenChange={setQrScannerOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">Quét QR code bằng lái xe</DialogTitle>
          </DialogHeader>
        <div className="mt-4">
          <QRScanner
            onScanSuccess={(text) => {
              if (parseQRData(text)) {
                setQrScannerOpen(false)
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
