import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Plus, Search, Edit, Eye, Trash2, Clock, Route as RouteIcon, X, ArrowUp, ArrowDown } from "lucide-react"
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
import { routeService } from "@/services/route.service"
import { locationService } from "@/services/location.service"
import { scheduleService } from "@/services/schedule.service"
import { operatorService } from "@/services/operator.service"
import type { Route, RouteInput, RouteStop, Location, Schedule, ScheduleInput, Operator } from "@/types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { useUIStore } from "@/store/ui.store"

const routeSchema = z.object({
  routeCode: z.string().min(1, "Mã tuyến là bắt buộc"),
  routeName: z.string().min(1, "Tên tuyến là bắt buộc"),
  originId: z.string().uuid("Vui lòng chọn điểm đi"),
  destinationId: z.string().uuid("Vui lòng chọn điểm đến"),
  distanceKm: z.number().min(0, "Khoảng cách phải lớn hơn hoặc bằng 0").optional(),
  estimatedDurationMinutes: z.number().int().min(0, "Thời gian phải lớn hơn hoặc bằng 0").optional(),
}).refine((data) => data.originId !== data.destinationId, {
  message: "Điểm đi và điểm đến phải khác nhau",
  path: ["destinationId"],
})

type RouteFormData = z.infer<typeof routeSchema>

export default function QuanLyTuyen() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOrigin, setFilterOrigin] = useState("")
  const [filterDestination, setFilterDestination] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">("create")
  const setTitle = useUIStore((state) => state.setTitle)

  useEffect(() => {
    setTitle("Quản lý tuyến xe")
    loadRoutes()
    loadLocations()
  }, [setTitle])

  const loadRoutes = async () => {
    setIsLoading(true)
    try {
      const data = await routeService.getAll()
      setRoutes(data)
    } catch (error) {
      console.error("Failed to load routes:", error)
      toast.error("Không thể tải danh sách tuyến. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadLocations = async () => {
    try {
      const data = await locationService.getAll(undefined, true)
      setLocations(data)
    } catch (error) {
      console.error("Failed to load locations:", error)
    }
  }

  const filteredRoutes = routes.filter((route) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        route.routeCode.toLowerCase().includes(query) ||
        route.routeName.toLowerCase().includes(query) ||
        route.origin?.name.toLowerCase().includes(query) ||
        route.destination?.name.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Origin filter
    if (filterOrigin && route.originId !== filterOrigin) {
      return false
    }

    // Destination filter
    if (filterDestination && route.destinationId !== filterDestination) {
      return false
    }

    // Status filter
    if (filterStatus) {
      const isActive = filterStatus === "active"
      if (route.isActive !== isActive) return false
    }

    return true
  })

  const handleCreate = () => {
    setSelectedRoute(null)
    setViewMode("create")
    setDialogOpen(true)
  }

  const handleEdit = (route: Route) => {
    setSelectedRoute(route)
    setViewMode("edit")
    setDialogOpen(true)
  }

  const handleView = (route: Route) => {
    setSelectedRoute(route)
    setViewMode("view")
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tuyến này?")) {
      try {
        await routeService.delete(id)
        toast.success("Xóa tuyến thành công")
        loadRoutes()
      } catch (error: any) {
        console.error("Failed to delete route:", error)
        toast.error(error.response?.data?.error || "Không thể xóa tuyến. Vui lòng thử lại sau.")
      }
    }
  }

  const handleToggleStatus = async (route: Route) => {
    try {
      await routeService.update(route.id, { isActive: !route.isActive } as any)
      toast.success(`Đã ${route.isActive ? "vô hiệu hóa" : "kích hoạt"} tuyến`)
      loadRoutes()
    } catch (error) {
      console.error("Failed to toggle route status:", error)
      toast.error("Không thể thay đổi trạng thái tuyến")
    }
  }

  // Get unique origins and destinations for filters
  const uniqueOrigins = Array.from(
    new Map(
      routes
        .filter((r) => r.origin)
        .map((r) => [r.origin!.id, r.origin!])
    ).values()
  )

  const uniqueDestinations = Array.from(
    new Map(
      routes
        .filter((r) => r.destination)
        .map((r) => [r.destination!.id, r.destination!])
    ).values()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tuyến xe</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin tuyến vận chuyển</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm tuyến
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã tuyến, tên tuyến, điểm đi, điểm đến..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterOrigin" className="text-sm font-medium">
                  Lọc theo điểm đi
                </Label>
                <Select
                  id="filterOrigin"
                  value={filterOrigin}
                  onChange={(e) => setFilterOrigin(e.target.value)}
                >
                  <option value="">Tất cả điểm đi</option>
                  {uniqueOrigins.map((origin) => (
                    <option key={origin.id} value={origin.id}>
                      {origin.name} ({origin.code})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterDestination" className="text-sm font-medium">
                  Lọc theo điểm đến
                </Label>
                <Select
                  id="filterDestination"
                  value={filterDestination}
                  onChange={(e) => setFilterDestination(e.target.value)}
                >
                  <option value="">Tất cả điểm đến</option>
                  {uniqueDestinations.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name} ({dest.code})
                    </option>
                  ))}
                </Select>
              </div>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Mã tuyến</TableHead>
              <TableHead className="text-center">Tên tuyến</TableHead>
              <TableHead className="text-center">Điểm đi → Điểm đến</TableHead>
              <TableHead className="text-center">Khoảng cách</TableHead>
              <TableHead className="text-center">Thời gian</TableHead>
              <TableHead className="text-center">Số điểm dừng</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium text-center">{route.routeCode}</TableCell>
                  <TableCell className="text-center">{route.routeName}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span>{route.origin?.name || "N/A"}</span>
                      <RouteIcon className="h-4 w-4 text-gray-400" />
                      <span>{route.destination?.name || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {route.distanceKm ? `${route.distanceKm} km` : "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    {route.estimatedDurationMinutes
                      ? `${route.estimatedDurationMinutes} phút`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-center">{route.stops?.length || 0}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge
                      status={route.isActive ? "active" : "inactive"}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(route)}
                        aria-label="Xem"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(route)}
                        aria-label="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(route)}
                        aria-label={route.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        title={route.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        {route.isActive ? (
                          <X className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Plus className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(route.id)}
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
              {viewMode === "create" && "Thêm tuyến mới"}
              {viewMode === "edit" && "Sửa thông tin tuyến"}
              {viewMode === "view" && "Chi tiết tuyến"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {viewMode === "view" && selectedRoute ? (
              <RouteView route={selectedRoute} />
            ) : (
              <RouteForm
                route={selectedRoute}
                locations={locations}
                mode={viewMode === "view" ? "create" : viewMode}
                onClose={() => {
                  setDialogOpen(false)
                  loadRoutes()
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RouteView({ route }: { route: Route }) {
  const [activeTab, setActiveTab] = useState("info")
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [scheduleViewMode, setScheduleViewMode] = useState<"create" | "edit">("create")
  const [operators, setOperators] = useState<Operator[]>([])

  useEffect(() => {
    if (activeTab === "schedules" && route.id) {
      loadSchedules()
      loadOperators()
    }
  }, [activeTab, route.id])

  const loadSchedules = async () => {
    setLoadingSchedules(true)
    try {
      const data = await scheduleService.getAll(route.id, undefined, undefined)
      setSchedules(data)
    } catch (error) {
      console.error("Failed to load schedules:", error)
      toast.error("Không thể tải danh sách biểu đồ giờ")
    } finally {
      setLoadingSchedules(false)
    }
  }

  const loadOperators = async () => {
    try {
      const data = await operatorService.getAll(true)
      setOperators(data)
    } catch (error) {
      console.error("Failed to load operators:", error)
    }
  }

  const handleCreateSchedule = () => {
    setSelectedSchedule(null)
    setScheduleViewMode("create")
    setScheduleDialogOpen(true)
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setScheduleViewMode("edit")
    setScheduleDialogOpen(true)
  }

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa biểu đồ giờ này?")) {
      try {
        await scheduleService.delete(id)
        toast.success("Xóa biểu đồ giờ thành công")
        loadSchedules()
      } catch (error: any) {
        console.error("Failed to delete schedule:", error)
        toast.error(error.response?.data?.error || "Không thể xóa biểu đồ giờ")
      }
    }
  }

  const handleToggleScheduleStatus = async (schedule: Schedule) => {
    try {
      await scheduleService.update(schedule.id, { isActive: !schedule.isActive } as any)
      toast.success(`Đã ${schedule.isActive ? "vô hiệu hóa" : "kích hoạt"} biểu đồ giờ`)
      loadSchedules()
    } catch (error) {
      console.error("Failed to toggle schedule status:", error)
      toast.error("Không thể thay đổi trạng thái biểu đồ giờ")
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
        <TabsTrigger value="stops">Điểm dừng</TabsTrigger>
        <TabsTrigger value="schedules">Biểu đồ giờ</TabsTrigger>
        <TabsTrigger value="stats">Thống kê</TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="space-y-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Mã tuyến</Label>
            <p className="text-lg font-medium text-gray-900">{route.routeCode}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Tên tuyến</Label>
            <p className="text-lg font-medium text-gray-900">{route.routeName}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Điểm đi</Label>
            <p className="text-lg font-medium text-gray-900">
              {route.origin?.name || "N/A"} ({route.origin?.code || "N/A"})
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Điểm đến</Label>
            <p className="text-lg font-medium text-gray-900">
              {route.destination?.name || "N/A"} ({route.destination?.code || "N/A"})
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Khoảng cách</Label>
            <p className="text-lg font-medium text-gray-900">
              {route.distanceKm ? `${route.distanceKm} km` : "N/A"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Thời gian ước tính</Label>
            <p className="text-lg font-medium text-gray-900">
              {route.estimatedDurationMinutes
                ? `${route.estimatedDurationMinutes} phút`
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Trạng thái</Label>
            <StatusBadge status={route.isActive ? "active" : "inactive"} />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="stops" className="space-y-4 mt-6">
        {route.stops && route.stops.length > 0 ? (
          <div className="space-y-3">
            {route.stops.map((stop) => (
              <Card key={stop.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {stop.stopOrder}
                      </div>
                      <div>
                        <p className="font-medium">
                          {stop.location?.name || "Điểm dừng"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {stop.location?.code || ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {stop.distanceFromOriginKm && (
                        <p>Khoảng cách: {stop.distanceFromOriginKm} km</p>
                      )}
                      {stop.estimatedMinutesFromOrigin && (
                        <p>Thời gian: {stop.estimatedMinutesFromOrigin} phút</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            Không có điểm dừng
          </p>
        )}
      </TabsContent>
      <TabsContent value="schedules" className="space-y-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-base font-semibold">Danh sách biểu đồ giờ</Label>
          <Button onClick={handleCreateSchedule} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Thêm biểu đồ giờ
          </Button>
        </div>
        {loadingSchedules ? (
          <p className="text-center py-8">Đang tải...</p>
        ) : schedules.length > 0 ? (
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{schedule.scheduleCode}</p>
                        <StatusBadge
                          status={schedule.isActive ? "active" : "inactive"}
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Giờ xuất bến: {format(new Date(`2000-01-01T${schedule.departureTime}`), "HH:mm")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Nhà xe: {schedule.operator?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tần suất: {
                            schedule.frequencyType === "daily" ? "Hàng ngày" :
                            schedule.frequencyType === "weekly" ? "Hàng tuần" :
                            schedule.frequencyType === "specific_days" ? `Thứ ${schedule.daysOfWeek?.join(", ")}` :
                            "N/A"
                          }
                        </p>
                        <p className="text-sm text-gray-600">
                          Hiệu lực từ: {format(new Date(schedule.effectiveFrom), "dd/MM/yyyy")}
                          {schedule.effectiveTo && ` đến ${format(new Date(schedule.effectiveTo), "dd/MM/yyyy")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSchedule(schedule)}
                        aria-label="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleScheduleStatus(schedule)}
                        aria-label={schedule.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        title={schedule.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        {schedule.isActive ? (
                          <X className="h-4 w-4 text-orange-600" />
                        ) : (
                          <Plus className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        aria-label="Xóa"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            Không có biểu đồ giờ. Nhấn "Thêm biểu đồ giờ" để tạo mới.
          </p>
        )}
      </TabsContent>
      <TabsContent value="stats" className="mt-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Số điểm dừng</p>
              <p className="text-2xl font-bold">{route.stops?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Số biểu đồ giờ</p>
              <p className="text-2xl font-bold">{schedules.length}</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Thống kê chi tiết sẽ được cập nhật sau
        </p>
      </TabsContent>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-3xl w-full max-h-[95vh] overflow-y-auto p-6">
          <DialogClose onClose={() => setScheduleDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {scheduleViewMode === "create" && "Thêm biểu đồ giờ mới"}
              {scheduleViewMode === "edit" && "Sửa biểu đồ giờ"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ScheduleForm
              schedule={selectedSchedule}
              routeId={route.id}
              operators={operators}
              mode={scheduleViewMode}
              onClose={() => {
                setScheduleDialogOpen(false)
                loadSchedules()
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}

function RouteForm({
  route,
  locations,
  mode,
  onClose,
}: {
  route: Route | null
  locations: Location[]
  mode: "create" | "edit"
  onClose: () => void
}) {
  const [stops, setStops] = useState<Omit<RouteStop, "id" | "routeId" | "createdAt">[]>([])
  const [selectedLocationForStop, setSelectedLocationForStop] = useState("")
  const [stopDistance, setStopDistance] = useState("")
  const [stopTime, setStopTime] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: route
      ? {
          routeCode: route.routeCode,
          routeName: route.routeName,
          originId: route.originId,
          destinationId: route.destinationId,
          distanceKm: route.distanceKm || undefined,
          estimatedDurationMinutes: route.estimatedDurationMinutes || undefined,
        }
      : undefined,
  })

  const originId = watch("originId")
  const destinationId = watch("destinationId")

  useEffect(() => {
    if (route?.stops) {
      setStops(
        route.stops.map((stop) => ({
          locationId: stop.locationId,
          stopOrder: stop.stopOrder,
          distanceFromOriginKm: stop.distanceFromOriginKm || undefined,
          estimatedMinutesFromOrigin: stop.estimatedMinutesFromOrigin || undefined,
        }))
      )
    }
  }, [route])

  const addStop = () => {
    if (!selectedLocationForStop) {
      toast.warning("Vui lòng chọn điểm dừng")
      return
    }

    if (stops.some((s) => s.locationId === selectedLocationForStop)) {
      toast.warning("Điểm dừng này đã được thêm")
      return
    }

    if (selectedLocationForStop === originId || selectedLocationForStop === destinationId) {
      toast.warning("Điểm dừng không được trùng với điểm đi hoặc điểm đến")
      return
    }

    const newStop: Omit<RouteStop, "id" | "routeId" | "createdAt"> = {
      locationId: selectedLocationForStop,
      stopOrder: stops.length + 1,
      distanceFromOriginKm: stopDistance ? parseFloat(stopDistance) : undefined,
      estimatedMinutesFromOrigin: stopTime ? parseInt(stopTime) : undefined,
    }

    setStops([...stops, newStop])
    setSelectedLocationForStop("")
    setStopDistance("")
    setStopTime("")
  }

  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index).map((stop, i) => ({
      ...stop,
      stopOrder: i + 1,
    }))
    setStops(newStops)
  }

  const moveStop = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === stops.length - 1)
    ) {
      return
    }

    const newStops = [...stops]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newStops[index], newStops[targetIndex]] = [
      newStops[targetIndex],
      newStops[index],
    ]

    // Update stop orders
    newStops.forEach((stop, i) => {
      stop.stopOrder = i + 1
    })

    setStops(newStops)
  }

  const onSubmit = async (data: RouteFormData) => {
    try {
      const routeData: RouteInput = {
        ...data,
        stops: stops.length > 0 ? stops : undefined,
      }

      if (mode === "create") {
        await routeService.create(routeData)
        toast.success("Thêm tuyến thành công")
      } else if (route) {
        await routeService.update(route.id, routeData)
        toast.success("Cập nhật tuyến thành công")
      }
      onClose()
    } catch (error: any) {
      console.error("Failed to save route:", error)
      toast.error(
        error.response?.data?.error || "Không thể lưu tuyến. Vui lòng thử lại sau."
      )
    }
  }

  // Filter locations for stops (exclude origin and destination)
  const availableLocationsForStops = locations.filter(
    (loc) => loc.id !== originId && loc.id !== destinationId
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="routeCode" className="text-base font-semibold">
            Mã tuyến *
          </Label>
          <Input
            id="routeCode"
            className="h-11"
            {...register("routeCode")}
          />
          {errors.routeCode && (
            <p className="text-sm text-red-600 mt-1">{errors.routeCode.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="routeName" className="text-base font-semibold">
            Tên tuyến *
          </Label>
          <Input
            id="routeName"
            className="h-11"
            {...register("routeName")}
          />
          {errors.routeName && (
            <p className="text-sm text-red-600 mt-1">{errors.routeName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="originId" className="text-base font-semibold">
            Điểm đi *
          </Label>
          <Select
            id="originId"
            className="h-11"
            {...register("originId")}
          >
            <option value="">Chọn điểm đi</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.code})
              </option>
            ))}
          </Select>
          {errors.originId && (
            <p className="text-sm text-red-600 mt-1">{errors.originId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="destinationId" className="text-base font-semibold">
            Điểm đến *
          </Label>
          <Select
            id="destinationId"
            className="h-11"
            {...register("destinationId")}
          >
            <option value="">Chọn điểm đến</option>
            {locations
              .filter((loc) => loc.id !== originId)
              .map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
          </Select>
          {errors.destinationId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.destinationId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="distanceKm" className="text-base font-semibold">
            Khoảng cách (km)
          </Label>
          <Input
            id="distanceKm"
            type="number"
            step="0.1"
            className="h-11"
            {...register("distanceKm", { valueAsNumber: true })}
          />
          {errors.distanceKm && (
            <p className="text-sm text-red-600 mt-1">{errors.distanceKm.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDurationMinutes" className="text-base font-semibold">
            Thời gian ước tính (phút)
          </Label>
          <Input
            id="estimatedDurationMinutes"
            type="number"
            className="h-11"
            {...register("estimatedDurationMinutes", { valueAsNumber: true })}
          />
          {errors.estimatedDurationMinutes && (
            <p className="text-sm text-red-600 mt-1">
              {errors.estimatedDurationMinutes.message}
            </p>
          )}
        </div>
      </div>

      {/* Stops Management */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Quản lý điểm dừng</Label>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Select
            value={selectedLocationForStop}
            onChange={(e) => setSelectedLocationForStop(e.target.value)}
          >
            <option value="">Chọn điểm dừng</option>
            {availableLocationsForStops
              .filter((loc) => !stops.some((s) => s.locationId === loc.id))
              .map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
          </Select>
          <Input
            type="number"
            step="0.1"
            placeholder="Khoảng cách (km)"
            value={stopDistance}
            onChange={(e) => setStopDistance(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Thời gian (phút)"
            value={stopTime}
            onChange={(e) => setStopTime(e.target.value)}
          />
          <Button type="button" onClick={addStop} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Thêm
          </Button>
        </div>

        {stops.length > 0 && (
          <div className="space-y-2 mt-4">
            {stops.map((stop, index) => {
              const location = locations.find((l) => l.id === stop.locationId)
              return (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => moveStop(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => moveStop(index, "down")}
                            disabled={index === stops.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                          {stop.stopOrder}
                        </div>
                        <div>
                          <p className="font-medium">{location?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">
                            {stop.distanceFromOriginKm && `${stop.distanceFromOriginKm} km`}
                            {stop.distanceFromOriginKm && stop.estimatedMinutesFromOrigin && " • "}
                            {stop.estimatedMinutesFromOrigin && `${stop.estimatedMinutesFromOrigin} phút`}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStop(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
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
  )
}

function ScheduleForm({
  schedule,
  routeId,
  operators,
  mode,
  onClose,
}: {
  schedule: Schedule | null
  routeId: string
  operators: Operator[]
  mode: "create" | "edit"
  onClose: () => void
}) {
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  const scheduleSchema = z.object({
    scheduleCode: z.string().optional(), // Optional - will be auto-generated by backend
    operatorId: z.string().uuid("Vui lòng chọn nhà xe"),
    departureTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ (HH:MM)"),
    frequencyType: z.enum(['daily', 'weekly', 'specific_days']),
    daysOfWeek: z.array(z.number().int().min(1).max(7)).optional(),
    effectiveFrom: z.string().min(1, "Ngày hiệu lực từ là bắt buộc"),
    effectiveTo: z.string().optional(),
  }).refine((data) => {
    if (data.frequencyType === 'specific_days') {
      return data.daysOfWeek && data.daysOfWeek.length > 0
    }
    return true
  }, {
    message: "Vui lòng chọn ít nhất một ngày trong tuần",
    path: ["daysOfWeek"],
  })

  type ScheduleFormData = z.infer<typeof scheduleSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: schedule
      ? {
          scheduleCode: schedule.scheduleCode,
          operatorId: schedule.operatorId,
          departureTime: schedule.departureTime,
          frequencyType: schedule.frequencyType,
          daysOfWeek: schedule.daysOfWeek || [],
          effectiveFrom: schedule.effectiveFrom ? new Date(schedule.effectiveFrom).toISOString().split("T")[0] : "",
          effectiveTo: schedule.effectiveTo ? new Date(schedule.effectiveTo).toISOString().split("T")[0] : "",
        }
      : {
          frequencyType: 'daily',
          effectiveFrom: new Date().toISOString().split("T")[0],
        },
  })

  useEffect(() => {
    if (schedule) {
      setSelectedDays(schedule.daysOfWeek || [])
    }
  }, [schedule])

  const currentFrequencyType = watch("frequencyType")

  useEffect(() => {
    if (currentFrequencyType !== 'specific_days') {
      setSelectedDays([])
      setValue("daysOfWeek", [])
    }
  }, [currentFrequencyType, setValue])

  const toggleDay = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day].sort()
    setSelectedDays(newDays)
    setValue("daysOfWeek", newDays)
  }

  const dayLabels: Record<number, string> = {
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7",
    7: "Chủ nhật",
  }

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      const scheduleData: ScheduleInput = {
        scheduleCode: data.scheduleCode || undefined, // Will be auto-generated if not provided
        routeId: routeId,
        operatorId: data.operatorId,
        departureTime: data.departureTime,
        frequencyType: data.frequencyType,
        daysOfWeek: data.frequencyType === 'specific_days' ? data.daysOfWeek : undefined,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo || undefined,
      }

      if (mode === "create") {
        await scheduleService.create(scheduleData)
        toast.success("Thêm biểu đồ giờ thành công")
      } else if (schedule) {
        await scheduleService.update(schedule.id, scheduleData)
        toast.success("Cập nhật biểu đồ giờ thành công")
      }
      onClose()
    } catch (error: any) {
      console.error("Failed to save schedule:", error)
      toast.error(
        error.response?.data?.error || "Không thể lưu biểu đồ giờ. Vui lòng thử lại sau."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {mode === "edit" && schedule?.scheduleCode && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Label className="text-sm font-semibold text-blue-900">Mã biểu đồ giờ</Label>
          <p className="text-lg font-mono text-blue-700 mt-1">{schedule.scheduleCode}</p>
          <p className="text-xs text-blue-600 mt-1">Mã được tạo tự động bởi hệ thống</p>
        </div>
      )}
      {mode === "create" && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Lưu ý:</span> Mã biểu đồ giờ sẽ được tạo tự động sau khi lưu.
            Định dạng: BDG-{'{'}Mã tuyến{'}'}-{'{'}Mã nhà xe{'}'}-{'{'}Giờ xuất bến{'}'}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="operatorId" className="text-base font-semibold">
            Nhà xe *
          </Label>
          <Select
            id="operatorId"
            className="h-11"
            {...register("operatorId")}
          >
            <option value="">Chọn nhà xe</option>
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name} ({op.code})
              </option>
            ))}
          </Select>
          {errors.operatorId && (
            <p className="text-sm text-red-600 mt-1">{errors.operatorId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureTime" className="text-base font-semibold">
            Giờ xuất bến (HH:MM) *
          </Label>
          <Input
            id="departureTime"
            type="time"
            lang="en-GB"
            className="h-11"
            {...register("departureTime")}
          />
          {errors.departureTime && (
            <p className="text-sm text-red-600 mt-1">{errors.departureTime.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequencyType" className="text-base font-semibold">
            Tần suất *
          </Label>
          <Select
            id="frequencyType"
            className="h-11"
            {...register("frequencyType")}
          >
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="specific_days">Ngày cụ thể trong tuần</option>
          </Select>
          {errors.frequencyType && (
            <p className="text-sm text-red-600 mt-1">{errors.frequencyType.message}</p>
          )}
        </div>
        {currentFrequencyType === 'specific_days' && (
          <div className="space-y-2 col-span-2">
            <Label className="text-base font-semibold">Chọn ngày trong tuần *</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={selectedDays.includes(day) ? "default" : "outline"}
                  onClick={() => toggleDay(day)}
                  className="min-w-[100px]"
                >
                  {dayLabels[day]}
                </Button>
              ))}
            </div>
            {errors.daysOfWeek && (
              <p className="text-sm text-red-600 mt-1">{errors.daysOfWeek.message}</p>
            )}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="effectiveFrom" className="text-base font-semibold">
            Hiệu lực từ *
          </Label>
          <Input
            id="effectiveFrom"
            type="date"
            className="h-11"
            {...register("effectiveFrom")}
          />
          {errors.effectiveFrom && (
            <p className="text-sm text-red-600 mt-1">{errors.effectiveFrom.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="effectiveTo" className="text-base font-semibold">
            Hiệu lực đến
          </Label>
          <Input
            id="effectiveTo"
            type="date"
            className="h-11"
            {...register("effectiveTo")}
          />
          {errors.effectiveTo && (
            <p className="text-sm text-red-600 mt-1">{errors.effectiveTo.message}</p>
          )}
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
  )
}

