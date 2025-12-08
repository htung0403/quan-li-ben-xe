-- ============================================
-- MOCK DATA FOR BUS STATION MANAGEMENT SYSTEM
-- ============================================

DO $$
DECLARE
    -- User IDs
    v_admin_id UUID;
    v_dispatcher_id UUID;
    v_accountant_id UUID;
    
    -- Operator IDs
    v_op_futa_id UUID;
    v_op_tb_id UUID;
    v_op_kumho_id UUID;
    
    -- Vehicle Type IDs (fetching existing)
    v_type_16_id UUID;
    v_type_29_id UUID;
    v_type_45_id UUID;
    v_type_sleeper_id UUID;
    
    -- Vehicle IDs
    v_veh_futa_1_id UUID;
    v_veh_futa_2_id UUID;
    v_veh_tb_1_id UUID;
    
    -- Driver IDs
    v_driver_futa_1_id UUID;
    v_driver_futa_2_id UUID;
    v_driver_tb_1_id UUID;
    
    -- Location IDs
    v_loc_hcm_id UUID;
    v_loc_dl_id UUID;
    v_loc_vt_id UUID;
    v_loc_ct_id UUID;
    
    -- Route IDs
    v_route_hcm_dl_id UUID;
    v_route_hcm_vt_id UUID;
    v_route_hcm_ct_id UUID;
    
    -- Schedule IDs
    v_sched_futa_dl_id UUID;
    v_sched_tb_dl_id UUID;
    
    -- Service Type IDs
    v_svc_stop_id UUID;
    v_svc_clean_id UUID;

BEGIN
    -- ============================================
    -- 1. USERS
    -- Password hash for '123456': $2b$10$3euPcmQFCiblsZeEu5s7p.9w.d.N.j.j.j.j.j.j.j.j.j.j.j (Example)
    -- ============================================
    
    -- Admin
    INSERT INTO users (username, password_hash, full_name, email, role, is_active)
    VALUES ('admin', '$2b$10$3euPcmQFCiblsZeEu5s7p.9w.d.N.j.j.j.j.j.j.j.j.j.j.j', 'System Administrator', 'admin@benxe.com', 'admin', true)
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_admin_id;
    
    -- Dispatcher
    INSERT INTO users (username, password_hash, full_name, email, role, is_active)
    VALUES ('dieudo', '$2b$10$3euPcmQFCiblsZeEu5s7p.9w.d.N.j.j.j.j.j.j.j.j.j.j.j', 'Nguyễn Văn Điều Độ', 'dieudo@benxe.com', 'dispatcher', true)
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_dispatcher_id;
    
    -- Accountant
    INSERT INTO users (username, password_hash, full_name, email, role, is_active)
    VALUES ('ketoan', '$2b$10$3euPcmQFCiblsZeEu5s7p.9w.d.N.j.j.j.j.j.j.j.j.j.j.j', 'Trần Thị Kế Toán', 'ketoan@benxe.com', 'accountant', true)
    ON CONFLICT (username) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_accountant_id;

    -- ============================================
    -- 2. OPERATORS
    -- ============================================
    
    INSERT INTO operators (name, code, tax_code, phone, email, address, representative_name, is_active)
    VALUES 
    ('Công ty CP Xe khách Phương Trang', 'FUTA', '0301234567', '19006067', 'lienhe@futabus.vn', '80 Trần Hưng Đạo, Q.1, TP.HCM', 'Nguyễn Hữu Luân', true)
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_op_futa_id;
    
    INSERT INTO operators (name, code, tax_code, phone, email, address, representative_name, is_active)
    VALUES 
    ('Công ty TNHH Thành Bưởi', 'THANHBUOI', '0309876543', '19006079', 'lienhe@thanhbuoi.com.vn', '266 Lê Hồng Phong, Q.5, TP.HCM', 'Lê Đức Thành', true)
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_op_tb_id;
    
    INSERT INTO operators (name, code, tax_code, phone, email, address, representative_name, is_active)
    VALUES 
    ('Công ty TNHH Vận tải Kumho Samco', 'KUMHO', '0305556667', '19006065', 'lienhe@kumhosamco.com.vn', '292 Đinh Bộ Lĩnh, Q.Bình Thạnh, TP.HCM', 'Park Song Hwa', true)
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_op_kumho_id;

    -- ============================================
    -- 3. VEHICLE TYPES (Fetching existing)
    -- ============================================
    
    SELECT id INTO v_type_16_id FROM vehicle_types WHERE name LIKE '%16 chỗ%' LIMIT 1;
    SELECT id INTO v_type_29_id FROM vehicle_types WHERE name LIKE '%29 chỗ%' LIMIT 1;
    SELECT id INTO v_type_45_id FROM vehicle_types WHERE name LIKE '%45 chỗ%' LIMIT 1;
    SELECT id INTO v_type_sleeper_id FROM vehicle_types WHERE name LIKE '%giường nằm%' LIMIT 1;

    -- ============================================
    -- 4. VEHICLES
    -- ============================================
    
    -- FUTA Vehicles
    INSERT INTO vehicles (plate_number, vehicle_type_id, operator_id, seat_capacity, bed_capacity, manufacture_year, color, is_active)
    VALUES ('51B-123.45', v_type_sleeper_id, v_op_futa_id, 0, 40, 2022, 'Cam', true)
    ON CONFLICT (plate_number) DO UPDATE SET is_active = true
    RETURNING id INTO v_veh_futa_1_id;
    
    INSERT INTO vehicles (plate_number, vehicle_type_id, operator_id, seat_capacity, bed_capacity, manufacture_year, color, is_active)
    VALUES ('51B-678.90', v_type_sleeper_id, v_op_futa_id, 0, 44, 2023, 'Cam', true)
    ON CONFLICT (plate_number) DO UPDATE SET is_active = true
    RETURNING id INTO v_veh_futa_2_id;
    
    -- Thanh Buoi Vehicles
    INSERT INTO vehicles (plate_number, vehicle_type_id, operator_id, seat_capacity, bed_capacity, manufacture_year, color, is_active)
    VALUES ('51B-111.22', v_type_sleeper_id, v_op_tb_id, 0, 34, 2023, 'Xanh', true)
    ON CONFLICT (plate_number) DO UPDATE SET is_active = true
    RETURNING id INTO v_veh_tb_1_id;

    -- ============================================
    -- 5. DRIVERS
    -- ============================================
    
    INSERT INTO drivers (operator_id, full_name, id_number, phone, license_number, license_class, license_expiry_date, is_active)
    VALUES (v_op_futa_id, 'Nguyễn Văn Tài', '079090123456', '0909123456', '790123456789', 'E', '2028-01-01', true)
    ON CONFLICT (id_number) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_driver_futa_1_id;
    
    INSERT INTO drivers (operator_id, full_name, id_number, phone, license_number, license_class, license_expiry_date, is_active)
    VALUES (v_op_futa_id, 'Trần Văn Xế', '079090654321', '0909654321', '790987654321', 'E', '2027-06-15', true)
    ON CONFLICT (id_number) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_driver_futa_2_id;
    
    INSERT INTO drivers (operator_id, full_name, id_number, phone, license_number, license_class, license_expiry_date, is_active)
    VALUES (v_op_tb_id, 'Lê Văn Lái', '079090112233', '0909112233', '790112233445', 'E', '2029-12-31', true)
    ON CONFLICT (id_number) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id INTO v_driver_tb_1_id;

    -- ============================================
    -- 6. LOCATIONS
    -- ============================================
    
    INSERT INTO locations (name, code, station_type, province, district, address)
    VALUES ('Bến xe Miền Đông Mới', 'BXMDI', 'Bến xe khách loại 1', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', '501 Hoàng Hữu Nam, P. Long Bình')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_loc_hcm_id;
    
    INSERT INTO locations (name, code, station_type, province, district, address)
    VALUES ('Bến xe Liên tỉnh Đà Lạt', 'BXDL', 'Bến xe khách loại 2', 'Lâm Đồng', 'TP. Đà Lạt', '01 Tô Hiến Thành, P.3')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_loc_dl_id;
    
    INSERT INTO locations (name, code, station_type, province, district, address)
    VALUES ('Bến xe Vũng Tàu', 'BXVT', 'Bến xe khách loại 2', 'Bà Rịa - Vũng Tàu', 'TP. Vũng Tàu', '192 Nam Kỳ Khởi Nghĩa, P. Thắng Tam')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_loc_vt_id;
    
    INSERT INTO locations (name, code, station_type, province, district, address)
    VALUES ('Bến xe Trung tâm Cần Thơ', 'BXCT', 'Bến xe khách loại 1', 'Cần Thơ', 'Q. Cái Răng', 'QL1A, P. Hưng Thạnh')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_loc_ct_id;

    -- ============================================
    -- 7. ROUTES
    -- ============================================
    
    INSERT INTO routes (route_code, route_name, origin_id, destination_id, distance_km, estimated_duration_minutes, planned_frequency)
    VALUES ('HCM-DL', 'TP.HCM - Đà Lạt', v_loc_hcm_id, v_loc_dl_id, 308, 480, '30 phút/chuyến')
    ON CONFLICT (route_code) DO UPDATE SET route_name = EXCLUDED.route_name
    RETURNING id INTO v_route_hcm_dl_id;
    
    INSERT INTO routes (route_code, route_name, origin_id, destination_id, distance_km, estimated_duration_minutes, planned_frequency)
    VALUES ('HCM-VT', 'TP.HCM - Vũng Tàu', v_loc_hcm_id, v_loc_vt_id, 96, 150, '15 phút/chuyến')
    ON CONFLICT (route_code) DO UPDATE SET route_name = EXCLUDED.route_name
    RETURNING id INTO v_route_hcm_vt_id;
    
    INSERT INTO routes (route_code, route_name, origin_id, destination_id, distance_km, estimated_duration_minutes, planned_frequency)
    VALUES ('HCM-CT', 'TP.HCM - Cần Thơ', v_loc_hcm_id, v_loc_ct_id, 169, 240, '30 phút/chuyến')
    ON CONFLICT (route_code) DO UPDATE SET route_name = EXCLUDED.route_name
    RETURNING id INTO v_route_hcm_ct_id;

    -- ============================================
    -- 8. SCHEDULES
    -- ============================================
    
    -- FUTA HCM-DL 08:00
    INSERT INTO schedules (route_id, operator_id, departure_time, frequency_type, effective_from, is_active)
    VALUES (v_route_hcm_dl_id, v_op_futa_id, '08:00:00', 'daily', CURRENT_DATE, true)
    ON CONFLICT (schedule_code) DO NOTHING
    RETURNING id INTO v_sched_futa_dl_id;
    
    -- Thanh Buoi HCM-DL 09:00
    INSERT INTO schedules (route_id, operator_id, departure_time, frequency_type, effective_from, is_active)
    VALUES (v_route_hcm_dl_id, v_op_tb_id, '09:00:00', 'daily', CURRENT_DATE, true)
    ON CONFLICT (schedule_code) DO NOTHING
    RETURNING id INTO v_sched_tb_dl_id;

    -- ============================================
    -- 9. DISPATCH RECORDS (Sample Transactions)
    -- ============================================
    
    -- Record 1: Completed trip (Departed)
    INSERT INTO dispatch_records (
        vehicle_id, driver_id, schedule_id, route_id,
        entry_time, entry_by,
        passenger_drop_time, passengers_arrived, passenger_drop_by,
        boarding_permit_time, planned_departure_time, transport_order_code, seat_count, permit_status, boarding_permit_by,
        payment_time, payment_amount, payment_method, invoice_number, payment_by,
        departure_order_time, passengers_departing, departure_order_by,
        exit_time, exit_by,
        current_status
    )
    VALUES (
        v_veh_futa_1_id, v_driver_futa_1_id, v_sched_futa_dl_id, v_route_hcm_dl_id,
        NOW() - INTERVAL '4 hours', v_dispatcher_id,
        NOW() - INTERVAL '3 hours 50 minutes', 15, v_dispatcher_id,
        NOW() - INTERVAL '3 hours 30 minutes', NOW() - INTERVAL '3 hours', 'LENH-001', 40, 'approved', v_dispatcher_id,
        NOW() - INTERVAL '3 hours 20 minutes', 150000, 'cash', 'HD-001', v_accountant_id,
        NOW() - INTERVAL '3 hours 5 minutes', 35, v_dispatcher_id,
        NOW() - INTERVAL '3 hours', v_dispatcher_id,
        'departed'
    );
    
    -- Record 2: In Station (Waiting for departure)
    INSERT INTO dispatch_records (
        vehicle_id, driver_id, schedule_id, route_id,
        entry_time, entry_by,
        passenger_drop_time, passengers_arrived, passenger_drop_by,
        boarding_permit_time, planned_departure_time, transport_order_code, seat_count, permit_status, boarding_permit_by,
        current_status
    )
    VALUES (
        v_veh_tb_1_id, v_driver_tb_1_id, v_sched_tb_dl_id, v_route_hcm_dl_id,
        NOW() - INTERVAL '1 hour', v_dispatcher_id,
        NOW() - INTERVAL '50 minutes', 10, v_dispatcher_id,
        NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes', 'LENH-002', 34, 'approved', v_dispatcher_id,
        'permit_issued'
    );
    
    -- Record 3: Just Entered
    INSERT INTO dispatch_records (
        vehicle_id, driver_id, schedule_id, route_id,
        entry_time, entry_by,
        current_status
    )
    VALUES (
        v_veh_futa_2_id, v_driver_futa_2_id, NULL, v_route_hcm_vt_id,
        NOW() - INTERVAL '10 minutes', v_dispatcher_id,
        'entered'
    );

END $$;
