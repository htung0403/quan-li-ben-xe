import { useState, useEffect, useCallback } from "react"
import { Download, RefreshCw, FileText, Calendar, TrendingUp, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { reportService } from "@/services/report.service"
import { format, subDays } from "date-fns"

type ReportType = "invoices" | "vehicle-logs" | "station-activity" | "invalid-vehicles" | "revenue"

// Helper function to safely format dates
const safeFormatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"
    return format(date, "dd/MM/yyyy")
  } catch {
    return "-"
  }
}

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>("invoices")
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 7), "yyyy-MM-dd")
  )
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any[]>([])

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    try {
      // Use mock data - replace with actual API call when backend is ready
      // const filter = { startDate, endDate }
      // let result = await reportService.getInvoices(filter)
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const {
        mockInvoiceReports,
        mockRevenueReports,
        mockVehicleLogs,
        mockStationActivity,
        mockInvalidVehicles,
      } = await import("@/mocks/reports.mock")
      
      let result: any[] = []

      switch (reportType) {
        case "invoices":
          result = mockInvoiceReports
          break
        case "vehicle-logs":
          result = mockVehicleLogs
          break
        case "station-activity":
          result = mockStationActivity
          break
        case "invalid-vehicles":
          result = mockInvalidVehicles
          break
        case "revenue":
          result = mockRevenueReports
          break
      }

      setData(result)
    } catch (error) {
      console.error("Failed to load report:", error)
    } finally {
      setIsLoading(false)
    }
  }, [reportType])

  // Auto load report when reportType changes
  useEffect(() => {
    loadReport()
  }, [loadReport])

  const handleExport = async () => {
    try {
      const filter = {
        startDate,
        endDate,
      }
      const blob = await reportService.exportExcel(reportType, filter)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bao-cao-${reportType}-${startDate}-${endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
        <p className="text-gray-600 mt-1">Xem và xuất báo cáo</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="reportType">Loại báo cáo</Label>
              <Select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
              >
                <option value="invoices">Bảng kê hóa đơn</option>
                <option value="vehicle-logs">Nhật trình xe</option>
                <option value="station-activity">Xe ra vào bến</option>
                <option value="invalid-vehicles">Xe không đủ điều kiện</option>
                <option value="revenue">Doanh thu</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={loadReport} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tải lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === "invoices" && "Bảng kê hóa đơn"}
            {reportType === "vehicle-logs" && "Nhật trình xe"}
            {reportType === "station-activity" && "Xe ra vào bến"}
            {reportType === "invalid-vehicles" && "Xe không đủ điều kiện"}
            {reportType === "revenue" && "Doanh thu"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có dữ liệu
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {reportType === "invoices" && (
                    <>
                      <TableHead>Mã hóa đơn</TableHead>
                      <TableHead>Biển số</TableHead>
                      <TableHead>Tuyến</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Ngày</TableHead>
                    </>
                  )}
                  {reportType === "revenue" && (
                    <>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Tổng doanh thu</TableHead>
                      <TableHead>Số xe</TableHead>
                      <TableHead>Số giao dịch</TableHead>
                    </>
                  )}
                  {reportType === "invalid-vehicles" && (
                    <>
                      <TableHead>Biển số</TableHead>
                      <TableHead>Lý do</TableHead>
                      <TableHead>Ngày</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    {reportType === "invoices" && (
                      <>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.vehiclePlateNumber}</TableCell>
                        <TableCell>{item.route}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("vi-VN").format(item.amount)} đ
                        </TableCell>
                        <TableCell>
                          {safeFormatDate(item.issueDate)}
                        </TableCell>
                      </>
                    )}
                    {reportType === "revenue" && (
                      <>
                        <TableCell>
                          {safeFormatDate(item.date)}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("vi-VN").format(item.totalRevenue)} đ
                        </TableCell>
                        <TableCell>{item.vehicleCount}</TableCell>
                        <TableCell>{item.transactionCount}</TableCell>
                      </>
                    )}
                    {reportType === "invalid-vehicles" && (
                      <>
                        <TableCell>{item.plateNumber}</TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell>
                          {safeFormatDate(item.date)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

