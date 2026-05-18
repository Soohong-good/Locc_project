package com.example.locc.domain.application.service;

import com.example.locc.domain.application.dto.request.FacilitySearchCondition;
import com.example.locc.domain.application.dto.response.FacilityCategoryResponse;
import com.example.locc.domain.application.dto.response.FacilityApplicationDetailResponse;
import com.example.locc.domain.application.dto.response.FacilityApplicationResponse;
import com.example.locc.domain.application.entity.FacilityApplication;
import com.example.locc.domain.application.repository.FacilityApplicationRepository;
import com.example.locc.domain.application.repository.FacilityCategoryRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FacilityQueryService {

    private final FacilityApplicationRepository applicationRepository;
    private final FacilityCategoryRepository    categoryRepository;
    private final UserRepository                userRepository;

    public List<FacilityCategoryResponse> findActiveCategories() {
        return categoryRepository.findAllByIsActiveTrueOrderBySortOrderAsc()
                .stream().map(FacilityCategoryResponse::from).collect(Collectors.toList());
    }

    public List<FacilityCategoryResponse> findAllCategories() {
        return categoryRepository.findAll()
                .stream().map(FacilityCategoryResponse::from).collect(Collectors.toList());
    }

    public Page<FacilityApplicationResponse> findListForAdmin(FacilitySearchCondition condition) {
        return applicationRepository
                .findAllForAdmin(condition.getCategoryId(), condition.getStatus(), condition.toPageable())
                .map(FacilityApplicationResponse::from);
    }

    public Page<FacilityApplicationResponse> findMyList(String email, int page, int size) {
        User user = findUserByEmail(email);
        return applicationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(FacilityApplicationResponse::from);
    }

    public FacilityApplicationDetailResponse findDetail(Long id) {
        return FacilityApplicationDetailResponse.from(findEntityById(id));
    }

    /**
     * [SECURITY] IDOR 방지: 본인 신청서 또는 ADMIN/OPERATOR만 조회 허용
     */
    public FacilityApplicationDetailResponse findDetailForUser(Long id, String requestEmail) {
        FacilityApplication application = findEntityById(id);
        User requester = findUserByEmail(requestEmail);

        boolean isOwner = application.getUser().getEmail().equals(requestEmail);
        boolean isAdminOrOperator = requester.isAdminOrOperator();

        if (!isOwner && !isAdminOrOperator) {
            throw new AccessDeniedException("본인의 신청서만 조회할 수 있습니다.");
        }
        return FacilityApplicationDetailResponse.from(application);
    }

    public List<FacilityApplication> findAllForExcel(FacilitySearchCondition condition) {
        return applicationRepository.findAllForExcel(condition.getCategoryId(), condition.getStatus());
    }

    public FacilityApplication findEntityById(Long id) {
        return applicationRepository.findWithDetailById(id)
                .orElseThrow(() -> new NotFoundException("신청 내역을 찾을 수 없습니다. ID: " + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }
}
