-- 성경학교 데이터 삽입
-- 실행 방법: MariaDB 또는 MySQL 클라이언트에서 직접 실행

-- 기존 데이터 삭제 (선택사항)
-- DELETE FROM bible_school;

-- 2024 여름성경학교 데이터 삽입
INSERT INTO bible_school (
    title,X
    description,
    youtube_playlist_id,
    latest_video_id,
    latest_video_title,
    created_at,
    updated_at
) VALUES (
    '2024 여름성경학교',
    '2024년 여름 특별 성경학교 말씀과 찬양',
    'PLj3rgPIpeTF1wdADL6zgVKTO-_CxnFUVx',  -- 실제 재생목록 ID
    NULL,  -- 최신 영상 ID (자동 업데이트됨)
    NULL,  -- 최신 영상 제목 (자동 업데이트됨)
    NOW(),
    NOW()
);

-- 데이터 확인
SELECT * FROM bible_school ORDER BY created_at DESC;

-- =====================================================
-- 최신 영상 업데이트 방법
-- =====================================================
-- 
-- 방법 1: 자동 업데이트 (권장)
--   매주 토요일 낮 12시에 자동으로 최신 영상 업데이트
--
-- 방법 2: 수동 업데이트 (관리자)
--   POST /api/bibleschool/update-video
--   (관리자 로그인 후 실행)
--
-- =====================================================
