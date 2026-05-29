package com.example.locc.domain.application.repository;

import com.example.locc.domain.application.entity.FacilityCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FacilityCategoryRepository extends JpaRepository<FacilityCategory, Long> {
    List<FacilityCategory> findAllByIsActiveTrueOrderBySortOrderAsc();
    Optional<FacilityCategory> findByName(String name);
}
