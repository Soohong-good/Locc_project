-- Training 도메인 테이블 생성
-- 작성일: 2026-01-27

-- 훈련 프로그램 테이블
CREATE TABLE training (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '훈련명',
    description TEXT COMMENT '훈련 설명',
    start_date DATE NOT NULL COMMENT '시작일',
    end_date DATE NOT NULL COMMENT '종료일',
    application_deadline DATETIME NOT NULL COMMENT '신청 마감일시',
    training_fee INT NOT NULL DEFAULT 0 COMMENT '훈련비',
    max_participants INT NOT NULL COMMENT '정원',
    status VARCHAR(20) NOT NULL COMMENT '상태: OPEN, CLOSED, COMPLETED',
    created_by BINARY(16) COMMENT '생성자 ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status_deadline (status, application_deadline),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='훈련 프로그램';

-- 훈련 신청서 테이블
CREATE TABLE training_application (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    training_id BIGINT NOT NULL COMMENT '훈련 ID',
    user_id BINARY(16) NOT NULL COMMENT '신청자 ID',
    phone VARCHAR(20) NOT NULL COMMENT '연락처',
    applied_at DATETIME NOT NULL COMMENT '신청일시',
    
    -- 납부 관련
    payment_status VARCHAR(20) NOT NULL COMMENT '납부 상태: PENDING, PAID, CONFIRMED',
    payment_method VARCHAR(20) COMMENT '납부 방법: BANK, CASH',
    paid_at DATETIME COMMENT '납부 완료 일시',
    depositor_name VARCHAR(50) COMMENT '입금자명',
    confirmed_at DATETIME COMMENT '확인 완료 일시',
    confirmed_by BINARY(16) COMMENT '확인한 관리자 ID',
    admin_note TEXT COMMENT '관리자 메모',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_training_user (training_id, user_id),
    INDEX idx_training_status (training_id, payment_status),
    INDEX idx_user (user_id),
    INDEX idx_paid_at (payment_status, paid_at),
    
    FOREIGN KEY (training_id) REFERENCES training(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='훈련 신청서';
