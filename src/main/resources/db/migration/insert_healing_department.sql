-- 치유부 데이터 삽입
-- 실행 방법: MariaDB 또는 MySQL 클라이언트에서 직접 실행

INSERT INTO departments (
    code,
    name,
    name_en,
    description,
    worship_time,
    worship_time_en,
    worship_location,
    worship_location_en,
    target_age,
    target_age_en,
    feature1,
    feature2,
    feature3,
    youtube_channel_id,
    latest_video_id,
    latest_video_title
) VALUES (
    'healing',
    '치유부',
    'Healing Ministry',
    '하나님의 사랑과 은혜로 상처받은 영혼을 치유하고 회복하는 사역',
    '주일 오후 3시',
    '3:00 PM Sunday',
    '본당',
    'Main Sanctuary',
    '성인',
    'Adults',
    '성경적 상담과 치유 프로그램',
    '소그룹 나눔과 기도 모임',
    '회복과 성장을 위한 체계적 과정',
    NULL,  -- YouTube 채널 ID (필요시 입력)
    NULL,  -- 최신 영상 ID
    NULL   -- 최신 영상 제목
);

-- 데이터 확인
SELECT * FROM departments WHERE code = 'healing';
