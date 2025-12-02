import { useState, useEffect } from "react"
import { Search, FileCheck, CreditCard, LogOut, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import { useDispatchStore } from "@/store/dispatch.store"
import { dispatchService } from "@/services/dispatch.service"
import type { DispatchRecord, DispatchStatus } from "@/types"
import { format } from "date-fns"
import { mockDispatchRecords } from "@/mocks/dispatch.mock"
import { mockVehicles } from "@/mocks/vehicles.mock"
import { mockDrivers } from "@/mocks/drivers.mock"

// Transform vehicles and drivers for select options
const vehicleOptions = mockVehicles.map((v) => ({
  id: v.id,
  plateNumber: v.plateNumber,
}))

const driverOptions = mockDrivers.map((d) => ({
  id: d.id,
  name: d.fullName,
}))

export default function Dispatch() {
  const { records, setRecords, activeTab, setActiveTab } = useDispatchStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DispatchRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<
    "entry" | "return" | "permit" | "payment" | "depart"
  >("entry")

  useEffect(() => {
    loadRecords()
  }, [activeTab])

  const loadRecords = async () => {
    setIsLoading(true)
    try {
      // Use mock data - replace with actual API call when backend is ready
      // const data = await dispatchService.getAll(activeTab === 'all' ? undefined : activeTab)
      // setRecords(data)
      
      // Filter by active tab
      let filtered = mockDispatchRecords
      if (activeTab !== "all") {
        filtered = mockDispatchRecords.filter((r) => r.status === activeTab)
      }
      setRecords(filtered)
    } catch (error) {
      console.error("Failed to load records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRecords = records.filter((record) => {
    if (activeTab !== "all" && record.status !== activeTab) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        record.vehiclePlateNumber.toLowerCase().includes(query) ||
        record.route.toLowerCase().includes(query) ||
        record.driverName.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleAction = (record: DispatchRecord, type: typeof dialogType) => {
    setSelectedRecord(record)
    setDialogType(type)
    setDialogOpen(true)
  }

  const getActionButton = (record: DispatchRecord, status: DispatchStatus): JSX.Element | null => {
    switch (status) {
      case "in-station":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction(record, "permit")}
          >
            <FileCheck className="mr-2 h-4 w-4" />
            Cấp phép
          </Button>
        )
      case "permit-issued":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction(record, "payment")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Thanh toán
          </Button>
        )
      case "paid":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction(record, "depart")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Xuất bến
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Điều độ xe</h1>
          <p className="text-gray-600 mt-1">
            Quản lý quy trình xe ra vào bến
          </p>
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo biển số, tuyến đường, lái xe..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DispatchStatus | "all")}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="in-station">Trong bến</TabsTrigger>
          <TabsTrigger value="permit-issued">Đã cấp nốt</TabsTrigger>
          <TabsTrigger value="paid">Đã thanh toán</TabsTrigger>
          <TabsTrigger value="departed">Đã xuất bến</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead>Lái xe</TableHead>
                  <TableHead>Giờ vào</TableHead>
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
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.vehiclePlateNumber}
                      </TableCell>
                      <TableCell>{record.route}</TableCell>
                      <TableCell>{record.driverName}</TableCell>
                      <TableCell>
                        {format(new Date(record.entryTime), "HH:mm dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={record.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionButton(record, record.status)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>
              {dialogType === "entry" && "Cho xe vào bến"}
              {dialogType === "permit" && "Cấp phép lên nốt"}
              {dialogType === "payment" && "Thanh toán"}
              {dialogType === "depart" && "Xuất bến"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogType === "entry" && <EntryForm onClose={() => setDialogOpen(false)} />}
            {dialogType === "permit" && selectedRecord && (
              <PermitForm record={selectedRecord} onClose={() => setDialogOpen(false)} />
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
function EntryForm({ onClose }: { onClose: () => void }) {
  const [vehicleId, setVehicleId] = useState("")
  const [entryTime, setEntryTime] = useState(new Date().toISOString().slice(0, 16))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle submit
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="vehicle">Biển số xe *</Label>
          <Select 
            id="vehicle" 
            value={vehicleId} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVehicleId(e.target.value)}
            className="mt-1"
          >
            <option value="">Chọn xe</option>
            {vehicleOptions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plateNumber}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="entryTime">Giờ vào *</Label>
          <Input
            id="entryTime"
            type="datetime-local"
            value={entryTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntryTime(e.target.value)}
            className="mt-1"
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit">Xác nhận</Button>
      </div>
    </form>
  )
}

function PermitForm({ record, onClose }: { record: DispatchRecord; onClose: () => void }) {
  const [permitNumber, setPermitNumber] = useState("")
  const [departureTime, setDepartureTime] = useState("")
  const [seatCount, setSeatCount] = useState("")

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
            <Label htmlFor="permitNumber">Mã vận lệnh *</Label>
            <Input
              id="permitNumber"
              value={permitNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermitNumber(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="seatCount">Số ghế *</Label>
            <Input
              id="seatCount"
              type="number"
              value={seatCount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeatCount(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="departureTime">Giờ xuất phát *</Label>
          <Input
            id="departureTime"
            type="datetime-local"
            value={departureTime}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartureTime(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium mb-3 text-gray-900">Trạng thái giấy tờ:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <span className="text-gray-700">Đăng kiểm</span>
              <span className="text-success font-medium">✓ Hợp lệ</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <span className="text-gray-700">Bảo hiểm</span>
              <span className="text-success font-medium">✓ Hợp lệ</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded">
              <span className="text-gray-700">Bằng lái</span>
              <span className="text-success font-medium">✓ Hợp lệ</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit">Cấp phép</Button>
      </div>
    </form>
  )
}

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

