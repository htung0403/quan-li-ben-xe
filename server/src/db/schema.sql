-- ============================================
-- BUS STATION MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Database: PostgreSQL 14+
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER MANAGEMENT
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'dispatcher', 'accountant', 'reporter', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. VEHICLE MANAGEMENT
-- ============================================

-- Operators (Transport Companies)
CREATE TABLE operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    tax_code VARCHAR(50),
    
    is_ticket_delegated BOOLEAN DEFAULT false,
    province VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    
    phone VARCHAR(20),
    email VARCHAR(100),
    representative_name VARCHAR(100),
    representative_position VARCHAR(100),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Types
CREATE TABLE vehicle_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type_id UUID REFERENCES vehicle_types(id),
    operator_id UUID REFERENCES operators(id),
    seat_capacity INTEGER NOT NULL DEFAULT 0,
    bed_capacity INTEGER DEFAULT 0,
    chassis_number VARCHAR(50),
    engine_number VARCHAR(50),
    image_url TEXT,
    
    -- New fields
    insurance_expiry_date DATE,
    inspection_expiry_date DATE,
    
    -- Cargo dimensions (m)
    cargo_length DECIMAL(10, 2),
    cargo_width DECIMAL(10, 2),
    cargo_height DECIMAL(10, 2),
    
    -- GPS Tracking
    gps_provider VARCHAR(100),
    gps_username VARCHAR(100),
    gps_password VARCHAR(100),
    
    -- Location
    province VARCHAR(100),
    
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_operator ON vehicles(operator_id);
CREATE INDEX idx_vehicles_province ON vehicles(province);
CREATE INDEX idx_vehicles_active ON vehicles(id) WHERE is_active = true;

-- Vehicle Documents
CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'registration', 'inspection', 'insurance', 'operation_permit', 'emblem'
    )),
    document_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE NOT NULL,
    issuing_authority VARCHAR(200),
    document_url TEXT,
    notes TEXT,
    updated_by UUID REFERENCES users(id), -- Người cập nhật giấy tờ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_docs_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_docs_expiry ON vehicle_documents(expiry_date);
CREATE INDEX idx_vehicle_docs_type ON vehicle_documents(document_type);
CREATE INDEX idx_vehicle_docs_updated_by ON vehicle_documents(updated_by);

-- Vehicle Badges (Phù hiệu xe)
CREATE TABLE vehicle_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    file_code VARCHAR(50), -- MaHoSo
    badge_type VARCHAR(50) NOT NULL, -- LoaiPH
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    
    -- Warning flag for duplicate plate number when issuing badge
    warn_duplicate_plate BOOLEAN DEFAULT false, -- CanhBaoTrungBienSoKhiCapPH
    
    -- References
    issuing_authority_id UUID REFERENCES operators(id), -- Ref_DonViCapPhuHieu
    business_license_ref VARCHAR(100), -- Ref_GPKD
    notification_ref VARCHAR(100), -- Ref_ThongBao
    route_id UUID REFERENCES routes(id), -- Ref_Tuyen
    bus_route_ref VARCHAR(100), -- Ref_TuyenBuyt
    
    -- Dates
    issue_date DATE NOT NULL, -- NgayCap
    expiry_date DATE NOT NULL, -- NgayHetHan
    renewal_due_date DATE, -- Hancap (hạn cấp lại)
    
    -- Issue Type and Renewal
    issue_type VARCHAR(20) CHECK (issue_type IN ('new', 'renewal', 'replacement')), -- LoaiCap
    renewal_reason TEXT, -- LyDoCapLai
    previous_badge_number VARCHAR(50), -- SoPhuHieuCu
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'expired', 'revoked', 'replaced', 'pending'
    )), -- TrangThai
    
    -- Email Notification
    email_notification_sent BOOLEAN DEFAULT false, -- GuiEmailbao
    
    -- Revocation
    revocation_decision VARCHAR(100), -- QDThuHoi
    revocation_reason TEXT, -- LyDoThuHoi
    revocation_date DATE, -- NgayThuHoi
    
    -- Replacement Vehicle
    replacement_vehicle_id UUID REFERENCES vehicles(id), -- XeThayThe / Xebithaythe
    
    -- Badge Appearance
    badge_color VARCHAR(50), -- MauPhuHieu
    
    -- Additional Information
    notes TEXT, -- GhiChu
    metadata JSONB, -- For storing additional reference documents
    
    -- Audit Fields
    created_by UUID REFERENCES users(id), -- User
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- ThoiGianNhap
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Flag for renewal reminder popup
    renewal_reminder_shown BOOLEAN DEFAULT false -- CanCapLaiPopup
);

CREATE INDEX idx_vehicle_badges_vehicle ON vehicle_badges(vehicle_id);
CREATE INDEX idx_vehicle_badges_number ON vehicle_badges(badge_number);
CREATE INDEX idx_vehicle_badges_status ON vehicle_badges(status);
CREATE INDEX idx_vehicle_badges_expiry ON vehicle_badges(expiry_date);
CREATE INDEX idx_vehicle_badges_issue_date ON vehicle_badges(issue_date);
CREATE INDEX idx_vehicle_badges_route ON vehicle_badges(route_id);
CREATE INDEX idx_vehicle_badges_issuing_authority ON vehicle_badges(issuing_authority_id);
CREATE INDEX idx_vehicle_badges_active ON vehicle_badges(vehicle_id, status) WHERE status = 'active';
-- Index for active badges sorted by expiry date (for expiring soon queries)
-- Note: Cannot use CURRENT_DATE in index predicate, but this index still helps with expiry_date filtering
CREATE INDEX idx_vehicle_badges_active_expiry ON vehicle_badges(expiry_date, status) WHERE status = 'active';

-- ============================================
-- 3. DRIVER MANAGEMENT
-- ============================================

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID REFERENCES operators(id) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    province VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    license_number VARCHAR(50) NOT NULL,
    license_class VARCHAR(10) NOT NULL,
    license_issue_date DATE,
    license_expiry_date DATE NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_operator ON drivers(operator_id);
CREATE INDEX idx_drivers_license ON drivers(license_number);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry_date);
CREATE INDEX idx_drivers_active ON drivers(id) WHERE is_active = true;

-- ============================================
-- 4. ROUTE MANAGEMENT
-- ============================================

-- Locations/Stations
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    station_type VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    province VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_province ON locations(province);

-- Routes
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_code VARCHAR(50) UNIQUE NOT NULL,
    route_name VARCHAR(200) NOT NULL,
    origin_id UUID REFERENCES locations(id) NOT NULL,
    destination_id UUID REFERENCES locations(id) NOT NULL,
    distance_km DECIMAL(10, 2),
    estimated_duration_minutes INTEGER,
    
    route_type VARCHAR(50),
    planned_frequency VARCHAR(200),
    boarding_point VARCHAR(200),
    journey_description TEXT,
    departure_times_description TEXT,
    rest_stops TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routes_code ON routes(route_code);
CREATE INDEX idx_routes_origin ON routes(origin_id);
CREATE INDEX idx_routes_destination ON routes(destination_id);

-- Route Stops (Intermediate stations)
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    stop_order INTEGER NOT NULL,
    distance_from_origin_km DECIMAL(10, 2),
    estimated_minutes_from_origin INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(route_id, stop_order)
);

CREATE INDEX idx_route_stops_route ON route_stops(route_id);

-- ============================================
-- 5. SCHEDULE MANAGEMENT
-- ============================================

CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_code VARCHAR(50) UNIQUE,
    route_id UUID REFERENCES routes(id) NOT NULL,
    operator_id UUID REFERENCES operators(id) NOT NULL,
    departure_time TIME NOT NULL,
    frequency_type VARCHAR(20) CHECK (frequency_type IN ('daily', 'weekly', 'specific_days')),
    days_of_week INTEGER[],
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_route ON schedules(route_id);
CREATE INDEX idx_schedules_operator ON schedules(operator_id);
CREATE INDEX idx_schedules_code ON schedules(schedule_code);

-- Function to generate schedule code automatically
CREATE OR REPLACE FUNCTION generate_schedule_code()
RETURNS TRIGGER AS $$
DECLARE
    route_code_val VARCHAR(50);
    operator_code_val VARCHAR(20);
    time_str VARCHAR(5);
    new_code VARCHAR(50);
    counter INTEGER := 1;
BEGIN
    -- Only generate code if schedule_code is NULL or empty
    IF NEW.schedule_code IS NOT NULL AND NEW.schedule_code != '' THEN
        RETURN NEW;
    END IF;
    
    -- Get route code
    SELECT route_code INTO route_code_val
    FROM routes WHERE id = NEW.route_id;
    
    -- Get operator code
    SELECT code INTO operator_code_val
    FROM operators WHERE id = NEW.operator_id;
    
    -- Format departure time as HHMM (remove seconds if present)
    time_str := SUBSTRING(REPLACE(NEW.departure_time::TEXT, ':', ''), 1, 4);
    
    -- Generate base code: BDG-{ROUTE_CODE}-{OPERATOR_CODE}-{HHMM}
    new_code := 'BDG-' || COALESCE(route_code_val, 'UNK') || '-' || 
                COALESCE(operator_code_val, 'UNK') || '-' || time_str;
    
    -- Ensure uniqueness by appending counter if needed
    WHILE EXISTS (
        SELECT 1 FROM schedules 
        WHERE schedule_code = new_code 
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) LOOP
        new_code := 'BDG-' || COALESCE(route_code_val, 'UNK') || '-' || 
                    COALESCE(operator_code_val, 'UNK') || '-' || time_str || '-' || LPAD(counter::TEXT, 2, '0');
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 999 THEN
            RAISE EXCEPTION 'Unable to generate unique schedule code after 999 attempts';
        END IF;
    END LOOP;
    
    NEW.schedule_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate schedule code before insert
CREATE TRIGGER generate_schedule_code_trigger
    BEFORE INSERT ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION generate_schedule_code();

-- ============================================
-- 6. SHIFT MANAGEMENT
-- ============================================

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shifts_active ON shifts(id) WHERE is_active = true;
CREATE UNIQUE INDEX idx_shifts_name ON shifts(name) WHERE is_active = true;

-- ============================================
-- 7. DISPATCH MANAGEMENT (CORE FEATURE)
-- ============================================

CREATE TABLE dispatch_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    schedule_id UUID REFERENCES schedules(id),
    route_id UUID REFERENCES routes(id),
    
    -- Entry timestamps
    entry_time TIMESTAMP NOT NULL,
    entry_by UUID REFERENCES users(id),
    entry_shift_id UUID REFERENCES shifts(id), -- Ca trực khi vào bến
    
    -- Passenger drop-off
    passenger_drop_time TIMESTAMP,
    passengers_arrived INTEGER,
    passenger_drop_by UUID REFERENCES users(id),
    
    -- Boarding permit
    boarding_permit_time TIMESTAMP,
    planned_departure_time TIMESTAMP,
    transport_order_code VARCHAR(100) UNIQUE,
    seat_count INTEGER,
    permit_status VARCHAR(20) CHECK (permit_status IN ('approved', 'rejected', 'pending')),
    rejection_reason TEXT,
    boarding_permit_by UUID REFERENCES users(id),
    permit_shift_id UUID REFERENCES shifts(id), -- Ca trực khi cấp phép
    
    -- Payment
    payment_time TIMESTAMP,
    payment_amount DECIMAL(12, 2),
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'card')),
    invoice_number VARCHAR(50),
    payment_by UUID REFERENCES users(id),
    payment_shift_id UUID REFERENCES shifts(id), -- Ca trực khi thanh toán
    
    -- Departure order
    departure_order_time TIMESTAMP,
    passengers_departing INTEGER,
    departure_order_by UUID REFERENCES users(id),
    departure_order_shift_id UUID REFERENCES shifts(id), -- Ca trực khi cấp lệnh xuất bến
    
    -- Exit
    exit_time TIMESTAMP,
    exit_by UUID REFERENCES users(id),
    exit_shift_id UUID REFERENCES shifts(id), -- Ca trực khi ra bến
    
    -- Status tracking
    current_status VARCHAR(30) NOT NULL DEFAULT 'entered' CHECK (current_status IN (
        'entered', 'passengers_dropped', 'permit_issued', 'permit_rejected', 
        'paid', 'departure_ordered', 'departed'
    )),
    
    -- Metadata
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dispatch_vehicle ON dispatch_records(vehicle_id);
CREATE INDEX idx_dispatch_driver ON dispatch_records(driver_id);
CREATE INDEX idx_dispatch_status ON dispatch_records(current_status);
CREATE INDEX idx_dispatch_entry_time ON dispatch_records(entry_time);
CREATE INDEX idx_dispatch_exit_time ON dispatch_records(exit_time);
CREATE INDEX idx_dispatch_transport_order ON dispatch_records(transport_order_code);
CREATE INDEX idx_dispatch_vehicle_status ON dispatch_records(vehicle_id, current_status) WHERE exit_time IS NULL;
CREATE INDEX idx_dispatch_date ON dispatch_records(DATE(entry_time));
CREATE INDEX idx_dispatch_entry_shift ON dispatch_records(entry_shift_id);
CREATE INDEX idx_dispatch_payment_shift ON dispatch_records(payment_shift_id);
CREATE INDEX idx_dispatch_departure_order_shift ON dispatch_records(departure_order_shift_id);

-- ============================================
-- 8. VIOLATION RECORDS
-- ============================================

CREATE TABLE violation_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_record_id UUID REFERENCES dispatch_records(id),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    violation_type_id UUID REFERENCES violation_types(id) NOT NULL,
    violation_date TIMESTAMP NOT NULL,
    description TEXT,
    resolution_status VARCHAR(20) CHECK (resolution_status IN ('pending', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_violations_dispatch ON violations(dispatch_record_id);
CREATE INDEX idx_violations_vehicle ON violations(vehicle_id);
CREATE INDEX idx_violations_status ON violations(resolution_status);

-- ============================================
-- 9. SERVICE & PRICING
-- ============================================

-- Services table - Bảng chính quản lý dịch vụ
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    tax_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (tax_percentage >= 0 AND tax_percentage <= 100),
    material_type VARCHAR(100) NOT NULL,
    use_quantity_formula BOOLEAN DEFAULT false,
    use_price_formula BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    auto_calculate_quantity BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    -- Thêm các trường từ service_types để hỗ trợ tính phí
    description TEXT,
    base_price DECIMAL(12, 2) DEFAULT 0, -- Giá cơ bản cho dịch vụ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_code ON services(code);
CREATE INDEX idx_services_active ON services(id) WHERE is_active = true;
CREATE INDEX idx_services_display_order ON services(display_order);

-- Service charges for each dispatch - Tham chiếu đến bảng services
CREATE TABLE service_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_record_id UUID REFERENCES dispatch_records(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) NOT NULL, -- Tham chiếu đến bảng services (bảng chính)
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_charges_dispatch ON service_charges(dispatch_record_id);
CREATE INDEX idx_service_charges_service ON service_charges(service_id);

-- Service formulas - Bảng quản lý biểu thức
-- Biểu thức có 2 loại: 'quantity' (Tính số lượng) và 'price' (Tính đơn giá)
CREATE TABLE service_formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Mã biểu thức
    name VARCHAR(200) NOT NULL, -- Tên biểu thức
    description TEXT, -- Ghi chú
    formula_type VARCHAR(50) NOT NULL CHECK (formula_type IN ('quantity', 'price')), 
    -- Loại biểu thức: 
    --   'quantity' = Tính số lượng
    --   'price' = Tính đơn giá
    formula_expression TEXT, -- Biểu thức công thức (có thể lưu dạng string hoặc JSON)
    is_active BOOLEAN DEFAULT true, -- Trạng thái
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_formulas_code ON service_formulas(code);
CREATE INDEX idx_service_formulas_type ON service_formulas(formula_type);
CREATE INDEX idx_service_formulas_active ON service_formulas(id) WHERE is_active = true;

-- Junction table để quản lý dịch vụ đang sử dụng biểu thức
-- Một dịch vụ có thể sử dụng 2 biểu thức: một cho tính số lượng và một cho tính đơn giá
CREATE TABLE service_formula_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    formula_id UUID REFERENCES service_formulas(id) ON DELETE CASCADE,
    usage_type VARCHAR(50) NOT NULL CHECK (usage_type IN ('quantity', 'price')), 
    -- Loại sử dụng:
    --   'quantity' = Dùng để tính số lượng
    --   'price' = Dùng để tính đơn giá
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, formula_id, usage_type)
);

CREATE INDEX idx_service_formula_usage_service ON service_formula_usage(service_id);
CREATE INDEX idx_service_formula_usage_formula ON service_formula_usage(formula_id);

-- Bảng service_types cũ - Đã được thay thế bằng bảng services
-- Có thể xóa bảng này sau khi migrate dữ liệu từ service_types sang services
-- CREATE TABLE service_types (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     code VARCHAR(20) UNIQUE NOT NULL,
--     name VARCHAR(100) NOT NULL,
--     description TEXT,
--     base_price DECIMAL(12, 2) NOT NULL,
--     unit VARCHAR(20),
--     is_active BOOLEAN DEFAULT true,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- ============================================
-- 10. FINANCIAL RECORDS
-- ============================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    dispatch_record_id UUID REFERENCES dispatch_records(id),
    operator_id UUID REFERENCES operators(id) NOT NULL,
    shift_id UUID REFERENCES shifts(id), -- Ca trực khi tạo hóa đơn
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_operator ON invoices(operator_id);
CREATE INDEX idx_invoices_status ON invoices(payment_status);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_invoices_shift ON invoices(shift_id);

-- ============================================
-- 11. AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- 12. SYSTEM SETTINGS
-- ============================================

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    data_type VARCHAR(20) CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dispatch_updated_at BEFORE UPDATE ON dispatch_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_badges_updated_at BEFORE UPDATE ON vehicle_badges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_formulas_updated_at BEFORE UPDATE ON service_formulas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for vehicle documents audit logging
CREATE OR REPLACE FUNCTION log_vehicle_document_update()
RETURNS TRIGGER AS $$
DECLARE
    old_values_json JSONB;
    new_values_json JSONB;
    vehicle_plate VARCHAR(20);
    document_label VARCHAR(100);
BEGIN
    -- Lấy biển số xe
    SELECT plate_number INTO vehicle_plate
    FROM vehicles
    WHERE id = NEW.vehicle_id;
    
    -- Tạo label cho loại giấy tờ
    document_label := CASE NEW.document_type
        WHEN 'registration' THEN 'Đăng ký xe'
        WHEN 'inspection' THEN 'Đăng kiểm'
        WHEN 'insurance' THEN 'Bảo hiểm'
        WHEN 'operation_permit' THEN 'Phù hiệu'
        WHEN 'emblem' THEN 'Biển hiệu'
        ELSE NEW.document_type
    END;
    
    -- Tạo JSONB cho giá trị cũ (nếu là UPDATE)
    IF TG_OP = 'UPDATE' THEN
        old_values_json := jsonb_build_object(
            'document_type', OLD.document_type,
            'document_number', OLD.document_number,
            'issue_date', OLD.issue_date,
            'expiry_date', OLD.expiry_date,
            'issuing_authority', OLD.issuing_authority,
            'vehicle_id', OLD.vehicle_id,
            'vehicle_plate', (SELECT plate_number FROM vehicles WHERE id = OLD.vehicle_id)
        );
    END IF;
    
    -- Tạo JSONB cho giá trị mới
    new_values_json := jsonb_build_object(
        'document_type', NEW.document_type,
        'document_number', NEW.document_number,
        'issue_date', NEW.issue_date,
        'expiry_date', NEW.expiry_date,
        'issuing_authority', NEW.issuing_authority,
        'vehicle_id', NEW.vehicle_id,
        'vehicle_plate', vehicle_plate
    );
    
    -- Chỉ log những thay đổi thực sự (không log nếu không có thay đổi)
    IF TG_OP = 'UPDATE' AND (
        OLD.expiry_date IS DISTINCT FROM NEW.expiry_date OR
        OLD.issue_date IS DISTINCT FROM NEW.issue_date OR
        OLD.document_number IS DISTINCT FROM NEW.document_number OR
        OLD.issuing_authority IS DISTINCT FROM NEW.issuing_authority
    ) THEN
        -- Insert vào audit_logs
        INSERT INTO audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values,
            created_at
        ) VALUES (
            NEW.updated_by,
            CASE 
                WHEN OLD.expiry_date IS DISTINCT FROM NEW.expiry_date THEN 'UPDATE_DOCUMENT_EXPIRY'
                ELSE 'UPDATE_DOCUMENT'
            END,
            'vehicle_documents',
            NEW.id,
            old_values_json,
            new_values_json,
            (NOW() AT TIME ZONE 'UTC' + INTERVAL '7 hours')
        );
    ELSIF TG_OP = 'INSERT' THEN
        -- Log khi tạo mới giấy tờ
        INSERT INTO audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values,
            created_at
        ) VALUES (
            NEW.updated_by,
            'CREATE_DOCUMENT',
            'vehicle_documents',
            NEW.id,
            NULL,
            new_values_json,
            (NOW() AT TIME ZONE 'UTC' + INTERVAL '7 hours')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_documents_audit_trigger
    AFTER INSERT OR UPDATE ON vehicle_documents
    FOR EACH ROW
    EXECUTE FUNCTION log_vehicle_document_update();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active vehicles with valid documents
CREATE VIEW vehicles_status AS
SELECT 
    v.id,
    v.plate_number,
    v.seat_capacity,
    o.name AS operator_name,
    vt.name AS vehicle_type,
    COUNT(DISTINCT vd.id) FILTER (WHERE vd.expiry_date < CURRENT_DATE) AS expired_docs_count,
    v.is_active
FROM vehicles v
JOIN operators o ON v.operator_id = o.id
LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
LEFT JOIN vehicle_documents vd ON v.id = vd.vehicle_id
GROUP BY v.id, v.plate_number, v.seat_capacity, o.name, vt.name, v.is_active;

-- Vehicles currently in station
CREATE VIEW vehicles_in_station AS
SELECT 
    dr.id AS dispatch_id,
    v.plate_number,
    d.full_name AS driver_name,
    r.route_name,
    dr.entry_time,
    dr.current_status,
    dr.transport_order_code
FROM dispatch_records dr
JOIN vehicles v ON dr.vehicle_id = v.id
JOIN drivers d ON dr.driver_id = d.id
JOIN routes r ON dr.route_id = r.id
WHERE dr.exit_time IS NULL
ORDER BY dr.entry_time DESC;

-- Daily dispatch summary
CREATE VIEW daily_dispatch_summary AS
SELECT 
    DATE(entry_time) AS dispatch_date,
    COUNT(*) AS total_dispatches,
    COUNT(*) FILTER (WHERE current_status = 'departed') AS departed_count,
    COUNT(*) FILTER (WHERE current_status = 'permit_rejected') AS rejected_count,
    SUM(payment_amount) AS total_revenue,
    SUM(passengers_departing) AS total_passengers
FROM dispatch_records
GROUP BY DATE(entry_time)
ORDER BY dispatch_date DESC;

-- Service formulas with usage count view
CREATE VIEW service_formulas_status AS
SELECT 
    sf.id,
    sf.code,
    sf.name,
    sf.description,
    sf.formula_type,
    sf.formula_expression,
    sf.is_active,
    COUNT(DISTINCT sfu.service_id) AS usage_count, -- Số lượng dịch vụ đang sử dụng
    STRING_AGG(DISTINCT s.name, ', ') AS used_by_services, -- Danh sách dịch vụ đang sử dụng
    sf.created_at,
    sf.updated_at
FROM service_formulas sf
LEFT JOIN service_formula_usage sfu ON sf.id = sfu.formula_id
LEFT JOIN services s ON sfu.service_id = s.id
GROUP BY sf.id, sf.code, sf.name, sf.description, sf.formula_type, sf.formula_expression, sf.is_active, sf.created_at, sf.updated_at
ORDER BY sf.code ASC;

-- Vehicle badges status view
CREATE VIEW vehicle_badges_status AS
SELECT 
    vb.id,
    vb.badge_number,
    vb.badge_type,
    v.plate_number,
    o.name AS operator_name,
    r.route_name,
    vb.issue_date,
    vb.expiry_date,
    vb.renewal_due_date,
    vb.status,
    vb.issue_type,
    CASE 
        WHEN vb.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN vb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'valid'
    END AS expiry_status,
    vb.renewal_reminder_shown,
    vb.created_at
FROM vehicle_badges vb
JOIN vehicles v ON vb.vehicle_id = v.id
LEFT JOIN operators o ON v.operator_id = o.id
LEFT JOIN routes r ON vb.route_id = r.id
ORDER BY vb.expiry_date ASC;

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Insert default vehicle types
INSERT INTO vehicle_types (name, description) VALUES
('Xe khách 16 chỗ', 'Xe khách loại nhỏ'),
('Xe khách 29 chỗ', 'Xe khách trung bình'),
('Xe khách 45 chỗ', 'Xe khách lớn'),
('Xe giường nằm', 'Xe khách giường nằm')
ON CONFLICT DO NOTHING;

-- Insert default services (thay thế service_types)
INSERT INTO services (code, name, base_price, unit, material_type, tax_percentage, display_order, is_active) VALUES
('STOP_FEE', 'Phí dừng đỗ', 50000, 'per_trip', 'Dịch vụ', 0, 1, true),
('CLEANING', 'Phí vệ sinh', 20000, 'per_trip', 'Dịch vụ', 0, 2, true),
('MANAGEMENT', 'Phí quản lý', 30000, 'per_trip', 'Dịch vụ', 0, 3, true)
ON CONFLICT (code) DO NOTHING;

-- Insert default violation types
INSERT INTO violation_types (code, name, severity) VALUES
('OVERLOAD', 'Chở quá số lượng khách quy định', 'high'),
('NO_LICENSE', 'Thiếu giấy tờ xe/lái xe', 'critical'),
('LATE_DEPARTURE', 'Xuất bến trễ giờ', 'low')
ON CONFLICT (code) DO NOTHING;

-- Insert default shifts
INSERT INTO shifts (name, start_time, end_time) VALUES
('Ca 1', '06:00:00', '14:00:00'),
('Ca 2', '14:00:00', '22:00:00'),
('Ca 3', '22:00:00', '06:00:00'),
('Hành chính', '07:30:00', '17:00:00')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE dispatch_records IS 'Core table tracking vehicle entry, dispatch process, and exit from station';
COMMENT ON COLUMN dispatch_records.transport_order_code IS 'Mã vận lệnh - Required unique code from transport order document';
COMMENT ON COLUMN dispatch_records.current_status IS 'Tracks current stage in dispatch workflow';
COMMENT ON VIEW vehicles_in_station IS 'Real-time view of vehicles currently inside the station';

COMMENT ON TABLE vehicle_badges IS 'Phù hiệu xe - Vehicle badges/emblems issued to vehicles for route operation';
COMMENT ON COLUMN vehicle_badges.badge_number IS 'Số phù hiệu - Unique badge number';
COMMENT ON COLUMN vehicle_badges.file_code IS 'Mã hồ sơ - File/case code for the badge application';
COMMENT ON COLUMN vehicle_badges.badge_type IS 'Loại phù hiệu - Type of badge (e.g., intercity, bus route, etc.)';
COMMENT ON COLUMN vehicle_badges.warn_duplicate_plate IS 'Cảnh báo trùng biển số khi cấp PH - Warning flag for duplicate plate number';
COMMENT ON COLUMN vehicle_badges.issue_type IS 'Loại cấp - Type of issue: new, renewal, or replacement';
COMMENT ON COLUMN vehicle_badges.status IS 'Trạng thái - Current status: active, expired, revoked, replaced, pending';
COMMENT ON COLUMN vehicle_badges.renewal_due_date IS 'Hạn cấp lại - Date when badge renewal is due';

COMMENT ON TABLE vehicle_documents IS 'Giấy tờ xe - Vehicle documents including registration, inspection, insurance, operation permit, and emblem';
COMMENT ON COLUMN vehicle_documents.updated_by IS 'Người cập nhật giấy tờ - User who last updated the document';
COMMENT ON FUNCTION log_vehicle_document_update() IS 'Trigger function tự động log vào audit_logs khi cập nhật hoặc tạo mới vehicle_documents';
