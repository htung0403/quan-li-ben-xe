import { useState, useEffect } from "react"
import { Plus, Pencil, Calendar, Home, Globe, AlertTriangle, MapPin, ChevronRight, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { routeService } from "@/services/route.service"
import { scheduleService } from "@/services/schedule.service"
import { dispatchService } from "@/services/dispatch.service"
import { vehicleService } from "@/services/vehicle.service"
import { driverService } from "@/services/driver.service"
import { serviceChargeService } from "@/services/service-charge.service"
import { DocumentValidityDialog } from "./DocumentValidityDialog"
import { NotEligibleReasonDialog } from "./NotEligibleReasonDialog"
import type { DispatchRecord, Route, Schedule, Vehicle, Driver, ServiceCharge } from "@/types"
import { format } from "date-fns"

interface PermitDialogProps {
  record: DispatchRecord
  onClose: () => void
  onSuccess?: () => void
}

export function PermitDialog({ 
  record, 
  onClose,
  onSuccess 
}: PermitDialogProps) {
  const [permitType, setPermitType] = useState("fixed") // "fixed" | "temporary"
  const [transportOrderCode, setTransportOrderCode] = useState(record.transportOrderCode || "")
  const [replacementVehicleId, setReplacementVehicleId] = useState("")
  const [seatCount, setSeatCount] = useState(record.seatCount?.toString() || "2")
  const [bedCount, setBedCount] = useState("41")
  const [hhTicketCount, setHhTicketCount] = useState("0")
  const [hhPercentage, setHhPercentage] = useState("0")
  const [useHhPercentage, setUseHhPercentage] = useState(true)
  const [entryPlateNumber, setEntryPlateNumber] = useState(record.vehiclePlateNumber)
  const [useEntryPlateNumber, setUseEntryPlateNumber] = useState(false)
  const [routeId, setRouteId] = useState(record.routeId || "")
  const [scheduleId, setScheduleId] = useState(record.scheduleId || "")
  const [departureTime, setDepartureTime] = useState("")
  const [useOtherDepartureTime, setUseOtherDepartureTime] = useState(false)
  const [departureDate, setDepartureDate] = useState(
    record.plannedDepartureTime 
      ? format(new Date(record.plannedDepartureTime), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  )

  const [routes, setRoutes] = useState<Route[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [serviceCharges, setServiceCharges] = useState<ServiceCharge[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)
  const [notEligibleDialogOpen, setNotEligibleDialogOpen] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (routeId) {
      loadSchedules(routeId)
    }
  }, [routeId])

  useEffect(() => {
    calculateTotal()
  }, [serviceCharges])

  const loadInitialData = async () => {
    try {
      const [routesData, vehiclesData] = await Promise.all([
        routeService.getAll(undefined, undefined, true),
        vehicleService.getAll(undefined, true)
      ])
      setRoutes(routesData)
      setVehicles(vehiclesData)

      if (record.vehicleId) {
        const vehicle = await vehicleService.getById(record.vehicleId)
        setSelectedVehicle(vehicle)
        
        if (vehicle.operatorId) {
          const driversData = await driverService.getAll(vehicle.operatorId, true)
          setDrivers(driversData)
        }
      }

      if (record.id) {
        const charges = await serviceChargeService.getAll(record.id)
        setServiceCharges(charges)
      }

      if (record.routeId) {
        setRouteId(record.routeId)
        const schedulesData = await scheduleService.getAll(record.routeId, undefined, true)
        setSchedules(schedulesData)
        if (record.scheduleId) {
          setScheduleId(record.scheduleId)
        }
      }
    } catch (error) {
      console.error("Failed to load initial data:", error)
    }
  }

  const loadSchedules = async (routeId: string) => {
    try {
      const data = await scheduleService.getAll(routeId, undefined, true)
      setSchedules(data)
    } catch (error) {
      console.error("Failed to load schedules:", error)
    }
  }

  const calculateTotal = () => {
    const total = serviceCharges.reduce((sum, charge) => sum + charge.totalAmount, 0)
    setTotalAmount(total)
  }

  const handleEligible = async () => {
    if (!transportOrderCode || !routeId || !scheduleId || !departureDate) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc")
      return
    }

    setIsLoading(true)
    try {
      const plannedDepartureTime = useOtherDepartureTime && departureTime
        ? new Date(`${departureDate}T${departureTime}`).toISOString()
        : record.plannedDepartureTime || new Date().toISOString()

      await dispatchService.issuePermit(record.id, {
        transportOrderCode,
        plannedDepartureTime,
        seatCount: parseInt(seatCount),
        permitStatus: 'approved'
      })

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      console.error("Failed to issue permit:", error)
      alert("Không thể cấp phép. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotEligible = () => {
    if (!transportOrderCode) {
      alert("Vui lòng nhập mã lệnh vận chuyển")
      return
    }
    setNotEligibleDialogOpen(true)
  }

  const handleNotEligibleConfirm = async (
    selectedReasons: string[],
    options: {
      createOrder: boolean
      signAndTransmit: boolean
      printDisplay: boolean
    }
  ) => {
    if (!transportOrderCode || !routeId || !scheduleId || !departureDate) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc")
      setNotEligibleDialogOpen(false)
      return
    }

    // Options có thể được sử dụng trong tương lai để xử lý logic bổ sung
    // Ví dụ: tạo đơn hàng, ký lệnh, in bản thể hiện
    console.log('Options:', options)
    setIsLoading(true)
    try {
      // Danh sách các lý do từ NotEligibleReasonDialog
      const reasonDescriptions: Record<string, string> = {
        driver_license_insufficient: "Không có hoặc có nhưng không đủ số lượng giấy phép lái xe so với số lái xe ghi trên lệnh vận chuyển",
        driver_license_expired: "Giấy phép lái xe đã hết hạn hoặc sử dụng giấy phép lái xe giả",
        driver_license_class_mismatch: "Hạng giấy phép lái xe không phù hợp với các loại xe được phép điều khiển",
        driver_info_mismatch: "Thông tin của lái xe không đúng với thông tin được ghi trên lệnh vận chuyển",
        driver_alcohol: "Lái xe sử dụng rượu bia",
        driver_drugs: "Lái xe sử dụng chất ma tuý"
      }

      // Tạo rejection reason từ các lý do đã chọn
      const rejectionReason = selectedReasons
        .map(id => reasonDescriptions[id] || id)
        .join('; ')

      // Tính toán plannedDepartureTime
      const plannedDepartureTime = useOtherDepartureTime && departureTime
        ? new Date(`${departureDate}T${departureTime}`).toISOString()
        : record.plannedDepartureTime || new Date().toISOString()

      // Vẫn cấp phép (approved) nhưng lưu lại lý do không đủ điều kiện
      await dispatchService.issuePermit(record.id, {
        transportOrderCode,
        plannedDepartureTime,
        seatCount: parseInt(seatCount),
        permitStatus: 'approved', // Vẫn cấp phép để xe chuyển sang cột "Đã cấp nốt"
        rejectionReason: rejectionReason // Lưu lý do để có thể xem lại sau
      })

      if (onSuccess) {
        onSuccess()
      }
      setNotEligibleDialogOpen(false)
      onClose()
    } catch (error) {
      console.error("Failed to issue permit:", error)
      alert("Không thể cấp phép. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAllDocumentsValid = (): boolean => {
    if (!selectedVehicle?.documents) return false
    
    const docs = selectedVehicle.documents
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const registrationValid = docs.registration?.expiryDate 
      ? new Date(docs.registration.expiryDate) >= today 
      : false
    const permitValid = docs.operation_permit?.expiryDate 
      ? new Date(docs.operation_permit.expiryDate) >= today 
      : false
    const inspectionValid = docs.inspection?.expiryDate 
      ? new Date(docs.inspection.expiryDate) >= today 
      : false
    const insuranceValid = docs.insurance?.expiryDate 
      ? new Date(docs.insurance.expiryDate) >= today 
      : false

    return registrationValid && permitValid && inspectionValid && insuranceValid
  }

  const handleDocumentDialogSuccess = () => {
    // Reload vehicle data after document update
    if (record.vehicleId) {
      loadInitialData()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex justify-end gap-2 pb-4 border-b">
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
          variant="destructive"
          onClick={handleNotEligible}
          disabled={isLoading}
        >
          KHÔNG ĐỦ ĐIỀU KIỆN
        </Button>
        <Button 
          type="button"
          onClick={handleEligible}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          ĐỦ ĐIỀU KIỆN
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin chuyến đi</h2>
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="permitType">Loại cấp phép</Label>
                <Select
                  id="permitType"
                  value={permitType}
                  onChange={(e) => setPermitType(e.target.value)}
                  className="mt-1"
                >
                  <option value="fixed">Cố định</option>
                  <option value="temporary">Tạm thời</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="entryTime">Giờ vào bến</Label>
                <Input
                  id="entryTime"
                  value={format(new Date(record.entryTime), "HH:mm dd/MM/yyyy")}
                  className="mt-1 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="transportOrderCode">
                  Mã lệnh vận chuyển <span className="text-red-500">(*)</span>
                </Label>
                <Input
                  id="transportOrderCode"
                  value={transportOrderCode}
                  onChange={(e) => setTransportOrderCode(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
              <div>
                <Label htmlFor="plateNumber">Biển số đăng ký</Label>
                <Input
                  id="plateNumber"
                  value={record.vehiclePlateNumber}
                  className="mt-1 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="replacementVehicle">Chọn xe được đi thay</Label>
                <Select
                  id="replacementVehicle"
                  value={replacementVehicleId}
                  onChange={(e) => setReplacementVehicleId(e.target.value)}
                  className="mt-1"
                >
                  <option value="">--</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="seatCount">Số ghế</Label>
                <Input
                  id="seatCount"
                  type="number"
                  value={seatCount}
                  onChange={(e) => setSeatCount(e.target.value)}
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="bedCount">Số giường</Label>
                <Input
                  id="bedCount"
                  type="number"
                  value={bedCount}
                  onChange={(e) => setBedCount(e.target.value)}
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="hhTicketCount">Số vé HH</Label>
                <Input
                  id="hhTicketCount"
                  type="number"
                  value={hhTicketCount}
                  onChange={(e) => setHhTicketCount(e.target.value)}
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="hhPercentage">(%) HH</Label>
                  <Checkbox
                    id="useHhPercentage"
                    checked={useHhPercentage}
                    onChange={(e) => setUseHhPercentage(e.target.checked)}
                  />
                </div>
                <Input
                  id="hhPercentage"
                  type="number"
                  value={hhPercentage}
                  onChange={(e) => setHhPercentage(e.target.value)}
                  className="mt-1"
                  min="0"
                  max="100"
                  disabled={!useHhPercentage}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="entryPlateNumber">Biển số khi vào</Label>
                  <Checkbox
                    id="useEntryPlateNumber"
                    checked={useEntryPlateNumber}
                    onChange={(e) => setUseEntryPlateNumber(e.target.checked)}
                  />
                </div>
                <Input
                  id="entryPlateNumber"
                  value={entryPlateNumber}
                  onChange={(e) => setEntryPlateNumber(e.target.value)}
                  className="mt-1"
                  disabled={!useEntryPlateNumber}
                />
              </div>
              <div>
                <Label htmlFor="operator">Đơn vị vận tải</Label>
                <Input
                  id="operator"
                  value={selectedVehicle?.operator?.name || ''}
                  className="mt-1 bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="route">
                  Tuyến vận chuyển <span className="text-red-500">(*)</span>
                </Label>
                <Select
                  id="route"
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="mt-1"
                  required
                >
                  <option value="">Chọn tuyến</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.routeName} ({r.routeCode}){r.distanceKm ? ` (${r.distanceKm} Km)` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="schedule">
                  Biểu đồ giờ <span className="text-red-500">(*)</span>
                </Label>
                <Select
                  id="schedule"
                  value={scheduleId}
                  onChange={(e) => setScheduleId(e.target.value)}
                  className="mt-1"
                  required
                >
                  <option value="">Chọn giờ</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {format(new Date(`2000-01-01T${s.departureTime}`), "HH:mm:ss")}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="otherDepartureTime">Giờ xuất bến khác</Label>
                  <Checkbox
                    id="useOtherDepartureTime"
                    checked={useOtherDepartureTime}
                    onChange={(e) => setUseOtherDepartureTime(e.target.checked)}
                  />
                </div>
                <div className="relative mt-1">
                  <Input
                    id="otherDepartureTime"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    disabled={!useOtherDepartureTime}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <Label htmlFor="departureDate">
                  Ngày xuất bến <span className="text-red-500">(*)</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="departureDate"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Driver Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Label>Lái xe</Label>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] bg-white">
                {drivers.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Không có dữ liệu!</p>
                ) : (
                  <div className="space-y-2">
                    {drivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{driver.fullName}</span>
                        <span className="text-xs text-gray-500">{driver.licenseNumber}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Service Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Label>Dịch vụ</Label>
                <Button type="button" variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1" />
                  Sửa
                </Button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] bg-white">
                {serviceCharges.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">Không có dữ liệu!</p>
                ) : (
                  <div className="space-y-2">
                    {serviceCharges.map((charge) => (
                      <div key={charge.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{charge.serviceType?.name || 'Dịch vụ'}</span>
                        <span className="text-sm font-medium">
                          {charge.totalAmount.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <Label className="text-sm text-gray-600">Thành tiền (VND)</Label>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Vehicle Photo */}
          <div className="border border-gray-200 rounded-lg bg-white min-h-[300px] flex items-center justify-center relative">
            <p className="text-gray-400 text-sm">Ảnh xe vào bến</p>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Vehicle Information Conditions */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-semibold">Điều kiện thông tin xe</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setDocumentDialogOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            {checkAllDocumentsValid() ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Giấy tờ đủ điều kiện</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <X className="h-5 w-5" />
                <span className="text-sm font-medium">Không đủ điều kiện</span>
              </div>
            )}
          </div>

          {/* GSHT Check */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <Label className="font-semibold mb-3 block">Kiểm tra GSHT</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="h-4 w-4" />
                <span>(Chưa đăng nhập)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>(Chưa đăng nhập)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4" />
                <span>(Chưa đăng nhập)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>(Chưa đăng nhập)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Validity Dialog */}
      {record.vehicleId && (
        <DocumentValidityDialog
          vehicleId={record.vehicleId}
          open={documentDialogOpen}
          onClose={() => setDocumentDialogOpen(false)}
          onSuccess={handleDocumentDialogSuccess}
        />
      )}

      {/* Not Eligible Reason Dialog */}
      <NotEligibleReasonDialog
        open={notEligibleDialogOpen}
        onClose={() => setNotEligibleDialogOpen(false)}
        onConfirm={handleNotEligibleConfirm}
      />
    </div>
  )
}

