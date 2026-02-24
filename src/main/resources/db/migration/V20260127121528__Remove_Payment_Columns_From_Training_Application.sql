-- 훈련 신청 테이블에서 납부 관련 컬럼 제거

ALTER TABLE training_application
    DROP COLUMN payment_status,
    DROP COLUMN payment_method,
    DROP COLUMN paid_at,
    DROP COLUMN depositor_name,
    DROP COLUMN confirmed_at,
    DROP COLUMN confirmed_by,
    DROP COLUMN admin_note;
