# Mock Data

Thư mục này chứa tất cả mock data cho ứng dụng, giúp phát triển frontend mà không cần backend.

## Cấu trúc

- `vehicles.mock.ts` - Mock data cho xe (5 xe mẫu)
- `drivers.mock.ts` - Mock data cho lái xe (6 lái xe mẫu)
- `dispatch.mock.ts` - Mock data cho điều độ xe (10 records hiện tại + 2 records lịch sử)
- `reports.mock.ts` - Mock data cho báo cáo (invoices, revenue, logs, activity, invalid vehicles)
- `dashboard.mock.ts` - Mock data cho dashboard (stats, charts, warnings, recent activity)
- `index.ts` - Export tất cả mock data

## Sử dụng

Các pages đã được cấu hình để sử dụng mock data. Khi backend sẵn sàng, chỉ cần:

1. Uncomment các dòng API call thực tế
2. Comment hoặc xóa các dòng mock data

Ví dụ trong `Vehicles.tsx`:

```typescript
// Thay đổi từ:
const { mockVehicles } = await import("@/mocks/vehicles.mock")
setVehicles(mockVehicles)

// Thành:
const data = await vehicleService.getAll()
setVehicles(data)
```

## Dữ liệu mẫu

### Vehicles (5 xe)
- 29A-12345, 29B-67890, 29A-11111, 29C-22222, 29A-33333
- Các trạng thái: active, maintenance
- Giấy tờ đầy đủ với ngày hết hạn khác nhau

### Drivers (6 lái xe)
- Nguyễn Văn A, Trần Văn B, Lê Văn C, Phạm Văn D, Hoàng Văn E, Vũ Văn F
- Các trạng thái: active, suspended
- Bằng lái với ngày hết hạn khác nhau

### Dispatch Records (10 records)
- Các trạng thái: in-station, permit-issued, paid, departed, invalid
- Thời gian được tạo động dựa trên ngày hiện tại
- Đầy đủ thông tin: biển số, lái xe, tuyến, giờ vào/ra

### Reports
- **Invoices**: 7 hóa đơn mẫu
- **Revenue**: Dữ liệu 7 ngày gần nhất với doanh thu, số xe, số giao dịch
- **Vehicle Logs**: Nhật trình xe
- **Station Activity**: Hoạt động ra vào bến
- **Invalid Vehicles**: Xe không đủ điều kiện

### Dashboard
- Stats: 24 xe trong bến, 156 xe xuất bến, 12.5M doanh thu, 3 xe không đủ điều kiện
- Chart: Dữ liệu lượt xe theo giờ (6h-17h)
- Warnings: 3 cảnh báo giấy tờ sắp hết hạn
- Recent Activity: 4 hoạt động gần đây

## Lưu ý

- Tất cả dates được tạo động để luôn có dữ liệu mới
- Một số dates sử dụng `Date.now() + X days` để tạo cảnh báo
- Mock data có thể được mở rộng dễ dàng bằng cách thêm items vào arrays

