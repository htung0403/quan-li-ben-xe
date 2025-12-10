import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, FileSpreadsheet } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { toast } from "react-toastify";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { dispatchService } from "@/services/dispatch.service";
import { operatorService } from "@/services/operator.service";
import type { DispatchRecord, Operator } from "@/types";
import { useUIStore } from "@/store/ui.store";
import { formatVietnamDateTime } from "@/lib/vietnam-time";
import { DatePickerRange } from "@/components/DatePickerRange";

export default function BaoCaoXeTraKhach() {
  const setTitle = useUIStore((state) => state.setTitle);
  const [records, setRecords] = useState<DispatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>("");

  useEffect(() => {
    setTitle("Báo cáo > Xe trả khách");
    loadRecords();
    loadOperators();
  }, [setTitle]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await dispatchService.getAll();
      // Chỉ lấy các xe đã trả khách
      const filtered = data.filter((item) =>
        item.currentStatus === "passengers_dropped"
      );
      setRecords(filtered);
    } catch (error) {
      console.error("Failed to load dispatch records:", error);
      toast.error("Không thể tải dữ liệu báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOperators = async () => {
    try {
      const data = await operatorService.getAll(true);
      setOperators(data);
    } catch (error) {
      console.error("Failed to load operators:", error);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      // Full text search - search in both plate number and route name
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const plateMatch = item.vehiclePlateNumber
          .toLowerCase()
          .includes(query);
        const routeMatch = (item.routeName || "")
          .toLowerCase()
          .includes(query);
        matchesSearch = plateMatch || routeMatch;
      }
      
      // Filter by operator
      let matchesOperator = true;
      if (selectedOperatorId) {
        matchesOperator = item.vehicle?.operatorId === selectedOperatorId;
      }
      
      // Filter by date range (using passengerDropTime)
      let matchesDate = true;
      if (dateRange?.from && dateRange?.to) {
        const filterDate = item.passengerDropTime;
        if (filterDate) {
          const itemDate = new Date(filterDate);
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = itemDate >= fromDate && itemDate <= toDate;
        } else {
          matchesDate = false;
        }
      } else if (dateRange?.from) {
        const filterDate = item.passengerDropTime;
        if (filterDate) {
          const itemDate = new Date(filterDate);
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          matchesDate = itemDate >= fromDate;
        } else {
          matchesDate = false;
        }
      }
      
      return matchesSearch && matchesOperator && matchesDate;
    });
  }, [records, searchQuery, dateRange, selectedOperatorId]);

  const renderTime = (value?: string) => (value ? formatVietnamDateTime(value) : "-");

  const totalPassengers = useMemo(() => {
    return filteredRecords.reduce((sum, item) => {
      const value = item.passengersArrived ?? item.seatCount;
      if (typeof value === "number") {
        return sum + value;
      }
      return sum;
    }, 0);
  }, [filteredRecords]);

  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      toast.warning("Không có dữ liệu để xuất Excel");
      return;
    }

    try {
      // Prepare data for Excel
      const excelData = filteredRecords.map((item, index) => ({
        "STT": index + 1,
        "Biển số": item.vehiclePlateNumber || "-",
        "Biển số khi vào": item.vehiclePlateNumber || "-",
        "Mã lệnh trả khách": item.transportOrderCode || item.id.substring(0, 8) || "-",
        "Tên đơn vị": item.vehicle?.operator?.name || "-",
        "Tên luồng tuyến": item.routeName || "-",
        "Loại tuyến": "-",
        "Người xác nhận trả khách": item.passengerDropBy || "-",
        "Thời gian trả khách": item.passengerDropTime ? format(new Date(item.passengerDropTime), "dd/MM/yyyy HH:mm") : "-",
        "Số khách": item.passengersArrived ?? item.seatCount ?? "-",
        "Trạng thái ký lệnh vận chuyển": item.permitStatus === "approved" ? "Đã ký" : item.permitStatus === "rejected" ? "Từ chối" : "-",
        "Trạng thái đồng bộ dữ liệu": item.metadata?.syncStatus || (item.metadata?.syncTime ? "Đã đồng bộ" : "Chưa đồng bộ"),
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Báo cáo xe trả khách");

      // Set column widths
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 15 },  // Biển số
        { wch: 15 },  // Biển số khi vào
        { wch: 18 },  // Mã lệnh trả khách
        { wch: 25 },  // Tên đơn vị
        { wch: 25 },  // Tên luồng tuyến
        { wch: 15 },  // Loại tuyến
        { wch: 25 },  // Người xác nhận trả khách
        { wch: 20 },  // Thời gian trả khách
        { wch: 10 },  // Số khách
        { wch: 25 },  // Trạng thái ký lệnh vận chuyển
        { wch: 20 },  // Trạng thái đồng bộ dữ liệu
      ];
      ws['!cols'] = colWidths;

      // Generate filename with current date
      const currentDate = format(new Date(), "dd-MM-yyyy");
      const filename = `Bao-cao-xe-tra-khach_${currentDate}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);
      
      toast.success(`Đã xuất Excel thành công: ${filename}`);
    } catch (error) {
      console.error("Failed to export Excel:", error);
      toast.error("Không thể xuất Excel. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isLoading || filteredRecords.length === 0}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRecords}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm biển số xe, luồng tuyến..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DatePickerRange
              range={dateRange}
              onRangeChange={setDateRange}
              placeholder="Chọn khoảng thời gian"
              label=""
              className="w-full space-y-0"
            />
            <div className="space-y-0">
              <Select
                id="operator"
                value={selectedOperatorId}
                onChange={(e) => setSelectedOperatorId(e.target.value)}
              >
                <option value="">Chọn doanh nghiệp vận tải</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Biển số khi vào</TableHead>
                  <TableHead>Mã lệnh trả khách</TableHead>
                  <TableHead>Tên đơn vị</TableHead>
                  <TableHead>Tên luồng tuyến</TableHead>
                  <TableHead>Loại tuyến</TableHead>
                  <TableHead>Người xác nhận trả khách</TableHead>
                  <TableHead>Thời gian trả khách</TableHead>
                  <TableHead>Số khách</TableHead>
                  <TableHead>Trạng thái ký lệnh vận chuyển</TableHead>
                  <TableHead>Trạng thái đồng bộ dữ liệu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-gray-500">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredRecords.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-semibold">
                          {item.vehiclePlateNumber || "-"}
                        </TableCell>
                        <TableCell>
                          {item.vehiclePlateNumber || "-"}
                        </TableCell>
                        <TableCell>
                          {item.transportOrderCode || item.id.substring(0, 8) || "-"}
                        </TableCell>
                        <TableCell>
                          {item.vehicle?.operator?.name || "-"}
                        </TableCell>
                        <TableCell>{item.routeName || "-"}</TableCell>
                        <TableCell>
                          {item.route?.routeType || "-"}
                        </TableCell>
                        <TableCell>{item.passengerDropBy || "-"}</TableCell>
                        <TableCell>{renderTime(item.passengerDropTime)}</TableCell>
                        <TableCell>
                          {item.passengersArrived ?? item.seatCount ?? "-"}
                        </TableCell>
                        <TableCell>
                          {item.permitStatus === "approved" ? "Đã ký" : 
                           item.permitStatus === "rejected" ? "Từ chối" : "-"}
                        </TableCell>
                        <TableCell>
                          {item.metadata?.syncStatus || (item.metadata?.syncTime ? "Đã đồng bộ" : "Chưa đồng bộ")}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell>
                        {`Tổng: ${filteredRecords.length} xe`}
                      </TableCell>
                      <TableCell colSpan={7}></TableCell>
                      <TableCell>
                        {totalPassengers > 0 ? totalPassengers : "-"}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

