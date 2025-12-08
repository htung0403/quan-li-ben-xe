import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/layout/StatusBadge"
import type { Vehicle } from "@/types"

// Helper functions
const getVehicleTypeName = (vehicle: Vehicle): string => {
  return vehicle.vehicleType?.name || vehicle.vehicleTypeId || ""
}

const getOperatorName = (vehicle: Vehicle): string => {
  return vehicle.operator?.name || vehicle.operatorId || ""
}

interface VehicleViewProps {
  vehicle: Vehicle
}

export function VehicleView({ vehicle }: VehicleViewProps) {
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
            <p className="text-lg font-medium text-gray-900">
              {getVehicleTypeName(vehicle)}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Số ghế</Label>
            <p className="text-lg font-medium text-gray-900">{vehicle.seatCapacity}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Nhà xe</Label>
            <p className="text-lg font-medium text-gray-900">
              {getOperatorName(vehicle)}
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="documents" className="space-y-4 mt-6">
        <div className="space-y-4">
          {vehicle.documents?.inspection && (
            <DocumentCard
              title="Đăng kiểm"
              doc={vehicle.documents.inspection}
            />
          )}
          {vehicle.documents?.operation_permit && (
            <DocumentCard
              title="Phù hiệu"
              doc={vehicle.documents.operation_permit}
            />
          )}
          {vehicle.documents?.insurance && (
            <DocumentCard
              title="Bảo hiểm"
              doc={vehicle.documents.insurance}
            />
          )}
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
