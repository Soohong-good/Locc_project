package com.example.locc.domain.application.repository;

import com.example.locc.domain.application.entity.FacilityCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacilityCategoryRepository extends JpaRepository<FacilityCategory, Long> {
    List<FacilityCategory> findAllByIsActiveTrueOrderBySortOrderAsc();
}
