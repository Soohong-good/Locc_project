package com.example.locc.domain.staff.service;

import com.example.locc.config.CacheConfig;
import com.example.locc.domain.staff.dto.command.StaffCreateCommand;
import com.example.locc.domain.staff.dto.command.StaffUpdateCommand;
import com.example.locc.domain.staff.dto.response.StaffResponse;
import com.example.locc.domain.staff.entity.Staff;
import com.example.locc.domain.staff.repository.StaffRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Staff 명령 전용 서비스
 * - CUD 작업만 처리
 * - 트랜잭션 관리
 * - Command 객체만 받음 (Request 받지 않음)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class StaffCommandService {

    private final StaffRepository staffRepository;
    private final StaffQueryService staffQueryService;
    private final UserRepository userRepository;

    /**
     * Staff 생성
     */
    @CacheEvict(value = CacheConfig.CACHE_STAFF, allEntries = true)
    public StaffResponse create(StaffCreateCommand command) {
        log.debug("Creating staff: {}", command.getName());

        // 권한 검증
        User user = findUserByEmail(command.getCreatedByEmail());
        validateAdminPermission(user);

        // 담임목사 설정 시 기존 담임목사 해제
        if (Boolean.TRUE.equals(command.getIsSeniorPastor())) {
            unsetAllSeniorPastors();
        }

        // Entity 생성 (팩토리 메서드 사용)
        Staff staff = Staff.create(command);
        Staff savedStaff = staffRepository.save(staff);

        return StaffResponse.from(savedStaff);
    }

    /**
     * Staff 수정
     */
    @CacheEvict(value = CacheConfig.CACHE_STAFF, allEntries = true)
    public StaffResponse update(StaffUpdateCommand command) {
        log.debug("Updating staff: {}", command.getStaffId());

        // Staff 조회
        Staff staff = staffQueryService.findEntityById(command.getStaffId());

        // 권한 검증
        User user = findUserByEmail(command.getUpdatedByEmail());
        validateModifyPermission(staff, user);

        // 담임목사 설정 시 기존 담임목사 해제
        if (Boolean.TRUE.equals(command.getIsSeniorPastor()) && !staff.getIsSeniorPastor()) {
            unsetAllSeniorPastors();
        }

        // 수정 (Entity 메서드 사용)
        staff.update(command);

        return StaffResponse.from(staff);
    }

    /**
     * Staff 삭제
     */
    @CacheEvict(value = CacheConfig.CACHE_STAFF, allEntries = true)
    public void delete(Long staffId, String email) {
        log.debug("Deleting staff: {}", staffId);

        Staff staff = staffQueryService.findEntityById(staffId);
        User user = findUserByEmail(email);

        // 권한 검증
        validateModifyPermission(staff, user);

        // Staff 삭제
        staffRepository.delete(staff);
    }

    /**
     * 이미지 업데이트
     */
    @CacheEvict(value = CacheConfig.CACHE_STAFF, allEntries = true)
    public StaffResponse updateImage(Long staffId, String imagePath, String email) {
        log.debug("Updating staff image: {}", staffId);

        Staff staff = staffQueryService.findEntityById(staffId);
        User user = findUserByEmail(email);

        // 권한 검증
        validateModifyPermission(staff, user);

        // 이미지 업데이트
        staff.updateImage(imagePath);

        return StaffResponse.from(staff);
    }

    // ===== Private Helper Methods =====

    /**
     * 모든 담임목사 해제
     */
    private void unsetAllSeniorPastors() {
        staffRepository.findSeniorPastors()
                .forEach(Staff::unsetSeniorPastor);
    }

    /**
     * 사용자 조회
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }

    /**
     * 관리자 또는 운영자 권한 검증
     */
    private void validateAdminPermission(User user) {
        if (!user.isAdminOrOperator()) {
            throw new IllegalStateException("권한이 없습니다.");
        }
    }

    /**
     * 수정 권한 검증 (관리자만)
     */
    private void validateModifyPermission(Staff staff, User user) {
        if (!staff.canModify(user)) {
            throw new IllegalStateException("권한이 없습니다.");
        }
    }
}
