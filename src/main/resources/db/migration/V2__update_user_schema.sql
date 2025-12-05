-- 기존 users 테이블 백업
CREATE TABLE users_backup AS SELECT * FROM users;

-- users 테이블 재생성
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BINARY(16) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address VARCHAR(200),
    birth DATE,
    registration_path VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    user_type VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    INDEX idx_email (email)
);

-- refresh_tokens 테이블 수정 (user_id를 BINARY(16)으로 변경)
DROP TABLE IF EXISTS refresh_tokens;

CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BINARY(16) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- notice 테이블 created_by 컬럼 수정
ALTER TABLE notice 
    MODIFY COLUMN created_by BINARY(16);

-- sermon 테이블 created_by 컬럼 수정
ALTER TABLE sermon 
    MODIFY COLUMN created_by BINARY(16);
