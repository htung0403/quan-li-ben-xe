import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Plus, Search, Edit, Eye, Trash2, X } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { StatusBadge } from "@/components/layout/StatusBadge"
import { serviceService } from "@/services/service.service"
import type { Service, ServiceInput } from "@/types"
import { useUIStore } from "@/store/ui.store"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const serviceSchema = z.object({
  code: z.string().min(1, "Mã dịch vụ là bắt buộc"),
  name: z.string().min(1, "Tên dịch vụ là bắt buộc"),
  unit: z.string().min(1, "Đơn vị tính là bắt buộc"),
  taxPercentage: z.number().min(0, "Phần trăm thuế phải >= 0").max(100, "Phần trăm thuế phải <= 100"),
  materialType: z.string().min(1, "Loại vật tư/hàng hóa là bắt buộc"),
  useQuantityFormula: z.boolean().default(false),
  usePriceFormula: z.boolean().default(false),
  displayOrder: z.number().min(0, "Thứ tự hiển thị phải >= 0"),
  isDefault: z.boolean().default(false),
  autoCalculateQuantity: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

type ServiceFormData = z.infer<typeof serviceSchema>

const MATERIAL_TYPES = ["Vật tư", "Hàng hóa", "Dịch vụ"]

export default function QuanLyDichVu() {
  const [services, setServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">("create")
  const setTitle = useUIStore((state) => state.setTitle)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      useQuantityFormula: false,
      usePriceFormula: false,
      displayOrder: 0,
      isDefault: false,
      autoCalculateQuantity: false,
      isActive: true,
      taxPercentage: 0,
    },
  })

  useEffect(() => {
    setTitle("Quản lý dịch vụ")
    loadServices()
  }, [setTitle])

  useEffect(() => {
    if (selectedService && (viewMode === "edit" || viewMode === "view")) {
      reset({
        code: selectedService.code,
        name: selectedService.name,
        unit: selectedService.unit,
        taxPercentage: selectedService.taxPercentage,
        materialType: selectedService.materialType,
        useQuantityFormula: selectedService.useQuantityFormula,
        usePriceFormula: selectedService.usePriceFormula,
        displayOrder: selectedService.displayOrder,
        isDefault: selectedService.isDefault,
        autoCalculateQuantity: selectedService.autoCalculateQuantity,
        isActive: selectedService.isActive,
      })
    } else {
      reset({
        code: "",
        name: "",
        unit: "",
        taxPercentage: 0,
        materialType: "",
        useQuantityFormula: false,
        usePriceFormula: false,
        displayOrder: 0,
        isDefault: false,
        autoCalculateQuantity: false,
        isActive: true,
      })
    }
  }, [selectedService, viewMode, reset])

  const loadServices = async () => {
    setIsLoading(true)
    try {
      const data = await serviceService.getAll()
      setServices(data)
    } catch (error) {
      console.error("Failed to load services:", error)
      toast.error("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredServices = services.filter((service) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        service.code.toLowerCase().includes(query) ||
        service.name.toLowerCase().includes(query) ||
        service.unit.toLowerCase().includes(query) ||
        service.materialType.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Status filter
    if (filterStatus) {
      const isActive = filterStatus === "active"
      if (service.isActive !== isActive) return false
    }

    return true
  })

  const handleCreate = () => {
    setSelectedService(null)
    setViewMode("create")
    setDialogOpen(true)
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setViewMode("edit")
    setDialogOpen(true)
  }

  const handleView = (service: Service) => {
    setSelectedService(service)
    setViewMode("view")
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      try {
        await serviceService.delete(id)
        toast.success("Xóa dịch vụ thành công")
        loadServices()
      } catch (error: any) {
        console.error("Failed to delete service:", error)
        toast.error(error.response?.data?.error || "Không thể xóa dịch vụ. Vui lòng thử lại sau.")
      }
    }
  }

  const handleToggleStatus = async (service: Service) => {
    try {
      await serviceService.update(service.id, { isActive: !service.isActive } as any)
      toast.success(`Đã ${service.isActive ? "vô hiệu hóa" : "kích hoạt"} dịch vụ`)
      loadServices()
    } catch (error) {
      console.error("Failed to toggle service status:", error)
      toast.error("Không thể thay đổi trạng thái dịch vụ")
    }
  }

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const serviceData: ServiceInput & { isActive?: boolean } = {
        code: data.code,
        name: data.name,
        unit: data.unit,
        taxPercentage: data.taxPercentage,
        materialType: data.materialType,
        useQuantityFormula: data.useQuantityFormula,
        usePriceFormula: data.usePriceFormula,
        displayOrder: data.displayOrder,
        isDefault: data.isDefault,
        autoCalculateQuantity: data.autoCalculateQuantity,
      }

      if (viewMode === "create") {
        // For create, include isActive in the data
        await serviceService.create({ ...serviceData, isActive: data.isActive } as any)
        toast.success("Thêm dịch vụ thành công")
      } else if (viewMode === "edit" && selectedService) {
        // For update, include isActive
        await serviceService.update(selectedService.id, { ...serviceData, isActive: data.isActive } as any)
        toast.success("Cập nhật dịch vụ thành công")
      }
      setDialogOpen(false)
      loadServices()
    } catch (error: any) {
      console.error("Failed to save service:", error)
      toast.error(
        error.response?.data?.message ||
          `Không thể ${viewMode === "create" ? "thêm" : "cập nhật"} dịch vụ. Vui lòng thử lại.`
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý dịch vụ</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin dịch vụ</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm dịch vụ
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã dịch vụ, tên dịch vụ, đơn vị tính..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterStatus" className="text-sm font-medium">
                  Lọc theo trạng thái
                </Label>
                <Select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center sticky left-0 bg-white z-10">Mã dịch vụ</TableHead>
                <TableHead className="text-center">Tên dịch vụ</TableHead>
                <TableHead className="text-center">Đơn vị tính</TableHead>
                <TableHead className="text-center">Phần trăm thuế</TableHead>
                <TableHead className="text-center">Loại vật tư/hàng hóa</TableHead>
                <TableHead className="text-center">Sử dụng công thức tính số lượng</TableHead>
                <TableHead className="text-center">Sử dụng công thức tính đơn giá</TableHead>
                <TableHead className="text-center">Thứ tự hiển thị</TableHead>
                <TableHead className="text-center">Mặc định chọn</TableHead>
                <TableHead className="text-center">Tự động tính số lượng</TableHead>
                <TableHead className="text-center sticky right-0 bg-white z-10">Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium text-center sticky left-0 bg-white z-10">
                      {service.code}
                    </TableCell>
                    <TableCell className="text-center">{service.name}</TableCell>
                    <TableCell className="text-center">{service.unit}</TableCell>
                    <TableCell className="text-center">{service.taxPercentage}%</TableCell>
                    <TableCell className="text-center">{service.materialType}</TableCell>
                    <TableCell className="text-center">
                      {service.useQuantityFormula ? "✓" : "✗"}
                    </TableCell>
                    <TableCell className="text-center">
                      {service.usePriceFormula ? "✓" : "✗"}
                    </TableCell>
                    <TableCell className="text-center">{service.displayOrder}</TableCell>
                    <TableCell className="text-center">
                      {service.isDefault ? "✓" : "✗"}
                    </TableCell>
                    <TableCell className="text-center">
                      {service.autoCalculateQuantity ? "✓" : "✗"}
                    </TableCell>
                    <TableCell className="text-center sticky right-0 bg-white z-10">
                      <StatusBadge
                        status={service.isActive ? "active" : "inactive"}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(service)}
                          aria-label="Xem"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(service)}
                          aria-label="Sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(service)}
                          aria-label={service.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          title={service.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {service.isActive ? (
                            <X className="h-4 w-4 text-orange-600" />
                          ) : (
                            <Plus className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(service.id)}
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
        </div>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[900px] max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {viewMode === "create" && "Thêm dịch vụ mới"}
              {viewMode === "edit" && "Sửa thông tin dịch vụ"}
              {viewMode === "view" && "Chi tiết dịch vụ"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 sm:space-y-6">
            {/* Thông tin chung */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
                Thông tin chung
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">
                    Mã dịch vụ <span className="text-red-500">(*)</span>
                  </Label>
                  <Input
                    id="code"
                    placeholder="Mã dịch vụ"
                    {...register("code")}
                    disabled={viewMode === "view"}
                    className={errors.code ? "border-red-500" : ""}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">
                    Tên dịch vụ <span className="text-red-500">(*)</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Tên dịch vụ"
                    {...register("name")}
                    disabled={viewMode === "view"}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit">
                    Đơn vị tính <span className="text-red-500">(*)</span>
                  </Label>
                  <Input
                    id="unit"
                    placeholder="Đơn vị tính"
                    {...register("unit")}
                    disabled={viewMode === "view"}
                    className={errors.unit ? "border-red-500" : ""}
                  />
                  {errors.unit && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.unit.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="taxPercentage">
                    Phần trăm thuế (%) <span className="text-red-500">(*)</span>
                  </Label>
                  <Input
                    id="taxPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0"
                    {...register("taxPercentage", { valueAsNumber: true })}
                    disabled={viewMode === "view"}
                    className={errors.taxPercentage ? "border-red-500" : ""}
                  />
                  {errors.taxPercentage && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.taxPercentage.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="materialType">
                    Loại vật tư/hàng hóa <span className="text-red-500">(*)</span>
                  </Label>
                  <Select
                    id="materialType"
                    {...register("materialType")}
                    disabled={viewMode === "view"}
                    className={errors.materialType ? "border-red-500" : ""}
                  >
                    <option value="">Chọn loại</option>
                    {MATERIAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                  {errors.materialType && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.materialType.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="displayOrder">
                    Thứ tự hiển thị <span className="text-red-500">(*)</span>
                  </Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("displayOrder", { valueAsNumber: true })}
                    disabled={viewMode === "view"}
                    className={errors.displayOrder ? "border-red-500" : ""}
                  />
                  {errors.displayOrder && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.displayOrder.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cài đặt */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
                Cài đặt
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useQuantityFormula"
                    {...register("useQuantityFormula")}
                    disabled={viewMode === "view"}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="useQuantityFormula" className="cursor-pointer">
                    Sử dụng công thức tính số lượng
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="usePriceFormula"
                    {...register("usePriceFormula")}
                    disabled={viewMode === "view"}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="usePriceFormula" className="cursor-pointer">
                    Sử dụng công thức tính đơn giá
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    {...register("isDefault")}
                    disabled={viewMode === "view"}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Mặc định chọn
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoCalculateQuantity"
                    {...register("autoCalculateQuantity")}
                    disabled={viewMode === "view"}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="autoCalculateQuantity" className="cursor-pointer">
                    Tự động tính số lượng
                  </Label>
                </div>

                {viewMode !== "view" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register("isActive")}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Kích hoạt
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {viewMode === "view" && selectedService && (
              <div>
                <Label>Trạng thái</Label>
                <div className="mt-2">
                  <StatusBadge
                    status={selectedService.isActive ? "active" : "inactive"}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                {viewMode === "view" ? "Đóng" : "Hủy"}
              </Button>
              {viewMode !== "view" && (
                <Button type="submit" className="w-full sm:w-auto">
                  {viewMode === "create" ? "Thêm" : "Cập nhật"}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

