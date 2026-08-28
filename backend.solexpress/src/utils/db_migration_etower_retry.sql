-- Migration: add eTower mapping and print error tables
CREATE TABLE IF NOT EXISTS ksn_etower_order_mapping (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ReferenceNo VARCHAR(255) NOT NULL,
    TrackingNo VARCHAR(255) NULL,
    OrderId VARCHAR(255) NOT NULL,
    UserId VARCHAR(255) NULL,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_reference_no (ReferenceNo),
    INDEX idx_tracking_no (TrackingNo),
    INDEX idx_order_id (OrderId)
);

CREATE TABLE IF NOT EXISTS ksn_etower_print_error (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ReferenceNo VARCHAR(255) NOT NULL,
    TrackingNo VARCHAR(255) NULL,
    OrderId VARCHAR(255) NOT NULL,
    ErrorMessage TEXT NULL,
    UserId VARCHAR(255) NULL,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_reference_no (ReferenceNo),
    INDEX idx_order_id (OrderId),
    INDEX idx_tracking_no (TrackingNo)
);
