import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, ChevronUp, Printer, FileText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { dispatchService } from "@/services/dispatch.service"
import { serviceChargeService } from "@/services/service-charge.service"
import type { DispatchRecord, ServiceCharge, ServiceType, ServiceChargeInput } from "@/types"
import { format } from "date-fns"

export default function Payment() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<DispatchRecord | null>(null)
  const [serviceCharges, setServiceCharges] = useState<ServiceCharge[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [symbol, setSymbol] = useState("QLBX")
  const [note, setNote] = useState("")
  const [printOneCopy, setPrintOneCopy] = useState(true)
  const [printTwoCopies, setPrintTwoCopies] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false)
  const [newService, setNewService] = useState({
    serviceTypeId: "",
    quantity: 1,
    unitPrice: 0,
  })

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    if (!id) return
    
    setIsLoading(true)
    try {
      const [recordData, chargesData, typesData] = await Promise.all([
        dispatchService.getById(id),
        serviceChargeService.getAll(id),
        serviceChargeService.getServiceTypes(true)
      ])
      setRecord(recordData)
      setServiceCharges(chargesData)
      setServiceTypes(typesData)
      
      // Set default note
      if (recordData) {
        setNote(`Đơn hàng điều độ (${format(new Date(recordData.entryTime), "dd/MM/yyyy HH:mm")})`)
      }
    } catch (error) {
      console.error("Failed to load payment data:", error)
      alert("Không thể tải dữ liệu thanh toán. Vui lòng thử lại sau.")
      navigate("/dispatch")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const calculateTotals = () => {
    const subtotal = serviceCharges.reduce((sum, charge) => sum + charge.totalAmount, 0)
    const discount = 0 // Có thể tính từ serviceCharges nếu có
    const tax = 0 // Có thể tính từ serviceCharges nếu có
    const total = subtotal - discount + tax
    
    return { subtotal, discount, tax, total }
  }

  const handlePayment = async () => {
    if (!record) return

    const { total } = calculateTotals()
    
    setIsProcessing(true)
    try {
      await dispatchService.processPayment(record.id, {
        paymentAmount: total,
        paymentMethod: 'cash'
      })
      
      alert("Thanh toán thành công!")
      navigate("/dispatch")
    } catch (error) {
      console.error("Failed to process payment:", error)
      alert("Không thể xử lý thanh toán. Vui lòng thử lại sau.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    if (confirm("Bạn có chắc chắn muốn hủy thanh toán?")) {
      navigate("/dispatch")
    }
  }

  const handleAddService = async () => {
    if (!id || !newService.serviceTypeId || !newService.unitPrice) {
      alert("Vui lòng điền đầy đủ thông tin dịch vụ")
      return
    }

    if (newService.quantity <= 0) {
      alert("Số lượng phải lớn hơn 0")
      return
    }

    try {
      const totalAmount = newService.quantity * newService.unitPrice
      const input: ServiceChargeInput = {
        dispatchRecordId: id,
        serviceTypeId: newService.serviceTypeId,
        quantity: newService.quantity,
        unitPrice: newService.unitPrice,
        totalAmount,
      }

      await serviceChargeService.create(input)
      
      // Reload service charges
      const chargesData = await serviceChargeService.getAll(id)
      setServiceCharges(chargesData)
      
      // Reset form and close dialog
      setNewService({
        serviceTypeId: "",
        quantity: 1,
        unitPrice: 0,
      })
      setIsAddServiceDialogOpen(false)
    } catch (error) {
      console.error("Failed to add service:", error)
      alert("Không thể thêm dịch vụ. Vui lòng thử lại sau.")
    }
  }

  const handleServiceTypeChange = (serviceTypeId: string) => {
    const selectedType = serviceTypes.find(st => st.id === serviceTypeId)
    setNewService({
      ...newService,
      serviceTypeId,
      unitPrice: selectedType?.basePrice || 0,
    })
  }

  const handleDeleteService = async (chargeId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      return
    }

    if (!id) return

    try {
      await serviceChargeService.delete(chargeId)
      
      // Reload service charges
      const chargesData = await serviceChargeService.getAll(id)
      setServiceCharges(chargesData)
      
      alert("Xóa dịch vụ thành công!")
    } catch (error) {
      console.error("Failed to delete service:", error)
      alert("Không thể xóa dịch vụ. Vui lòng thử lại sau.")
    }
  }

  const { subtotal, discount, tax, total } = calculateTotals()
  const orderId = record?.transportOrderCode || `ORDER-${id?.slice(0, 8)}`
  const isExpanded = expandedOrders.has(orderId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin thanh toán</p>
          <Button onClick={() => navigate("/dispatch")} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        Quản lý đơn hàng &gt; Thanh toán
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Xác nhận thanh toán</h1>

          {/* Service List Table */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Danh sách dịch vụ</h2>
                <Button
                  onClick={() => setIsAddServiceDialogOpen(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm dịch vụ
                </Button>
              </div>
            </CardContent>
            <CardContent className="p-0 pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Đơn giá (đ)</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Chiết khấu (đ)</TableHead>
                    <TableHead>Chiết khấu (%)</TableHead>
                    <TableHead>Phần trăm thuế (%)</TableHead>
                    <TableHead>Thành tiền (đ)</TableHead>
                    <TableHead>Nợ</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Collapsible Order Row */}
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={9} className="p-0">
                      <button
                        onClick={() => toggleOrder(orderId)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-100"
                      >
                        <span className="font-medium">
                          Mã đơn hàng: {orderId} ({format(new Date(record.entryTime), "dd/MM/yyyy")})
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>

                  {/* Service Items */}
                  {isExpanded && (
                    <>
                      {serviceCharges.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            Không có dịch vụ
                          </TableCell>
                        </TableRow>
                      ) : (
                        serviceCharges.map((charge) => (
                          <TableRow key={charge.id}>
                            <TableCell className="font-medium">
                              {charge.serviceType?.name || "Dịch vụ"}
                            </TableCell>
                            <TableCell>{charge.unitPrice.toLocaleString('vi-VN')}</TableCell>
                            <TableCell>{charge.quantity}</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell>0</TableCell>
                            <TableCell className="font-medium">
                              {charge.totalAmount.toLocaleString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteService(charge.id)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {/* Total Row */}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={6} className="text-right">
                          Tổng tiền:
                        </TableCell>
                        <TableCell>
                          {subtotal.toLocaleString('vi-VN')}₫
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Control Sheet */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Biên kiểm soát</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Biến kiểm soát:</span>
                  <span className="ml-2 font-medium">{record.vehiclePlateNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tuyến vận chuyển:</span>
                  <span className="ml-2 font-medium">{record.routeName || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Giờ vào bến:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(record.entryTime), "HH:mm dd/MM/yyyy")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Số ghế | Số giường:</span>
                  <span className="ml-2 font-medium">
                    {record.seatCount || '-'} | 41
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Giờ xuất bến kế hoạch:</span>
                  <span className="ml-2 font-medium">
                    {record.plannedDepartureTime 
                      ? format(new Date(record.plannedDepartureTime), "HH:mm dd/MM/yyyy")
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleCancel}>
              HỦY THANH TOÁN
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              LỊCH SỬ XE TRẢ KHÁCH
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              LỊCH SỬ XE RA VÀO BẾN
            </Button>
          </div>
        </div>

        {/* Right Column - Payment Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Thanh toán</h2>

              {/* Symbol */}
              <div>
                <Label htmlFor="symbol">Ký hiệu:</Label>
                <Select
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="mt-1"
                >
                  <option value="QLBX">QLBX</option>
                  <option value="KHAC">KHAC</option>
                </Select>
              </div>

              {/* Note */}
              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ghi chú..."
                />
              </div>

              {/* Customer Info */}
              <div className="pt-4 border-t space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Người mua:</span>
                  <span className="ml-2 font-medium">
                    {record.driverName || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Đơn vị vận tải:</span>
                  <span className="ml-2 font-medium">
                    {record.vehicle?.operator?.name || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Mã số thuế:</span>
                  <span className="ml-2 font-medium">
                    {record.vehicle?.operator?.taxCode || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Địa chỉ:</span>
                  <span className="ml-2 font-medium">
                    {record.vehicle?.operator?.address || '-'}
                  </span>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-medium">{subtotal.toLocaleString('vi-VN')} đồng</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chiết khấu:</span>
                  <span className="font-medium">{discount.toLocaleString('vi-VN')} đồng</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiền thuế GTGT:</span>
                  <span className="font-medium">{tax.toLocaleString('vi-VN')} đồng</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Thực thu:</span>
                  <span className="text-blue-600">{total.toLocaleString('vi-VN')} đồng</span>
                </div>
              </div>

              {/* Print Options */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="printOne"
                    checked={printOneCopy}
                    onChange={(e) => {
                      setPrintOneCopy(e.target.checked)
                      if (e.target.checked) setPrintTwoCopies(false)
                    }}
                  />
                  <Label htmlFor="printOne" className="cursor-pointer text-sm">
                    In 1 liên
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="printTwo"
                    checked={printTwoCopies}
                    onChange={(e) => {
                      setPrintTwoCopies(e.target.checked)
                      if (e.target.checked) setPrintOneCopy(false)
                    }}
                  />
                  <Label htmlFor="printTwo" className="cursor-pointer text-sm">
                    In 2 liên
                  </Label>
                </div>
              </div>

              {/* Final Action Buttons */}
              <div className="pt-4 border-t space-y-2">
                <Button variant="outline" className="w-full" onClick={() => {
                  // TODO: Implement print preview
                  alert("Chức năng xem trước bản in đang được phát triển")
                }}>
                  <Printer className="mr-2 h-4 w-4" />
                  XEM TRƯỚC BẢN IN
                </Button>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Đang xử lý..." : "THANH TOÁN"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm dịch vụ</DialogTitle>
            <DialogDescription>
              Thêm dịch vụ mới vào đơn hàng thanh toán
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="serviceType">Loại dịch vụ *</Label>
              <Select
                id="serviceType"
                value={newService.serviceTypeId}
                onChange={(e) => handleServiceTypeChange(e.target.value)}
                className="mt-1"
              >
                <option value="">Chọn loại dịch vụ</option>
                {serviceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - {type.basePrice.toLocaleString('vi-VN')} đ/{type.unit || 'đơn vị'}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Số lượng *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newService.quantity}
                onChange={(e) => setNewService({
                  ...newService,
                  quantity: parseInt(e.target.value) || 1,
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="unitPrice">Đơn giá (đ) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                value={newService.unitPrice}
                onChange={(e) => setNewService({
                  ...newService,
                  unitPrice: parseFloat(e.target.value) || 0,
                })}
                className="mt-1"
              />
            </div>
            {newService.quantity > 0 && newService.unitPrice > 0 && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thành tiền:</span>
                  <span className="font-semibold text-lg">
                    {(newService.quantity * newService.unitPrice).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddServiceDialogOpen(false)
                setNewService({
                  serviceTypeId: "",
                  quantity: 1,
                  unitPrice: 0,
                })
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAddService}>
              Thêm dịch vụ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

