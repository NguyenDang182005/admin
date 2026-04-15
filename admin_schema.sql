-- Admin Schema Extension for booking_db
USE booking_db;

-- =============================================
-- Bảng Settings: Lưu cấu hình trang admin
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dữ liệu mặc định
INSERT IGNORE INTO settings (`key`, `value`) VALUES
('site_logo', 'https://placehold.co/200x60?text=Admin+Logo'),
('site_name', 'Booking Admin Panel'),
('contact_email', 'admin@booking.com');

-- =============================================
-- Bảng Galleries: Quản lý thư viện ảnh
-- =============================================
CREATE TABLE IF NOT EXISTS galleries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dữ liệu mẫu
INSERT IGNORE INTO galleries (url, title) VALUES
('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', 'Luxury Hotel Lobby'),
('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400', 'Landmark 81 View'),
('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 'Pool Area'),
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 'Deluxe Room'),
('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', 'Hotel Exterior'),
('https://images.unsplash.com/photo-1551882547-ff43c63faf76?w=400', 'Dining Area');

-- =============================================
-- Bảng Dynamic Prices: Quy tắc giá động
-- =============================================
CREATE TABLE IF NOT EXISTS dynamic_prices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_type VARCHAR(50) NOT NULL COMMENT 'ROOM, FLIGHT, CAR, ATTRACTION, TAXI',
    service_id BIGINT NOT NULL COMMENT 'ID của dịch vụ gốc',
    target_date DATE NOT NULL COMMENT 'Ngày áp dụng giá động',
    dynamic_price DECIMAL(15,2) NULL COMMENT 'Giá ghi đè (cố định)',
    multiplier DECIMAL(5,2) NULL COMMENT 'Hệ số nhân giá gốc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
