package com.example.locc.domain.department.repository;

import com.example.locc.domain.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByCode(String code);

    /** 실제 사역 부서만 조회 (교회 갤러리용 church 의사(擬似) 부서 제외) */
    List<Department> findAllByCodeNot(String code);
}
