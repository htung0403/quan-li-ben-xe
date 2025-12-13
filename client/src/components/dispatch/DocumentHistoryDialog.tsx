import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { vehicleService } from "@/services/vehicle.service"
import { History, Clock, User, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatVietnamDateTime } from "@/lib/vietnam-time"

interface DocumentHistoryDialogProps {
  vehicleId: string
  open: boolean
  onClose: () => void
}

interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  recordId: string
  oldValues: any
  newValues: any
  createdAt: string
}

const getDocumentTypeLabel = (docType: string): string => {
  const labels: Record<string, string> = {
    registration: 'Đăng ký xe',
    inspection: 'Đăng kiểm',
    insurance: 'Bảo hiểm',
    operation_permit: 'Phù hiệu',
    emblem: 'Biển hiệu',
  }
  return labels[docType] || docType
}

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    CREATE_DOCUMENT: 'Tạo mới giấy tờ',
    UPDATE_DOCUMENT: 'Cập nhật giấy tờ',
    UPDATE_DOCUMENT_EXPIRY: 'Cập nhật hạn giấy tờ',
  }
  return labels[action] || action
}

export function DocumentHistoryDialog({
  vehicleId,
  open,
  onClose,
}: DocumentHistoryDialogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && vehicleId) {
      loadAuditLogs()
    }
  }, [open, vehicleId])

  const loadAuditLogs = async () => {
    setIsLoading(true)
    try {
      const data = await vehicleService.getDocumentAuditLogs(vehicleId)
      setLogs(data)
    } catch (error) {
      console.error("Failed to load audit logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử thay đổi giấy tờ xe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Đang tải...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có lịch sử thay đổi
            </div>
          ) : (
            logs.map((log) => (
              <Card key={log.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {log.newValues?.document_type
                              ? getDocumentTypeLabel(log.newValues.document_type)
                              : 'Giấy tờ'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getActionLabel(log.action)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatVietnamDateTime(log.createdAt, "dd/MM/yyyy HH:mm:ss")}
                        </div>
                      </div>
                    </div>

                    {/* User info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Người thực hiện: <strong>{log.userName}</strong></span>
                    </div>

                    {/* Changes */}
                    {log.oldValues && log.newValues && (
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        {/* Old Values */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Giá trị cũ:</p>
                          <div className="space-y-1 text-sm">
                            {log.oldValues.expiry_date && (
                              <div>
                                <span className="text-gray-600">Hết hạn: </span>
                                <span className="font-medium">
                                  {format(new Date(log.oldValues.expiry_date), "dd/MM/yyyy")}
                                </span>
                              </div>
                            )}
                            {log.oldValues.document_number && (
                              <div>
                                <span className="text-gray-600">Số: </span>
                                <span className="font-medium">{log.oldValues.document_number}</span>
                              </div>
                            )}
                            {log.oldValues.issue_date && (
                              <div>
                                <span className="text-gray-600">Ngày cấp: </span>
                                <span className="font-medium">
                                  {format(new Date(log.oldValues.issue_date), "dd/MM/yyyy")}
                                </span>
                              </div>
                            )}
                            {log.oldValues.vehicle_plate && (
                              <div>
                                <span className="text-gray-600">Biển số: </span>
                                <span className="font-medium">{log.oldValues.vehicle_plate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* New Values */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Giá trị mới:</p>
                          <div className="space-y-1 text-sm">
                            {log.newValues.expiry_date && (
                              <div>
                                <span className="text-gray-600">Hết hạn: </span>
                                <span className="font-medium text-green-700">
                                  {format(new Date(log.newValues.expiry_date), "dd/MM/yyyy")}
                                </span>
                              </div>
                            )}
                            {log.newValues.document_number && (
                              <div>
                                <span className="text-gray-600">Số: </span>
                                <span className="font-medium text-green-700">
                                  {log.newValues.document_number}
                                </span>
                              </div>
                            )}
                            {log.newValues.issue_date && (
                              <div>
                                <span className="text-gray-600">Ngày cấp: </span>
                                <span className="font-medium text-green-700">
                                  {format(new Date(log.newValues.issue_date), "dd/MM/yyyy")}
                                </span>
                              </div>
                            )}
                            {log.newValues.vehicle_plate && (
                              <div>
                                <span className="text-gray-600">Biển số: </span>
                                <span className="font-medium text-green-700">
                                  {log.newValues.vehicle_plate}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* New document only */}
                    {!log.oldValues && log.newValues && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-gray-500 mb-2">Thông tin:</p>
                        <div className="space-y-1 text-sm">
                          {log.newValues.expiry_date && (
                            <div>
                              <span className="text-gray-600">Hết hạn: </span>
                              <span className="font-medium">
                                {format(new Date(log.newValues.expiry_date), "dd/MM/yyyy")}
                              </span>
                            </div>
                          )}
                          {log.newValues.document_number && (
                            <div>
                              <span className="text-gray-600">Số: </span>
                              <span className="font-medium">{log.newValues.document_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

