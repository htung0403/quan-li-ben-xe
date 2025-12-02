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
import { Select } from "@/components/ui/select"
import { vehicleService } from "@/services/vehicle.service"
import type { Vehicle, VehicleInput } from "@/types"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, "Biển số là bắt buộc"),
  vehicleType: z.string().min(1, "Loại xe là bắt buộc"),
  seatCapacity: z.number().min(1, "Số ghế phải lớn hơn 0"),
  operatorId: z.string().min(1, "Nhà xe là bắt buộc"),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterVehicleType, setFilterVehicleType] = useState("")
  const [filterOperator, setFilterOperator] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">("create")

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    setIsLoading(true)
    try {
      // Use mock data - replace with actual API call when backend is ready
      // const data = await vehicleService.getAll()
      // setVehicles(data)
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      const { mockVehicles } = await import("@/mocks/vehicles.mock")
      setVehicles(mockVehicles)
    } catch (error) {
      console.error("Failed to load vehicles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique vehicle types and operators for filter options
  const vehicleTypes = Array.from(new Set(vehicles.map((v) => v.vehicleType))).sort()
  const operators = Array.from(
    new Set(vehicles.map((v) => v.operatorName || v.operatorId).filter(Boolean))
  ).sort()

  const filteredVehicles = vehicles.filter((vehicle) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        vehicle.plateNumber.toLowerCase().includes(query) ||
        vehicle.vehicleType.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Vehicle type filter
    if (filterVehicleType && vehicle.vehicleType !== filterVehicleType) {
      return false
    }

    // Operator filter
    if (filterOperator) {
      const vehicleOperator = vehicle.operatorName || vehicle.operatorId
      if (vehicleOperator !== filterOperator) {
        return false
      }
    }

    return true
  })

  const handleCreate = () => {
    setSelectedVehicle(null)
    setViewMode("create")
    setDialogOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setViewMode("edit")
    setDialogOpen(true)
  }

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setViewMode("view")
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      try {
        await vehicleService.delete(id)
        loadVehicles()
      } catch (error) {
        console.error("Failed to delete vehicle:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý xe</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin và giấy tờ xe</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm xe
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo biển số, loại xe..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterVehicleType" className="text-sm font-medium">
                  Lọc theo loại xe
                </Label>
                <Select
                  id="filterVehicleType"
                  value={filterVehicleType}
                  onChange={(e) => setFilterVehicleType(e.target.value)}
                >
                  <option value="">Tất cả loại xe</option>
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterOperator" className="text-sm font-medium">
                  Lọc theo nhà xe
                </Label>
                <Select
                  id="filterOperator"
                  value={filterOperator}
                  onChange={(e) => setFilterOperator(e.target.value)}
                >
                  <option value="">Tất cả nhà xe</option>
                  {operators.map((operator) => (
                    <option key={operator} value={operator}>
                      {operator}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Biển số</TableHead>
              <TableHead>Loại xe</TableHead>
              <TableHead>Số ghế</TableHead>
              <TableHead>Nhà xe</TableHead>
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
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    {vehicle.plateNumber}
                  </TableCell>
                  <TableCell>{vehicle.vehicleType}</TableCell>
                  <TableCell>{vehicle.seatCapacity}</TableCell>
                  <TableCell>{vehicle.operatorName || vehicle.operatorId}</TableCell>
                  <TableCell>
                    <StatusBadge status={vehicle.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(vehicle)}
                        aria-label="Xem"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(vehicle)}
                        aria-label="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(vehicle.id)}
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
              {viewMode === "create" && "Thêm xe mới"}
              {viewMode === "edit" && "Sửa thông tin xe"}
              {viewMode === "view" && "Chi tiết xe"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {viewMode === "view" && selectedVehicle ? (
              <VehicleView vehicle={selectedVehicle} />
            ) : (
              <VehicleForm
                vehicle={selectedVehicle}
                mode={viewMode === "view" ? "create" : viewMode}
                onClose={() => {
                  setDialogOpen(false)
                  loadVehicles()
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VehicleView({ vehicle }: { vehicle: Vehicle }) {
  const [activeTab, setActiveTab] = useState("info")
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
        <TabsTrigger value="documents">Giấy tờ</TabsTrigger>
        <TabsTrigger value="history">Lịch sử hoạt động</TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="space-y-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Biển số</Label>
            <p className="text-lg font-medium text-gray-900">{vehicle.plateNumber}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Loại xe</Label>
            <p className="text-lg font-medium text-gray-900">{vehicle.vehicleType}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Số ghế</Label>
            <p className="text-lg font-medium text-gray-900">{vehicle.seatCapacity}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Nhà xe</Label>
            <p className="text-lg font-medium text-gray-900">
              {vehicle.operatorName || vehicle.operatorId}
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="documents" className="space-y-4 mt-6">
        <div className="space-y-4">
          <DocumentCard
            title="Đăng kiểm"
            doc={vehicle.documents.inspection}
          />
          <DocumentCard
            title="Phù hiệu"
            doc={vehicle.documents.permit}
          />
          <DocumentCard
            title="Bảo hiểm"
            doc={vehicle.documents.insurance}
          />
        </div>
      </TabsContent>
      <TabsContent value="history" className="mt-6">
        <p className="text-sm text-gray-500">Lịch sử hoạt động sẽ được hiển thị ở đây</p>
      </TabsContent>
    </Tabs>
  )
}

function DocumentCard({
  title,
  doc,
}: {
  title: string
  doc: { number: string; issueDate: string; expiryDate: string; isValid: boolean }
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="font-semibold text-lg">{title}</p>
            <p className="text-base text-gray-700">Số: {doc.number}</p>
            <p className="text-base text-gray-700">
              Hết hạn: {format(new Date(doc.expiryDate), "dd/MM/yyyy")}
            </p>
          </div>
          <StatusBadge
            status={doc.isValid ? "active" : "inactive"}
            label={doc.isValid ? "Hợp lệ" : "Hết hạn"}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function VehicleForm({
  vehicle,
  mode,
  onClose,
}: {
  vehicle: Vehicle | null
  mode: "create" | "edit"
  onClose: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle || undefined,
  })

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (mode === "create") {
        await vehicleService.create(data as VehicleInput)
      } else if (vehicle) {
        await vehicleService.update(vehicle.id, data)
      }
      onClose()
    } catch (error) {
      console.error("Failed to save vehicle:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="plateNumber" className="text-base font-semibold">
            Biển số *
          </Label>
          <Input
            id="plateNumber"
            className="h-11"
            {...register("plateNumber")}
          />
          {errors.plateNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.plateNumber.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleType" className="text-base font-semibold">
            Loại xe *
          </Label>
          <Select
            id="vehicleType"
            className="h-11"
            {...register("vehicleType")}
          >
            <option value="">Chọn loại xe</option>
            <option value="Xe khách">Xe khách</option>
            <option value="Xe tải">Xe tải</option>
          </Select>
          {errors.vehicleType && (
            <p className="text-sm text-red-600 mt-1">{errors.vehicleType.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="seatCapacity" className="text-base font-semibold">
            Số ghế *
          </Label>
          <Input
            id="seatCapacity"
            type="number"
            className="h-11"
            {...register("seatCapacity", { valueAsNumber: true })}
          />
          {errors.seatCapacity && (
            <p className="text-sm text-red-600 mt-1">{errors.seatCapacity.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="operatorId" className="text-base font-semibold">
            Nhà xe *
          </Label>
          <Input
            id="operatorId"
            className="h-11"
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
  )
}

