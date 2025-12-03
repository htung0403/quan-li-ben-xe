import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { vehicleService } from "@/services/vehicle.service"
import { routeService } from "@/services/route.service"
import { scheduleService } from "@/services/schedule.service"
import { dispatchService } from "@/services/dispatch.service"
import { driverService } from "@/services/driver.service"
import type { Route, Schedule, Driver, DispatchInput } from "@/types"
import { format } from "date-fns"

interface VehicleEntryDialogProps {
  vehicleOptions: Array<{ id: string; plateNumber: string }>
  onClose: () => void
  onSuccess?: () => void
}

export function VehicleEntryDialog({ 
  vehicleOptions, 
  onClose,
  onSuccess 
}: VehicleEntryDialogProps) {
  const [vehicleId, setVehicleId] = useState("")
  const [entryTime, setEntryTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [confirmPassengerDrop, setConfirmPassengerDrop] = useState(false)
  const [scheduleId, setScheduleId] = useState("")
  const [passengersArrived, setPassengersArrived] = useState("")
  const [routeId, setRouteId] = useState("")
  const [signAndTransmit, setSignAndTransmit] = useState(true)
  const [printDisplay, setPrintDisplay] = useState(false)
  
  const [routes, setRoutes] = useState<Route[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [transportOrderDisplay] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadRoutes()
  }, [])

  useEffect(() => {
    if (vehicleId) {
      loadVehicleDetails(vehicleId)
    } else {
      setSelectedDriver(null)
    }
  }, [vehicleId])

  useEffect(() => {
    if (routeId) {
      loadSchedules(routeId)
    } else {
      setSchedules([])
    }
  }, [routeId])

  const loadRoutes = async () => {
    try {
      const data = await routeService.getAll(undefined, undefined, true)
      setRoutes(data)
    } catch (error) {
      console.error("Failed to load routes:", error)
    }
  }

  const loadVehicleDetails = async (id: string) => {
    try {
      const vehicle = await vehicleService.getById(id)
      
      // Try to get driver for this vehicle's operator
      if (vehicle.operatorId) {
        try {
          const drivers = await driverService.getAll(vehicle.operatorId, true)
          if (drivers.length > 0) {
            setSelectedDriver(drivers[0]) // Use first active driver, or implement selection logic
          }
        } catch (error) {
          console.error("Failed to load driver:", error)
        }
      }
    } catch (error) {
      console.error("Failed to load vehicle details:", error)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!vehicleId || !entryTime || !routeId) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc")
      return
    }

    if (!selectedDriver) {
      alert("Không tìm thấy thông tin lái xe cho xe này")
      return
    }

    setIsLoading(true)
    try {
      const dispatchData: DispatchInput = {
        vehicleId,
        driverId: selectedDriver.id,
        routeId,
        scheduleId: scheduleId || undefined,
        entryTime: new Date(entryTime).toISOString(),
      }

      const result = await dispatchService.create(dispatchData)
      
      // If passenger drop is confirmed, record it
      if (confirmPassengerDrop && passengersArrived) {
        await dispatchService.recordPassengerDrop(
          result.id,
          parseInt(passengersArrived)
        )
      }

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      console.error("Failed to create dispatch record:", error)
      alert("Không thể tạo bản ghi điều độ. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Form */}
        <div className="space-y-6">
          {/* Thông tin xe vào bến */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thông tin xe vào bến
            </h3>
            
            <div>
              <Label htmlFor="vehicle">
                Biển kiểm soát <span className="text-red-500">(*)</span>
              </Label>
              <Select
                id="vehicle"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="mt-1"
                required
              >
                <option value="">Chọn biển kiểm soát</option>
                {vehicleOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="entryTime">
                Thời gian vào <span className="text-red-500">(*)</span>
              </Label>
              <Input
                id="entryTime"
                type="datetime-local"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* Thông tin xe trả khách */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900">
              Thông tin xe trả khách
            </h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirmPassengerDrop"
                checked={confirmPassengerDrop}
                onChange={(e) => setConfirmPassengerDrop(e.target.checked)}
              />
              <Label htmlFor="confirmPassengerDrop" className="cursor-pointer">
                Xác nhận trả khách
              </Label>
            </div>

            {confirmPassengerDrop && (
              <>
                <div>
                  <Label htmlFor="schedule">Chọn nhật trình</Label>
                  <Select
                    id="schedule"
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">Chọn nhật trình</option>
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.scheduleCode} - {format(new Date(s.departureTime), "HH:mm")}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="passengersArrived">
                    Số khách đến bến <span className="text-red-500">(*)</span>
                  </Label>
                  <Input
                    id="passengersArrived"
                    type="number"
                    value={passengersArrived}
                    onChange={(e) => setPassengersArrived(e.target.value)}
                    className="mt-1"
                    min="0"
                    required={confirmPassengerDrop}
                  />
                </div>
              </>
            )}

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
                <option value="">Chọn tuyến vận chuyển</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.routeName} ({r.routeCode})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Right Panel - Transportation Order Display */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Bản thể hiện lệnh vận chuyển
          </h3>
          <div className="border border-gray-200 rounded-lg bg-gray-50 min-h-[400px] flex items-center justify-center relative">
            {transportOrderDisplay ? (
              <div className="p-4 text-sm text-gray-700">
                {transportOrderDisplay}
              </div>
            ) : (
              <p className="text-gray-400">Không có bản thể hiện</p>
            )}
            <div className="absolute bottom-4 right-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Checkboxes */}
      <div className="flex items-center space-x-6 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="signAndTransmit"
            checked={signAndTransmit}
            onChange={(e) => setSignAndTransmit(e.target.checked)}
          />
          <Label htmlFor="signAndTransmit" className="cursor-pointer">
            Ký lệnh và truyền tải
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="printDisplay"
            checked={printDisplay}
            onChange={(e) => setPrintDisplay(e.target.checked)}
          />
          <Label htmlFor="printDisplay" className="cursor-pointer">
            In bản thể hiện
          </Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isLoading}
        >
          HỦY
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "XÁC NHẬN"}
        </Button>
      </div>
    </form>
  )
}

