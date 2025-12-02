import { useState } from "react"
import { Bus, CheckCircle, DollarSign, AlertTriangle } from "lucide-react"
import { DashboardCard } from "@/components/layout/DashboardCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/layout/StatusBadge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import {
  mockDashboardStats,
  mockChartData,
  mockRecentActivity,
  mockWarnings,
} from "@/mocks/dashboard.mock"

export default function Dashboard() {
  const [recentActivity] = useState(mockRecentActivity)
  const [warnings] = useState(mockWarnings)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600 mt-1">
          Thống kê và hoạt động của bến xe
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Xe trong bến"
          value={mockDashboardStats.vehiclesInStation}
          icon={Bus}
          description="Hiện tại"
        />
        <DashboardCard
          title="Xe đã xuất bến hôm nay"
          value={mockDashboardStats.vehiclesDepartedToday}
          icon={CheckCircle}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Doanh thu hôm nay"
          value={`${(mockDashboardStats.revenueToday / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <DashboardCard
          title="Xe không đủ điều kiện"
          value={mockDashboardStats.invalidVehicles}
          icon={AlertTriangle}
          description="Cần xử lý"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Lượt xe theo giờ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Cảnh báo giấy tờ sắp hết hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {warning.type === "vehicle"
                        ? `Xe: ${warning.plateNumber}`
                        : `Lái xe: ${warning.name}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {warning.document} - Hết hạn:{" "}
                      {format(warning.expiryDate, "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Tuyến</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.vehiclePlateNumber}
                    </TableCell>
                    <TableCell>{activity.route}</TableCell>
                    <TableCell>
                      {format(new Date(activity.entryTime), "HH:mm")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={activity.status as any} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

