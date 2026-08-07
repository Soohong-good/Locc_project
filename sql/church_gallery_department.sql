-- 교회 자체 갤러리(그리스도사랑교회 > 갤러리) 저장소용 의사(擬似) 부서 등록
-- gallery_image.department_id가 NOT NULL이라 교회 갤러리도 부서 레코드 하나를 사용한다.
-- 이 코드('church')는 부서 목록 API·부서 갤러리 목록에서 제외되므로 사역 부서로 노출되지 않는다.
-- departments.code가 UNIQUE라 INSERT IGNORE로 재실행해도 안전하다.
INSERT IGNORE INTO departments (code, name, name_en, description)
VALUES ('church', '교회', 'Church', '그리스도사랑교회 갤러리 전용');

SELECT id, code, name, name_en FROM departments ORDER BY id;
