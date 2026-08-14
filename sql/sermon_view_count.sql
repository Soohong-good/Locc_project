-- 설교 조회수 컬럼 추가
-- 운영 DB는 ddl-auto=validate라 컬럼이 없으면 애플리케이션이 기동에 실패한다.
-- 반드시 코드 배포(docker-compose build/up) 전에 먼저 실행할 것.
-- 기존 설교는 모두 0에서 시작한다.
ALTER TABLE sermon ADD COLUMN view_count INT NOT NULL DEFAULT 0;

SELECT COUNT(*) AS 전체설교, SUM(view_count) AS 조회수합계 FROM sermon;
