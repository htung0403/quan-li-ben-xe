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
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    representative_name VARCHAR(100),
    contract_number VARCHAR(50),
    contract_start_date DATE,
    contract_end_date DATE,
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
    operator_id UUID REFERENCES operators(id) NOT NULL,
    seat_capacity INTEGER NOT NULL,
    manufacture_year INTEGER,
    chassis_number VARCHAR(50),
    engine_number VARCHAR(50),
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_operator ON vehicles(operator_id);
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_docs_vehicle ON vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_docs_expiry ON vehicle_documents(expiry_date);
CREATE INDEX idx_vehicle_docs_type ON vehicle_documents(document_type);

-- ============================================
-- 3. DRIVER MANAGEMENT
-- ============================================

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID REFERENCES operators(id) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    license_number VARCHAR(50) NOT NULL,
    license_class VARCHAR(10) NOT NULL,
    license_issue_date DATE,
    license_expiry_date DATE NOT NULL,
    health_certificate_expiry DATE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
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
    schedule_code VARCHAR(50) UNIQUE NOT NULL,
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

-- ============================================
-- 6. DISPATCH MANAGEMENT (CORE FEATURE)
-- ============================================

CREATE TABLE dispatch_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    schedule_id UUID REFERENCES schedules(id),
    route_id UUID REFERENCES routes(id) NOT NULL,
    
    -- Entry timestamps
    entry_time TIMESTAMP NOT NULL,
    entry_by UUID REFERENCES users(id),
    
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
    
    -- Payment
    payment_time TIMESTAMP,
    payment_amount DECIMAL(12, 2),
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'card')),
    invoice_number VARCHAR(50),
    payment_by UUID REFERENCES users(id),
    
    -- Departure order
    departure_order_time TIMESTAMP,
    passengers_departing INTEGER,
    departure_order_by UUID REFERENCES users(id),
    
    -- Exit
    exit_time TIMESTAMP,
    exit_by UUID REFERENCES users(id),
    
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

-- ============================================
-- 7. VIOLATION RECORDS
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
-- 8. SERVICE & PRICING
-- ============================================

CREATE TABLE service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service charges for each dispatch
CREATE TABLE service_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_record_id UUID REFERENCES dispatch_records(id) ON DELETE CASCADE,
    service_type_id UUID REFERENCES service_types(id),
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_charges_dispatch ON service_charges(dispatch_record_id);

-- ============================================
-- 9. FINANCIAL RECORDS
-- ============================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    dispatch_record_id UUID REFERENCES dispatch_records(id),
    operator_id UUID REFERENCES operators(id) NOT NULL,
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

-- ============================================
-- 10. AUDIT LOG
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
-- 11. SYSTEM SETTINGS
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

-- Insert default service types
INSERT INTO service_types (code, name, base_price, unit) VALUES
('STOP_FEE', 'Phí dừng đỗ', 50000, 'per_trip'),
('CLEANING', 'Phí vệ sinh', 20000, 'per_trip'),
('MANAGEMENT', 'Phí quản lý', 30000, 'per_trip')
ON CONFLICT (code) DO NOTHING;

-- Insert default violation types
INSERT INTO violation_types (code, name, severity) VALUES
('OVERLOAD', 'Chở quá số lượng khách quy định', 'high'),
('NO_LICENSE', 'Thiếu giấy tờ xe/lái xe', 'critical'),
('LATE_DEPARTURE', 'Xuất bến trễ giờ', 'low')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE dispatch_records IS 'Core table tracking vehicle entry, dispatch process, and exit from station';
COMMENT ON COLUMN dispatch_records.transport_order_code IS 'Mã vận lệnh - Required unique code from transport order document';
COMMENT ON COLUMN dispatch_records.current_status IS 'Tracks current stage in dispatch workflow';
COMMENT ON VIEW vehicles_in_station IS 'Real-time view of vehicles currently inside the station';
