import { useState, useEffect } from "react"
import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const driverSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc"),
  phoneNumber: z.string().min(1, "Số điện thoại là bắt buộc"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  licenseNumber: z.string().min(1, "Số bằng lái là bắt buộc"),
  licenseExpiry: z.string().min(1, "Ngày hết hạn bằng lái là bắt buộc"),
  contractExpiry: z.string().optional(),
})

type DriverFormData = z.infer<typeof driverSchema>

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">("create")

  useEffect(() => {
    loadDrivers()
  }, [])

  const loadDrivers = async () => {
    setIsLoading(true)
    try {
      // Use mock data - replace with actual API call when backend is ready
      // const data = await driverService.getAll()
      // setDrivers(data)
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      const { mockDrivers } = await import("@/mocks/drivers.mock")
      setDrivers(mockDrivers)
    } catch (error) {
      console.error("Failed to load drivers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        driver.fullName.toLowerCase().includes(query) ||
        driver.phoneNumber.toLowerCase().includes(query) ||
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
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.fullName}</TableCell>
                  <TableCell>{driver.phoneNumber}</TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>
                    {format(new Date(driver.licenseExpiry), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={driver.status} />
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
            <p className="text-lg font-medium text-gray-900">{driver.phoneNumber}</p>
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
              {format(new Date(driver.licenseExpiry), "dd/MM/yyyy")}
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="contract" className="mt-6">
        {driver.contractExpiry ? (
          <div className="space-y-2">
            <Label className="text-base font-semibold">Ngày hết hạn hợp đồng</Label>
            <p className="text-lg font-medium text-gray-900">
              {format(new Date(driver.contractExpiry), "dd/MM/yyyy")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có thông tin hợp đồng</p>
        )}
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: driver
      ? {
          ...driver,
          licenseExpiry: driver.licenseExpiry
            ? new Date(driver.licenseExpiry).toISOString().split("T")[0]
            : "",
          contractExpiry: driver.contractExpiry
            ? new Date(driver.contractExpiry).toISOString().split("T")[0]
            : "",
        }
      : undefined,
  })

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Label htmlFor="phoneNumber" className="text-base font-semibold">
            Số điện thoại *
          </Label>
          <Input
            id="phoneNumber"
            className="h-11"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>
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
          <Label htmlFor="licenseExpiry" className="text-base font-semibold">
            Ngày hết hạn bằng lái *
          </Label>
          <Input
            id="licenseExpiry"
            type="date"
            className="h-11"
            {...register("licenseExpiry")}
          />
          {errors.licenseExpiry && (
            <p className="text-sm text-red-600 mt-1">{errors.licenseExpiry.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contractExpiry" className="text-base font-semibold">
            Ngày hết hạn hợp đồng
          </Label>
          <Input
            id="contractExpiry"
            type="date"
            className="h-11"
            {...register("contractExpiry")}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]">
          Hủy
        </Button>
        <Button type="submit" className="min-w-[100px]">Lưu</Button>
      </div>
    </form>
  )
}

