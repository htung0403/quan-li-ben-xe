import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Driver } from "@/types"
import { format, isValid, parseISO } from "date-fns"

// Helper function to safely format dates
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "N/A"
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString)
  return isValid(date) ? format(date, "dd/MM/yyyy") : "N/A"
}

export function DriverView({ driver }: { driver: Driver }) {
  const [activeTab, setActiveTab] = useState("info")
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
        <TabsTrigger value="license">Bằng lái</TabsTrigger>
        <TabsTrigger value="history">Lịch sử điều độ</TabsTrigger>
      </TabsList>
      <TabsContent value="info" className="space-y-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Số CMND/CCCD</Label>
            <p className="text-lg font-medium text-gray-900">{driver.idNumber}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Họ tên</Label>
            <p className="text-lg font-medium text-gray-900">{driver.fullName}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Số điện thoại</Label>
            <p className="text-lg font-medium text-gray-900">{driver.phone || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Tỉnh/Thành phố</Label>
            <p className="text-lg font-medium text-gray-900">{driver.province || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Quận/Huyện</Label>
            <p className="text-lg font-medium text-gray-900">{driver.district || 'N/A'}</p>
          </div>
          <div className="space-y-2 col-span-2">
            <Label className="text-base font-semibold">Địa chỉ cụ thể</Label>
            <p className="text-lg font-medium text-gray-900">{driver.address || 'N/A'}</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="license" className="space-y-6 mt-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Số bằng lái</Label>
            <p className="text-lg font-medium text-gray-900">{driver.licenseNumber}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Hạng bằng lái</Label>
            <p className="text-lg font-medium text-gray-900">{driver.licenseClass}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Ngày hết hạn bằng lái</Label>
            <p className="text-lg font-medium text-gray-900">
              {formatDate(driver.licenseExpiryDate)}
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="history" className="mt-6">
        <p className="text-sm text-gray-500">Lịch sử điều độ sẽ được hiển thị ở đây</p>
      </TabsContent>
    </Tabs>
  )
}
