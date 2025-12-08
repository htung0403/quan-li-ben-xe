import { useState, useEffect } from "react"
import { toast } from "react-toastify"
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
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { vehicleService } from "@/services/vehicle.service"
import type { Vehicle } from "@/types"
import { useUIStore } from "@/store/ui.store"
import { VehicleView } from "@/components/vehicle/VehicleView"
import { VehicleForm } from "@/components/vehicle/VehicleForm"

// Helper functions to extract display values
const getVehicleTypeName = (vehicle: Vehicle): string => {
  return vehicle.vehicleType?.name || vehicle.vehicleTypeId || ""
}

const getOperatorName = (vehicle: Vehicle): string => {
  return vehicle.operator?.name || vehicle.operatorId || ""
}

export default function QuanLyXe() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterVehicleType, setFilterVehicleType] = useState("")
  const [filterOperator, setFilterOperator] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">("create")
  const setTitle = useUIStore((state) => state.setTitle)

  useEffect(() => {
    setTitle("Quản lý xe")
    loadVehicles()
  }, [setTitle])

  const loadVehicles = async () => {
    setIsLoading(true)
    try {
      const data = await vehicleService.getAll()
      setVehicles(data)
    } catch (error) {
      console.error("Failed to load vehicles:", error)
      toast.error("Không thể tải danh sách xe. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique vehicle types and operators for filter options
  const vehicleTypes = Array.from(
    new Set(vehicles.map(getVehicleTypeName).filter(Boolean))
  ).sort()
  const operators = Array.from(
    new Set(vehicles.map(getOperatorName).filter(Boolean))
  ).sort()

  const filteredVehicles = vehicles.filter((vehicle) => {
    const vehicleTypeName = getVehicleTypeName(vehicle)
    const operatorName = getOperatorName(vehicle)

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        vehicle.plateNumber.toLowerCase().includes(query) ||
        vehicleTypeName.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Vehicle type filter
    if (filterVehicleType && vehicleTypeName !== filterVehicleType) {
      return false
    }

    // Operator filter
    if (filterOperator && operatorName !== filterOperator) {
      return false
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
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
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
      <div className="flex items-center justify-end">
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
              <TableHead className="text-center">Biển số</TableHead>
              <TableHead className="text-center">Loại xe</TableHead>
              <TableHead className="text-center">Số ghế</TableHead>
              <TableHead className="text-center">Nhà xe</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
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
                  <TableCell className="font-medium text-center">
                    {vehicle.plateNumber}
                  </TableCell>
                  <TableCell className="text-center">{getVehicleTypeName(vehicle)}</TableCell>
                  <TableCell className="text-center">{vehicle.seatCapacity}</TableCell>
                  <TableCell className="text-center">{getOperatorName(vehicle)}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={vehicle.isActive ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
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







