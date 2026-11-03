-- 수련회/특강 세부 구분 (2026-11-03)
-- service_number: 1=수련회, 2=특강 — 제목에 '축제'가 있으면 수련회, 그 외 특강
-- 동기화 코드(SermonYouTubeSyncService)와 같은 규칙. 구분이 비어 있는 기존 행만 채운다.
UPDATE sermon
SET service_number = CASE WHEN title LIKE '%축제%' THEN 1 ELSE 2 END
WHERE category = '수련회특강'
  AND service_number IS NULL;

SELECT service_number, COUNT(*) FROM sermon WHERE category = '수련회특강' GROUP BY service_number;
