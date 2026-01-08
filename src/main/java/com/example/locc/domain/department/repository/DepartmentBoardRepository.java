package com.example.locc.domain.department.repository;

import com.example.locc.domain.department.entity.Department;
import com.example.locc.domain.department.entity.DepartmentBoard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DepartmentBoardRepository extends JpaRepository<DepartmentBoard, Long> {
    
    @EntityGraph(attributePaths = {"author", "department"})
    Page<DepartmentBoard> findByDepartmentOrderByIsPinnedDescCreatedAtDesc(Department department, Pageable pageable);
    
    @EntityGraph(attributePaths = {"author", "department"})
    @Query("SELECT db FROM DepartmentBoard db WHERE db.id = :id")
    Optional<DepartmentBoard> findDetailById(@Param("id") Long id);
}
