import { useState, useEffect } from "react"
import { Plus, Search, Edit, Eye, Trash2, Image as ImageIcon, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/QRScanner"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/layout/StatusBadge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { driverService } from "@/services/driver.service"
import type { Driver, DriverInput } from "@/types"
import { format, isValid, parseISO } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const driverSchema = z.object({
  operatorId: z.string().uuid("Vui lòng chọn nhà xe"),
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  idNumber: z.string().min(1, "Số CMND/CCCD là bắt buộc"),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  licenseNumber: z.string().min(1, "Số bằng lái là bắt buộc"),
  licenseClass: z.string().min(1, "Hạng bằng lái là bắt buộc"),
  licenseExpiryDate: z.string().min(1, "Ngày hết hạn bằng lái là bắt buộc"),
  licenseIssueDate: z.string().optional(),
  healthCertificateExpiry: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
})

type DriverFormData = z.infer<typeof driverSchema>

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A"
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
  return isValid(date) ? format(date, "dd/MM/yyyy") : "N/A"
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">("create")
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    setIsLoading(true)
    try {
      const data = await driverService.getAll()
      setDrivers(data)
    } catch (error) {
      console.error("Failed to load drivers:", error)
      // Show error message to user
      alert("Không thể tải danh sách lái xe. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        driver.fullName.toLowerCase().includes(query) ||
        (driver.phone || '').toLowerCase().includes(query) ||
        driver.licenseNumber.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleCreate = () => {
    setSelectedDriver(null)
    setViewMode("create")
    setDialogOpen(true)
  }

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver)
    setViewMode("edit")
    setDialogOpen(true)
  }

  const handleView = (driver: Driver) => {
    setSelectedDriver(driver)
    setViewMode("view")
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa lái xe này?")) {
      try {
        await driverService.delete(id)
        loadDrivers()
      } catch (error) {
        console.error("Failed to delete driver:", error)
      }
    }
  }

  const handleViewImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl)
    setImageDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý lái xe</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin và giấy tờ lái xe</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm lái xe
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại, bằng lái..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Số bằng lái</TableHead>
              <TableHead>Ngày hết hạn bằng lái</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ảnh tài xế</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.fullName}</TableCell>
                  <TableCell>{driver.phone || 'N/A'}</TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>
                    {formatDate(driver.licenseExpiryDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={driver.isActive ? 'active' : 'inactive'} />
                  </TableCell>
                  <TableCell>
                    {driver.imageUrl ? (
                      <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewImage(driver.imageUrl!)}
                        aria-label="Xem ảnh"
                      >
                        <img
                          src={driver.imageUrl}
                          alt={`Ảnh ${driver.fullName}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23f3f4f6' width='64' height='64'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='10'%3EN/A%3C/text%3E%3C/svg%3E"
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(driver)}
                        aria-label="Xem"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(driver)}
                        aria-label="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(driver.id)}
                        aria-label="Xóa"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl w-full max-h-[95vh] overflow-y-auto p-6">
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {viewMode === "create" && "Thêm lái xe mới"}
              {viewMode === "edit" && "Sửa thông tin lái xe"}
              {viewMode === "view" && "Chi tiết lái xe"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {viewMode === "view" && selectedDriver ? (
              <DriverView driver={selectedDriver} />
            ) : (
              <DriverForm
                driver={selectedDriver}
                mode={viewMode === "view" ? "create" : viewMode}
                onClose={() => {
                  setDialogOpen(false)
                  loadDrivers()
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl w-full p-6">
          <DialogClose onClose={() => setImageDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle className="text-2xl">Ảnh tài xế</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            {selectedImageUrl && (
              <img
                src={selectedImageUrl}
                alt="Ảnh tài xế"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='16'%3EKhông thể tải ảnh%3C/text%3E%3C/svg%3E"
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DriverView({ driver }: { driver: Driver }) {
  const [activeTab, setActiveTab] = useState("info")
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
        <TabsTrigger value="license">Bằng lái</TabsTrigger>
        <TabsTrigger value="contract">Hợp đồng</TabsTrigger>
        <TabsTrigger value="history">Lịch sử điều độ</TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="space-y-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Họ tên</Label>
            <p className="text-lg font-medium text-gray-900">{driver.fullName}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Số điện thoại</Label>
            <p className="text-lg font-medium text-gray-900">{driver.phone || 'N/A'}</p>
          </div>
          {driver.email && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Email</Label>
              <p className="text-lg font-medium text-gray-900">{driver.email}</p>
            </div>
          )}
        </div>
      </TabsContent>
      <TabsContent value="license" className="space-y-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Số bằng lái</Label>
            <p className="text-lg font-medium text-gray-900">{driver.licenseNumber}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Ngày hết hạn</Label>
            <p className="text-lg font-medium text-gray-900">
              {formatDate(driver.licenseExpiryDate)}
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="contract" className="mt-6">
        <p className="text-sm text-gray-500">Thông tin hợp đồng sẽ được quản lý riêng</p>
      </TabsContent>
      <TabsContent value="history" className="mt-6">
        <p className="text-sm text-gray-500">Lịch sử điều độ sẽ được hiển thị ở đây</p>
      </TabsContent>
    </Tabs>
  )
}

function DriverForm({
  driver,
  mode,
  onClose,
}: {
  driver: Driver | null
  mode: "create" | "edit"
  onClose: () => void
}) {
  const [qrScannerOpen, setQrScannerOpen] = useState(false)
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
          email: driver.email || "",
          licenseNumber: driver.licenseNumber,
          licenseClass: driver.licenseClass,
          licenseExpiryDate: driver.licenseExpiryDate
            ? new Date(driver.licenseExpiryDate).toISOString().split("T")[0]
            : "",
          licenseIssueDate: driver.licenseIssueDate
            ? new Date(driver.licenseIssueDate).toISOString().split("T")[0]
            : "",
          healthCertificateExpiry: driver.healthCertificateExpiry
            ? new Date(driver.healthCertificateExpiry).toISOString().split("T")[0]
            : "",
          dateOfBirth: driver.dateOfBirth
            ? new Date(driver.dateOfBirth).toISOString().split("T")[0]
            : "",
          address: driver.address || "",
          imageUrl: driver.imageUrl || "",
        }
      : undefined,
  })

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
      alert("Không thể đọc dữ liệu từ QR code. Vui lòng thử lại.")
      return false
    }
  }

  const onSubmit = async (data: DriverFormData) => {
    try {
      if (mode === "create") {
        await driverService.create(data as DriverInput)
      } else if (driver) {
        await driverService.update(driver.id, data)
      }
      onClose()
    } catch (error) {
      console.error("Failed to save driver:", error)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {mode === "create" && (
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQrScannerOpen(true)}
              className="flex items-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              Quét QR bằng lái
            </Button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-base font-semibold">
            Họ tên *
          </Label>
          <Input
            id="fullName"
            className="h-11"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-semibold">
            Số điện thoại
          </Label>
          <Input
            id="phone"
            className="h-11"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-semibold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="h-11"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="text-base font-semibold">
            Số bằng lái *
          </Label>
          <Input
            id="licenseNumber"
            className="h-11"
            {...register("licenseNumber")}
          />
          {errors.licenseNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.licenseNumber.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseExpiryDate" className="text-base font-semibold">
            Ngày hết hạn bằng lái *
          </Label>
          <Input
            id="licenseExpiryDate"
            type="date"
            className="h-11"
            {...register("licenseExpiryDate")}
          />
          {errors.licenseExpiryDate && (
            <p className="text-sm text-red-600 mt-1">{errors.licenseExpiryDate.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseClass" className="text-base font-semibold">
            Hạng bằng lái *
          </Label>
          <Input
            id="licenseClass"
            className="h-11"
            placeholder="B1, B2, D, E..."
            {...register("licenseClass")}
          />
          {errors.licenseClass && (
            <p className="text-sm text-red-600 mt-1">{errors.licenseClass.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="idNumber" className="text-base font-semibold">
            Số CMND/CCCD *
          </Label>
          <Input
            id="idNumber"
            className="h-11"
            {...register("idNumber")}
          />
          {errors.idNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.idNumber.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="operatorId" className="text-base font-semibold">
            Nhà xe *
          </Label>
          <Input
            id="operatorId"
            className="h-11"
            placeholder="Nhập ID nhà xe (tạm thời)"
            {...register("operatorId")}
          />
          {errors.operatorId && (
            <p className="text-sm text-red-600 mt-1">{errors.operatorId.message}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]">
          Hủy
        </Button>
        <Button type="submit" className="min-w-[100px]">Lưu</Button>
      </div>
    </form>

    {/* QR Scanner Dialog */}
    <Dialog open={qrScannerOpen} onOpenChange={setQrScannerOpen}>
      <DialogContent className="max-w-2xl w-full p-6">
        <DialogClose onClose={() => setQrScannerOpen(false)} />
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

