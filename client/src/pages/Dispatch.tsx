import { useState, useEffect } from "react"
import {
  Search,
  FileCheck,
  Plus,
  Bus,
  Clock,
  MapPin,
  FileText,
  Calendar,
  User,
  Upload,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useDispatchStore } from "@/store/dispatch.store"
import { dispatchService } from "@/services/dispatch.service"
import { vehicleService } from "@/services/vehicle.service"
import { VehicleEntryDialog } from "@/components/dispatch/VehicleEntryDialog"
import { PassengerDropDialog } from "@/components/dispatch/PassengerDropDialog"
import { PermitDialog } from "@/components/dispatch/PermitDialog"
import type { DispatchRecord, DispatchStatus, Vehicle } from "@/types"
import { format } from "date-fns"

// Display status type for UI tabs (different from backend status)
type DisplayStatus = "in-station" | "permit-issued" | "paid" | "departed"

export default function Dispatch() {
  const { records, setRecords } = useDispatchStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedRecord, setSelectedRecord] = useState<DispatchRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<
    "entry" | "return" | "permit" | "payment" | "depart"
  >("entry")

  useEffect(() => {
    loadVehicles()
    loadRecords()
  }, [])

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll()
      setVehicles(data)
    } catch (error) {
      console.error("Failed to load vehicles:", error)
    }
  }

  const loadRecords = async () => {
    setIsLoading(true)
    try {
      const data = await dispatchService.getAll()
      setRecords(data)
    } catch (error) {
      console.error("Failed to load records:", error)
      alert("Không thể tải danh sách điều độ. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to map backend status to frontend display status
  const getDisplayStatus = (currentStatus: DispatchStatus): DisplayStatus => {
    const statusMap: Record<DispatchStatus, DisplayStatus> = {
      'entered': 'in-station',
      'passengers_dropped': 'in-station',
      'permit_issued': 'permit-issued',
      'permit_rejected': 'in-station',
      'paid': 'paid',
      'departure_ordered': 'departed',
      'departed': 'departed',
    }
    return statusMap[currentStatus] || 'in-station'
  }

  // Get records for each column
  const getRecordsByStatus = (status: DisplayStatus) => {
    return records.filter((record) => {
      const displayStatus = getDisplayStatus(record.currentStatus)
      if (status === 'in-station') {
        return displayStatus === 'in-station'
      }
      if (status === 'permit-issued') {
        return displayStatus === 'permit-issued'
      }
      if (status === 'paid') {
        return displayStatus === 'paid'
      }
      if (status === 'departed') {
        return displayStatus === 'departed'
      }
      return false
    }).filter((record) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          record.vehiclePlateNumber.toLowerCase().includes(query) ||
          (record.routeName || '').toLowerCase().includes(query) ||
          record.driverName.toLowerCase().includes(query)
        )
      }
      return true
    })
  }

  // Calculate statistics from actual records
  const stats = {
    "in-station": getRecordsByStatus("in-station").length,
    "permit-issued": getRecordsByStatus("permit-issued").length,
    "paid": getRecordsByStatus("paid").length,
    "departed": getRecordsByStatus("departed").length,
  }

  // Transform vehicles for select options
  const vehicleOptions = vehicles.map((v) => ({
    id: v.id,
    plateNumber: v.plateNumber,
  }))

  const handleAction = (record: DispatchRecord, type: typeof dialogType) => {
    setSelectedRecord(record)
    setDialogType(type)
    setDialogOpen(true)
  }

  const getActionButtons = (record: DispatchRecord, status: DisplayStatus) => {
    const buttons = []
    
    if (status === "in-station") {
      buttons.push(
        <button
          key="return"
          onClick={(e) => {
            e.stopPropagation()
            handleAction(record, "return")
          }}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Xác nhận trả khách"
        >
          <User className="h-4 w-4 text-gray-600" />
        </button>
      )
      buttons.push(
        <button
          key="permit"
          onClick={(e) => {
            e.stopPropagation()
            handleAction(record, "permit")
          }}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Cấp phép"
        >
          <FileCheck className="h-4 w-4 text-gray-600" />
        </button>
      )
      buttons.push(
        <button
          key="upload"
          onClick={(e) => e.stopPropagation()}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Tải lên"
        >
          <Upload className="h-4 w-4 text-gray-600" />
        </button>
      )
    } else if (status === "permit-issued") {
      buttons.push(
        <button
          key="document"
          onClick={(e) => e.stopPropagation()}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Xem tài liệu"
        >
          <FileText className="h-4 w-4 text-gray-600" />
        </button>
      )
      buttons.push(
        <button
          key="upload"
          onClick={(e) => e.stopPropagation()}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Tải lên"
        >
          <Upload className="h-4 w-4 text-gray-600" />
        </button>
      )
    } else if (status === "paid" || status === "departed") {
      buttons.push(
        <button
          key="upload"
          onClick={(e) => e.stopPropagation()}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Tải lên"
        >
          <Upload className="h-4 w-4 text-gray-600" />
        </button>
      )
    }

    return buttons
  }

  const renderVehicleCard = (record: DispatchRecord, status: DisplayStatus) => {
    const getBusIconColor = () => {
      switch (status) {
        case "in-station":
          return "text-gray-600"
        case "permit-issued":
          return "text-green-600"
        case "paid":
          return "text-orange-600"
        case "departed":
          return "text-green-600"
        default:
          return "text-gray-600"
      }
    }

    return (
      <Card
        key={record.id}
        className="mb-3 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => {
          if (status === "in-station") {
            handleAction(record, "permit")
          } else if (status === "permit-issued") {
            handleAction(record, "payment")
          } else if (status === "paid") {
            handleAction(record, "depart")
          }
        }}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header with bus icon and plate number */}
            <div className="flex items-center gap-2">
              <Bus className={`h-5 w-5 ${getBusIconColor()}`} />
              <span className="font-semibold text-gray-900">{record.vehiclePlateNumber}</span>
            </div>

            {/* Entry time */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(record.entryTime), "HH:mm dd/MM/yyyy")}</span>
            </div>

            {/* Route */}
            {record.routeName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{record.routeName}</span>
              </div>
            )}

            {/* Seat count / Passengers */}
            {(record.seatCount || record.passengersArrived) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{record.seatCount || record.passengersArrived || '-'}</span>
              </div>
            )}

            {/* Departure time */}
            {record.plannedDepartureTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(record.plannedDepartureTime), "HH:mm dd/MM/yyyy")}</span>
              </div>
            )}

            {/* Driver name */}
            {record.driverName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="truncate">{record.driverName}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-1 pt-2 border-t">
              {getActionButtons(record, status)}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Điều độ xe</h1>
        </div>
        <Button onClick={() => {
          setDialogType("entry")
          setSelectedRecord(null)
          setDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Cho xe vào bến
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select className="w-48">
          <option value="">Loại cấp nốt</option>
        </Select>
        <Button variant="outline" size="icon" onClick={loadRecords}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Column 1: Trong bến */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Danh sách xe trong bến ({stats["in-station"]})
            </h2>
            <Button variant="ghost" size="icon" onClick={loadRecords}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : getRecordsByStatus("in-station").length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
            ) : (
              getRecordsByStatus("in-station").map((record) =>
                renderVehicleCard(record, "in-station")
              )
            )}
          </div>
        </div>

        {/* Column 2: Đã cấp nốt */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Danh sách xe đã cấp nốt ({stats["permit-issued"]})
            </h2>
            <Button variant="ghost" size="icon" onClick={loadRecords}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : getRecordsByStatus("permit-issued").length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
            ) : (
              getRecordsByStatus("permit-issued").map((record) =>
                renderVehicleCard(record, "permit-issued")
              )
            )}
          </div>
        </div>

        {/* Column 3: Đã thanh toán */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Danh sách xe đã thanh toán ({stats["paid"]})
            </h2>
            <Button variant="ghost" size="icon" onClick={loadRecords}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : getRecordsByStatus("paid").length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
            ) : (
              getRecordsByStatus("paid").map((record) =>
                renderVehicleCard(record, "paid")
              )
            )}
          </div>
        </div>

        {/* Column 4: Đã cấp lệnh xuất bến */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Danh sách xe đã cấp lệnh xuất bến ({stats["departed"]})
            </h2>
            <Button variant="ghost" size="icon" onClick={loadRecords}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : getRecordsByStatus("departed").length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
            ) : (
              getRecordsByStatus("departed").map((record) =>
                renderVehicleCard(record, "departed")
              )
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={`max-h-[90vh] overflow-y-auto ${
          dialogType === "permit" ? "max-w-6xl" : "max-w-3xl"
        }`}>
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>
              {dialogType === "entry" && "Cho xe vào bến"}
              {dialogType === "return" && "Xác nhận trả khách"}
              {dialogType === "permit" && "Cấp phép lên nốt"}
              {dialogType === "payment" && "Thanh toán"}
              {dialogType === "depart" && "Xuất bến"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogType === "entry" && (
              <VehicleEntryDialog
                vehicleOptions={vehicleOptions}
                onClose={() => setDialogOpen(false)}
                onSuccess={() => {
                  loadRecords()
                }}
              />
            )}
            {dialogType === "return" && selectedRecord && (
              <PassengerDropDialog
                record={selectedRecord}
                onClose={() => setDialogOpen(false)}
                onSuccess={() => {
                  loadRecords()
                }}
              />
            )}
            {dialogType === "permit" && selectedRecord && (
              <PermitDialog
                record={selectedRecord}
                onClose={() => setDialogOpen(false)}
                onSuccess={() => {
                  loadRecords()
                }}
              />
            )}
            {dialogType === "payment" && selectedRecord && (
              <PaymentForm record={selectedRecord} onClose={() => setDialogOpen(false)} />
            )}
            {dialogType === "depart" && selectedRecord && (
              <DepartForm record={selectedRecord} onClose={() => setDialogOpen(false)} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Form components
function PaymentForm({ record, onClose }: { record: DispatchRecord; onClose: () => void }) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle submit
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <Label className="text-sm font-medium text-gray-600">Biển số xe</Label>
          <p className="text-lg font-semibold text-gray-900 mt-1">{record.vehiclePlateNumber}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <p className="text-sm font-medium text-gray-700 mb-4">Chi tiết thanh toán:</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Phí vào bến</span>
              <span className="font-medium text-gray-900">50,000 đ</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">Phí dịch vụ</span>
              <span className="font-medium text-gray-900">100,000 đ</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
              <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
              <span className="text-lg font-bold text-primary">150,000 đ</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit">Xác nhận thanh toán</Button>
      </div>
    </form>
  )
}

function DepartForm({ record, onClose }: { record: DispatchRecord; onClose: () => void }) {
  const [exitTime, setExitTime] = useState(new Date().toISOString().slice(0, 16))
  const [passengerCount, setPassengerCount] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle submit
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <Label className="text-sm font-medium text-gray-600">Biển số xe</Label>
          <p className="text-lg font-semibold text-gray-900 mt-1">{record.vehiclePlateNumber}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="exitTime">Giờ xuất bến *</Label>
            <Input
              id="exitTime"
              type="datetime-local"
              value={exitTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExitTime(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="passengerCount">Số khách xuất bến *</Label>
            <Input
              id="passengerCount"
              type="number"
              value={passengerCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassengerCount(e.target.value)}
              required
              className="mt-1"
              min="0"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit">Xác nhận xuất bến</Button>
      </div>
    </form>
  )
}

