-- ============================================
-- MOCK DATA FOR BUS STATION MANAGEMENT SYSTEM
-- ============================================
-- This file contains sample data for testing and development
-- Run this AFTER running schema.sql
-- ============================================

-- ============================================
-- 1. USERS
-- ============================================
-- Password for all users: 123456
-- Hash generated with bcrypt (cost factor 10)
INSERT INTO users (username, password_hash, full_name, email, phone, role, is_active) VALUES
('admin', '$2a$10$SIuNpZEojZavMi1eF6WLieM2/uMA3nyGbUAUhpyXYNzbPCwR2J59S', 'Nguyễn Văn Admin', 'admin@benxe.vn', '0901234567', 'admin', true),
('dispatcher1', '$2a$10$SIuNpZEojZavMi1eF6WLieM2/uMA3nyGbUAUhpyXYNzbPCwR2J59S', 'Trần Thị Điều Hành', 'dispatcher1@benxe.vn', '0901234568', 'dispatcher', true),
('dispatcher2', '$2a$10$SIuNpZEojZavMi1eF6WLieM2/uMA3nyGbUAUhpyXYNzbPCwR2J59S', 'Lê Văn Phân Công', 'dispatcher2@benxe.vn', '0901234569', 'dispatcher', true),
('accountant1', '$2a$10$SIuNpZEojZavMi1eF6WLieM2/uMA3nyGbUAUhpyXYNzbPCwR2J59S', 'Phạm Thị Kế Toán', 'accountant@benxe.vn', '0901234570', 'accountant', true),
('reporter1', '$2a$10$SIuNpZEojZavMi1eF6WLieM2/uMA3nyGbUAUhpyXYNzbPCwR2J59S', 'Hoàng Văn Báo Cáo', 'reporter@benxe.vn', '0901234571', 'reporter', true)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 2. OPERATORS (Transport Companies)
-- ============================================
INSERT INTO operators (name, code, tax_code, address, phone, email, representative_name, contract_number, contract_start_date, contract_end_date, is_active) VALUES
('Công ty CP Vận tải Phương Trang', 'PT', '0101234567', '123 Đường ABC, Quận 1, TP.HCM', '0281234567', 'info@phuongtrang.vn', 'Nguyễn Văn A', 'HD001', '2024-01-01', '2024-12-31', true),
('Công ty TNHH Vận tải Hoàng Long', 'HL', '0101234568', '456 Đường XYZ, Quận 3, TP.HCM', '0281234568', 'info@hoanglong.vn', 'Trần Văn B', 'HD002', '2024-01-01', '2024-12-31', true),
('Công ty CP Vận tải Thành Bưởi', 'TB', '0101234569', '789 Đường DEF, Quận 5, TP.HCM', '0281234569', 'info@thanhbuoi.vn', 'Lê Văn C', 'HD003', '2024-01-01', '2024-12-31', true),
('Công ty TNHH Vận tải Mai Linh', 'ML', '0101234570', '321 Đường GHI, Quận 7, TP.HCM', '0281234570', 'info@mailinh.vn', 'Phạm Văn D', 'HD004', '2024-01-01', '2024-12-31', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 3. LOCATIONS (Stations)
-- ============================================
INSERT INTO locations (name, code, province, district, address, latitude, longitude, is_active) VALUES
('Bến xe Miền Đông', 'BXMĐ', 'TP.HCM', 'Quận Bình Thạnh', '292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh', 10.8022, 106.7147, true),
('Bến xe Miền Tây', 'BXMT', 'TP.HCM', 'Quận Bình Tân', '395 Kinh Dương Vương, Q.Bình Tân', 10.7520, 106.6080, true),
('Bến xe An Sương', 'BXAS', 'TP.HCM', 'Huyện Hóc Môn', 'QL22, Ấp Đông, Xã Tân Hiệp', 10.8800, 106.6000, true),
('Bến xe Đà Lạt', 'BXDL', 'Lâm Đồng', 'TP. Đà Lạt', '01 Phan Đình Phùng, P.1, TP.Đà Lạt', 11.9400, 108.4400, true),
('Bến xe Nha Trang', 'BXNT', 'Khánh Hòa', 'TP. Nha Trang', '01 Võ Thị Sáu, P.Vĩnh Hải, TP.Nha Trang', 12.2400, 109.1900, true),
('Bến xe Đà Nẵng', 'BXDN', 'Đà Nẵng', 'Quận Hải Châu', '01 Tôn Đức Thắng, P.Hòa Cường Bắc', 16.0544, 108.2022, true),
('Bến xe Huế', 'BXH', 'Thừa Thiên Huế', 'TP. Huế', '01 An Dương Vương, P.Phú Hậu, TP.Huế', 16.4637, 107.5909, true),
('Bến xe Hà Nội', 'BXHN', 'Hà Nội', 'Quận Hoàn Kiếm', '01 Nguyễn Thái Học, P.Tràng Tiền', 21.0285, 105.8542, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 4. DRIVERS
-- ============================================
-- Get operator IDs first, then insert drivers
INSERT INTO drivers (operator_id, full_name, id_number, date_of_birth, phone, email, address, license_number, license_class, license_issue_date, license_expiry_date, health_certificate_expiry, is_active)
SELECT 
    o.id,
    d.full_name,
    d.id_number,
    d.date_of_birth::DATE,
    d.phone,
    d.email,
    d.address,
    d.license_number,
    d.license_class,
    d.license_issue_date::DATE,
    d.license_expiry_date::DATE,
    d.health_certificate_expiry::DATE,
    d.is_active
FROM (
    VALUES
    ('PT', 'Nguyễn Văn Tài', '001234567890', '1980-05-15', '0901111111', 'tai.nguyen@phuongtrang.vn', '123 Đường A, Q.1, TP.HCM', 'LA123456', 'D', '2020-01-01', '2025-01-01', '2024-12-31', true),
    ('PT', 'Trần Văn Lái', '001234567891', '1985-08-20', '0901111112', 'lai.tran@phuongtrang.vn', '456 Đường B, Q.2, TP.HCM', 'LA123457', 'D', '2020-02-01', '2025-02-01', '2024-12-31', true),
    ('PT', 'Lê Văn Xe', '001234567892', '1982-03-10', '0901111113', 'xe.le@phuongtrang.vn', '789 Đường C, Q.3, TP.HCM', 'LA123458', 'D', '2020-03-01', '2025-03-01', '2024-12-31', true),
    ('HL', 'Phạm Văn Đường', '001234567893', '1988-11-25', '0902222221', 'duong.pham@hoanglong.vn', '321 Đường D, Q.4, TP.HCM', 'LA123459', 'D', '2020-04-01', '2025-04-01', '2024-12-31', true),
    ('HL', 'Hoàng Văn Chạy', '001234567894', '1983-07-18', '0902222222', 'chay.hoang@hoanglong.vn', '654 Đường E, Q.5, TP.HCM', 'LA123460', 'D', '2020-05-01', '2025-05-01', '2024-12-31', true),
    ('TB', 'Vũ Văn Bến', '001234567895', '1987-09-30', '0903333331', 'ben.vu@thanhbuoi.vn', '987 Đường F, Q.6, TP.HCM', 'LA123461', 'D', '2020-06-01', '2025-06-01', '2024-12-31', true),
    ('TB', 'Đỗ Văn Khách', '001234567896', '1984-12-05', '0903333332', 'khach.do@thanhbuoi.vn', '147 Đường G, Q.7, TP.HCM', 'LA123462', 'D', '2020-07-01', '2025-07-01', '2024-12-31', true),
    ('ML', 'Bùi Văn Vận', '001234567897', '1986-04-22', '0904444441', 'van.bui@mailinh.vn', '258 Đường H, Q.8, TP.HCM', 'LA123463', 'D', '2020-08-01', '2025-08-01', '2024-12-31', true)
) AS d(operator_code, full_name, id_number, date_of_birth, phone, email, address, license_number, license_class, license_issue_date, license_expiry_date, health_certificate_expiry, is_active)
JOIN operators o ON o.code = d.operator_code
ON CONFLICT (id_number) DO NOTHING;

-- ============================================
-- 5. VEHICLES
-- ============================================
INSERT INTO vehicles (plate_number, vehicle_type_id, operator_id, seat_capacity, manufacture_year, chassis_number, engine_number, color, is_active, notes)
SELECT 
    v.plate_number,
    vt.id,
    o.id,
    v.seat_capacity,
    v.manufacture_year,
    v.chassis_number,
    v.engine_number,
    v.color,
    v.is_active,
    v.notes
FROM (
    VALUES
    ('PT', 'Xe khách 16 chỗ', '51A-12345', 16, 2020, 'CH001', 'EN001', 'Trắng', true, NULL),
    ('PT', 'Xe khách 29 chỗ', '51A-12346', 29, 2021, 'CH002', 'EN002', 'Xanh', true, NULL),
    ('PT', 'Xe khách 45 chỗ', '51A-12347', 45, 2022, 'CH003', 'EN003', 'Đỏ', true, NULL),
    ('HL', 'Xe khách 29 chỗ', '51B-23456', 29, 2020, 'CH004', 'EN004', 'Vàng', true, NULL),
    ('HL', 'Xe khách 45 chỗ', '51B-23457', 45, 2021, 'CH005', 'EN005', 'Xanh', true, NULL),
    ('HL', 'Xe giường nằm', '51B-23458', 40, 2022, 'CH006', 'EN006', 'Trắng', true, NULL),
    ('TB', 'Xe khách 16 chỗ', '51C-34567', 16, 2020, 'CH007', 'EN007', 'Đỏ', true, NULL),
    ('TB', 'Xe khách 29 chỗ', '51C-34568', 29, 2021, 'CH008', 'EN008', 'Xanh', true, NULL),
    ('ML', 'Xe khách 45 chỗ', '51D-45678', 45, 2022, 'CH009', 'EN009', 'Trắng', true, NULL),
    ('ML', 'Xe giường nằm', '51D-45679', 40, 2021, 'CH010', 'EN010', 'Xanh', true, NULL)
) AS v(operator_code, vehicle_type_name, plate_number, seat_capacity, manufacture_year, chassis_number, engine_number, color, is_active, notes)
JOIN operators o ON o.code = v.operator_code
LEFT JOIN vehicle_types vt ON vt.name = v.vehicle_type_name
ON CONFLICT (plate_number) DO NOTHING;

-- ============================================
-- 6. VEHICLE DOCUMENTS
-- ============================================
INSERT INTO vehicle_documents (vehicle_id, document_type, document_number, issue_date, expiry_date, issuing_authority, document_url, notes)
SELECT 
    v.id,
    d.document_type,
    d.document_number,
    d.issue_date::DATE,
    d.expiry_date::DATE,
    d.issuing_authority,
    d.document_url,
    d.notes
FROM (
    VALUES
    ('51A-12345', 'registration', 'DK001', '2020-01-15', '2025-01-15', 'Cục Đăng kiểm', NULL, NULL),
    ('51A-12345', 'inspection', 'KT001', '2024-01-01', '2025-01-01', 'Trung tâm Đăng kiểm', NULL, NULL),
    ('51A-12345', 'insurance', 'BH001', '2024-01-01', '2025-01-01', 'Bảo hiểm Bảo Việt', NULL, NULL),
    ('51A-12346', 'registration', 'DK002', '2021-02-20', '2026-02-20', 'Cục Đăng kiểm', NULL, NULL),
    ('51A-12346', 'inspection', 'KT002', '2024-02-01', '2025-02-01', 'Trung tâm Đăng kiểm', NULL, NULL),
    ('51A-12347', 'registration', 'DK003', '2022-03-10', '2027-03-10', 'Cục Đăng kiểm', NULL, NULL),
    ('51B-23456', 'registration', 'DK004', '2020-04-05', '2025-04-05', 'Cục Đăng kiểm', NULL, NULL),
    ('51B-23457', 'registration', 'DK005', '2021-05-15', '2026-05-15', 'Cục Đăng kiểm', NULL, NULL),
    ('51B-23458', 'registration', 'DK006', '2022-06-20', '2027-06-20', 'Cục Đăng kiểm', NULL, NULL),
    ('51C-34567', 'registration', 'DK007', '2020-07-10', '2025-07-10', 'Cục Đăng kiểm', NULL, NULL),
    ('51C-34568', 'registration', 'DK008', '2021-08-25', '2026-08-25', 'Cục Đăng kiểm', NULL, NULL),
    ('51D-45678', 'registration', 'DK009', '2022-09-30', '2027-09-30', 'Cục Đăng kiểm', NULL, NULL),
    ('51D-45679', 'registration', 'DK010', '2021-10-15', '2026-10-15', 'Cục Đăng kiểm', NULL, NULL)
) AS d(plate_number, document_type, document_number, issue_date, expiry_date, issuing_authority, document_url, notes)
JOIN vehicles v ON v.plate_number = d.plate_number
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. ROUTES
-- ============================================
INSERT INTO routes (route_code, route_name, origin_id, destination_id, distance_km, estimated_duration_minutes, is_active)
SELECT 
    r.route_code,
    r.route_name,
    origin.id,
    dest.id,
    r.distance_km,
    r.estimated_duration_minutes,
    r.is_active
FROM (
    VALUES
    ('HCM-DL', 'TP.HCM - Đà Lạt', 'BXMĐ', 'BXDL', 300.5, 360, true),
    ('HCM-NT', 'TP.HCM - Nha Trang', 'BXMĐ', 'BXNT', 450.0, 540, true),
    ('HCM-DN', 'TP.HCM - Đà Nẵng', 'BXMĐ', 'BXDN', 960.0, 1200, true),
    ('HCM-H', 'TP.HCM - Huế', 'BXMĐ', 'BXH', 1030.0, 1320, true),
    ('HCM-HN', 'TP.HCM - Hà Nội', 'BXMĐ', 'BXHN', 1730.0, 2160, true),
    ('DL-HCM', 'Đà Lạt - TP.HCM', 'BXDL', 'BXMĐ', 300.5, 360, true),
    ('NT-HCM', 'Nha Trang - TP.HCM', 'BXNT', 'BXMĐ', 450.0, 540, true),
    ('DN-HCM', 'Đà Nẵng - TP.HCM', 'BXDN', 'BXMĐ', 960.0, 1200, true)
) AS r(route_code, route_name, origin_code, dest_code, distance_km, estimated_duration_minutes, is_active)
JOIN locations origin ON origin.code = r.origin_code
JOIN locations dest ON dest.code = r.dest_code
ON CONFLICT (route_code) DO NOTHING;

-- ============================================
-- 8. ROUTE STOPS
-- ============================================
INSERT INTO route_stops (route_id, location_id, stop_order, distance_from_origin_km, estimated_minutes_from_origin)
SELECT 
    rt.id,
    loc.id,
    rs.stop_order,
    rs.distance_from_origin_km,
    rs.estimated_minutes_from_origin
FROM (
    VALUES
    ('HCM-DL', 'BXAS', 1, 20.0, 30),
    ('HCM-NT', 'BXAS', 1, 20.0, 30),
    ('HCM-DN', 'BXAS', 1, 20.0, 30),
    ('HCM-DN', 'BXNT', 2, 450.0, 540),
    ('HCM-H', 'BXAS', 1, 20.0, 30),
    ('HCM-H', 'BXNT', 2, 450.0, 540),
    ('HCM-H', 'BXDN', 3, 960.0, 1200),
    ('HCM-HN', 'BXAS', 1, 20.0, 30),
    ('HCM-HN', 'BXNT', 2, 450.0, 540),
    ('HCM-HN', 'BXDN', 3, 960.0, 1200),
    ('HCM-HN', 'BXH', 4, 1030.0, 1320)
) AS rs(route_code, location_code, stop_order, distance_from_origin_km, estimated_minutes_from_origin)
JOIN routes rt ON rt.route_code = rs.route_code
JOIN locations loc ON loc.code = rs.location_code
ON CONFLICT (route_id, stop_order) DO NOTHING;

-- ============================================
-- 9. SCHEDULES
-- ============================================
INSERT INTO schedules (schedule_code, route_id, operator_id, departure_time, frequency_type, days_of_week, effective_from, effective_to, is_active)
SELECT 
    o.code || '-' || rt.route_code || '-' || REPLACE(s.departure_time, ':', '') AS schedule_code,
    rt.id,
    o.id,
    s.departure_time::TIME,
    s.frequency_type,
    s.days_of_week::integer[],
    s.effective_from::DATE,
    s.effective_to::DATE,
    s.is_active
FROM (
    VALUES
    ('PT', 'HCM-DL', '06:00:00', 'daily', NULL, '2024-01-01', NULL, true),
    ('PT', 'HCM-DL', '14:00:00', 'daily', NULL, '2024-01-01', NULL, true),
    ('HL', 'HCM-NT', '07:00:00', 'daily', NULL, '2024-01-01', NULL, true),
    ('HL', 'HCM-NT', '19:00:00', 'daily', NULL, '2024-01-01', NULL, true),
    ('TB', 'HCM-DN', '08:00:00', 'daily', NULL, '2024-01-01', NULL, true),
    ('ML', 'HCM-HN', '09:00:00', 'daily', NULL, '2024-01-01', NULL, true),
    ('ML', 'HCM-HN', '21:00:00', 'daily', NULL, '2024-01-01', NULL, true),
    ('PT', 'DL-HCM', '06:00:00', 'daily', NULL, '2024-01-01', NULL, true),
    ('HL', 'NT-HCM', '07:00:00', 'daily', NULL, '2024-01-01', NULL, true)
) AS s(operator_code, route_code, departure_time, frequency_type, days_of_week, effective_from, effective_to, is_active)
JOIN operators o ON o.code = s.operator_code
JOIN routes rt ON rt.route_code = s.route_code
ON CONFLICT (schedule_code) DO NOTHING;

-- ============================================
-- 10. DISPATCH RECORDS
-- ============================================
-- Insert some dispatch records with various statuses
INSERT INTO dispatch_records (
    vehicle_id, driver_id, schedule_id, route_id,
    entry_time, entry_by,
    passenger_drop_time, passengers_arrived, passenger_drop_by,
    boarding_permit_time, planned_departure_time, transport_order_code, seat_count, permit_status, boarding_permit_by,
    payment_time, payment_amount, payment_method, invoice_number, payment_by,
    departure_order_time, passengers_departing, departure_order_by,
    exit_time, exit_by,
    current_status, notes
)
SELECT 
    v.id,
    d.id,
    s.id,
    rt.id,
    dr.entry_time::TIMESTAMP,
    u_entry.id,
    dr.passenger_drop_time::TIMESTAMP,
    dr.passengers_arrived,
    u_drop.id,
    dr.boarding_permit_time::TIMESTAMP,
    dr.planned_departure_time::TIMESTAMP,
    dr.transport_order_code,
    dr.seat_count,
    dr.permit_status,
    u_permit.id,
    dr.payment_time::TIMESTAMP,
    dr.payment_amount,
    dr.payment_method,
    dr.invoice_number,
    u_payment.id,
    dr.departure_order_time::TIMESTAMP,
    dr.passengers_departing,
    u_departure.id,
    dr.exit_time::TIMESTAMP,
    u_exit.id,
    dr.current_status,
    dr.notes
FROM (
    VALUES
    -- Completed dispatch
    ('51A-12345', 'LA123456', 'PT', 'HCM-DL', '06:00:00', 
     '2024-12-01 05:45:00', 'dispatcher1',
     '2024-12-01 05:50:00', 15, 'dispatcher1',
     '2024-12-01 05:55:00', '2024-12-01 06:00:00', 'VL001', 16, 'approved', 'dispatcher1',
     '2024-12-01 05:58:00', 100000, 'cash', 'INV001', 'accountant1',
     '2024-12-01 06:00:00', 16, 'dispatcher1',
     '2024-12-01 06:05:00', 'dispatcher1',
     'departed', 'Chuyến đi thành công'),
    
    -- In progress dispatch
    ('51A-12346', 'LA123457', 'PT', 'HCM-DL', '14:00:00',
     '2024-12-15 13:30:00', 'dispatcher2',
     '2024-12-15 13:35:00', 20, 'dispatcher2',
     '2024-12-15 13:40:00', '2024-12-15 14:00:00', 'VL002', 29, 'approved', 'dispatcher2',
     '2024-12-15 13:45:00', 150000, 'bank_transfer', 'INV002', 'accountant1',
     NULL, NULL, NULL,
     NULL, NULL,
     'paid', 'Đang chờ lệnh xuất bến'),
    
    -- Just entered
    ('51B-23456', 'LA123459', 'HL', 'HCM-NT', '07:00:00',
     '2024-12-15 06:30:00', 'dispatcher1',
     NULL, NULL, NULL,
     NULL, NULL, NULL, NULL, NULL, NULL,
     NULL, NULL, NULL, NULL, NULL,
     NULL, NULL, NULL,
     NULL, NULL,
     'entered', 'Xe vừa vào bến')
) AS dr(plate_number, license_number, operator_code, route_code, schedule_time,
        entry_time, entry_by_username,
        passenger_drop_time, passengers_arrived, passenger_drop_by_username,
        boarding_permit_time, planned_departure_time, transport_order_code, seat_count, permit_status, boarding_permit_by_username,
        payment_time, payment_amount, payment_method, invoice_number, payment_by_username,
        departure_order_time, passengers_departing, departure_order_by_username,
        exit_time, exit_by_username,
        current_status, notes)
JOIN vehicles v ON v.plate_number = dr.plate_number
JOIN drivers d ON d.license_number = dr.license_number
LEFT JOIN operators o ON o.code = dr.operator_code
LEFT JOIN routes rt ON rt.route_code = dr.route_code
LEFT JOIN schedules s ON s.schedule_code = o.code || '-' || rt.route_code || '-' || REPLACE(dr.schedule_time, ':', '')
LEFT JOIN users u_entry ON u_entry.username = dr.entry_by_username
LEFT JOIN users u_drop ON u_drop.username = dr.passenger_drop_by_username
LEFT JOIN users u_permit ON u_permit.username = dr.boarding_permit_by_username
LEFT JOIN users u_payment ON u_payment.username = dr.payment_by_username
LEFT JOIN users u_departure ON u_departure.username = dr.departure_order_by_username
LEFT JOIN users u_exit ON u_exit.username = dr.exit_by_username
ON CONFLICT (transport_order_code) DO NOTHING;

-- ============================================
-- 11. SERVICE CHARGES
-- ============================================
INSERT INTO service_charges (dispatch_record_id, service_type_id, quantity, unit_price, total_amount)
SELECT 
    dr.id,
    st.id,
    sc.quantity,
    sc.unit_price,
    sc.total_amount
FROM (
    VALUES
    ('VL001', 'STOP_FEE', 1, 50000, 50000),
    ('VL001', 'CLEANING', 1, 20000, 20000),
    ('VL001', 'MANAGEMENT', 1, 30000, 30000),
    ('VL002', 'STOP_FEE', 1, 50000, 50000),
    ('VL002', 'CLEANING', 1, 20000, 20000),
    ('VL002', 'MANAGEMENT', 1, 30000, 30000)
) AS sc(transport_order_code, service_code, quantity, unit_price, total_amount)
JOIN dispatch_records dr ON dr.transport_order_code = sc.transport_order_code
JOIN service_types st ON st.code = sc.service_code
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. INVOICES
-- ============================================
INSERT INTO invoices (invoice_number, dispatch_record_id, operator_id, issue_date, due_date, subtotal, tax_amount, total_amount, payment_status, payment_date, notes)
SELECT 
    inv.invoice_number,
    dr.id,
    o.id,
    inv.issue_date::DATE,
    inv.due_date::DATE,
    inv.subtotal,
    inv.tax_amount,
    inv.total_amount,
    inv.payment_status,
    inv.payment_date::DATE,
    inv.notes
FROM (
    VALUES
    ('INV001', 'VL001', 'PT', '2024-12-01', '2024-12-31', 100000, 0, 100000, 'paid', '2024-12-01', NULL),
    ('INV002', 'VL002', 'HL', '2024-12-15', '2025-01-15', 150000, 0, 150000, 'pending', NULL, NULL)
) AS inv(invoice_number, transport_order_code, operator_code, issue_date, due_date, subtotal, tax_amount, total_amount, payment_status, payment_date, notes)
JOIN dispatch_records dr ON dr.transport_order_code = inv.transport_order_code
JOIN operators o ON o.code = inv.operator_code
ON CONFLICT (invoice_number) DO NOTHING;

-- ============================================
-- 13. VIOLATIONS
-- ============================================
INSERT INTO violations (dispatch_record_id, vehicle_id, driver_id, violation_type_id, violation_date, description, resolution_status, resolution_notes, recorded_by)
SELECT 
    dr.id,
    v.id,
    d.id,
    vt.id,
    vv.violation_date::TIMESTAMP,
    vv.description,
    vv.resolution_status,
    vv.resolution_notes,
    u.id
FROM (
    VALUES
    ('VL001', '51A-12345', 'LA123456', 'LATE_DEPARTURE', '2024-12-01 06:10:00', 'Xuất bến trễ 10 phút so với lịch trình', 'resolved', 'Đã cảnh báo tài xế', 'dispatcher1'),
    ('VL002', '51A-12346', 'LA123457', 'OVERLOAD', '2024-12-15 13:50:00', 'Chở quá 2 khách so với số ghế', 'pending', NULL, 'dispatcher2')
) AS vv(transport_order_code, plate_number, license_number, violation_code, violation_date, description, resolution_status, resolution_notes, recorded_by_username)
JOIN dispatch_records dr ON dr.transport_order_code = vv.transport_order_code
JOIN vehicles v ON v.plate_number = vv.plate_number
JOIN drivers d ON d.license_number = vv.license_number
JOIN violation_types vt ON vt.code = vv.violation_code
JOIN users u ON u.username = vv.recorded_by_username
ON CONFLICT DO NOTHING;

-- ============================================
-- 14. SYSTEM SETTINGS
-- ============================================
INSERT INTO system_settings (key, value, data_type, description, updated_by)
SELECT 
    ss.key,
    ss.value,
    ss.data_type,
    ss.description,
    u.id
FROM (
    VALUES
    ('station_name', 'Bến xe Miền Đông', 'string', 'Tên bến xe', 'admin'),
    ('station_address', '292 Đinh Bộ Lĩnh, P.26, Q.Bình Thạnh, TP.HCM', 'string', 'Địa chỉ bến xe', 'admin'),
    ('tax_rate', '0.1', 'number', 'Thuế suất (%)', 'admin'),
    ('auto_generate_invoice', 'true', 'boolean', 'Tự động tạo hóa đơn', 'admin')
) AS ss(key, value, data_type, description, updated_by_username)
JOIN users u ON u.username = ss.updated_by_username
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- COMPLETED
-- ============================================
-- Mock data has been inserted successfully!
-- You can now test the application with this sample data.

