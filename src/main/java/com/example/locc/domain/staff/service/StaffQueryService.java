package com.example.locc.domain.staff.service;

import com.example.locc.domain.staff.dto.response.StaffResponse;
import com.example.locc.domain.staff.entity.Staff;
import com.example.locc.domain.staff.repository.StaffRepository;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Staff 조회 전용 서비스
 * - 읽기 전용 트랜잭션
 * - Command Service와 책임 분리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffQueryService {

    private final StaffRepository staffRepository;

    /**
     * 전체 목록 조회 (표시 순서대로)
     */
    public List<StaffResponse> findAll() {
        log.debug("Finding all staff ordered by displayOrder");
        
        return staffRepository.findAllOrdered()
                .stream()
                .map(StaffResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 카테고리별 조회
     */
    public List<StaffResponse> findByCategory(Staff.StaffCategory category) {
        log.debug("Finding staff by category: {}", category);
        
        return staffRepository.findByCategory(category)
                .stream()
                .map(StaffResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 직분별 조회
     */
    public List<StaffResponse> findByPosition(Staff.StaffPosition position) {
        log.debug("Finding staff by position: {}", position);
        
        return staffRepository.findByPosition(position)
                .stream()
                .map(StaffResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 담임목사 조회
     */
    public List<StaffResponse> findSeniorPastors() {
        log.debug("Finding senior pastors");
        
        return staffRepository.findSeniorPastors()
                .stream()
                .map(StaffResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 설교자 목록 조회 (담임목사, 목사, 전도사)
     * - 담임목사는 "담임목사"로 표시
     * - 일반 목사는 "목사"로 표시
     * - 전도사는 "전도사"로 표시
     */
    public List<StaffResponse> findPreachers() {
        log.debug("Finding preachers (senior pastors, pastors, evangelists)");
        
        return staffRepository.findPreachers()
                .stream()
                .map(StaffResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * ID로 조회 (내부 및 API용)
     */
    public StaffResponse findById(Long id) {
        log.debug("Finding staff: {}", id);
        
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("교역자/직원을 찾을 수 없습니다. ID: " + id));
        
        return StaffResponse.from(staff);
    }

    /**
     * Entity 조회 (내부용 - CommandService에서 사용)
     */
    Staff findEntityById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("교역자/직원을 찾을 수 없습니다. ID: " + id));
    }
}
