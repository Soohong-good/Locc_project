-- 종교개혁기념주일 1·2강을 주일오후 → 수련회/특강(특강)으로 이동 (2026-11-03)
-- 두 영상이 주일오후 재생목록에도 있어 주일오후로 먼저 등록됨 (videoId 중복 방지로 수련회특강엔 미등록)
-- 2강은 날짜 파싱 수정 전 동기화돼 업로드 기준 날짜(10/26)로 저장 → 10/25로 정정
UPDATE sermon
SET category = '수련회특강', service_number = 2, sermon_date = '2026-10-25'
WHERE youtube_video_id IN ('7kC9Bk_HyCQ', 'ZremwJRC4N0')
  AND category = '주일오후';

SELECT id, category, service_number, sermon_date, LEFT(title, 40) AS title
FROM sermon
WHERE youtube_video_id IN ('7kC9Bk_HyCQ', 'ZremwJRC4N0');
