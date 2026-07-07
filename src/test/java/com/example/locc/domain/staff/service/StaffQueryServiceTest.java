package com.example.locc.domain.staff.service;

import com.example.locc.domain.staff.dto.command.StaffCreateCommand;
import com.example.locc.domain.staff.entity.Staff;
import com.example.locc.domain.staff.repository.StaffRepository;
import com.example.locc.exception.NotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

/**
 * StaffQueryService 단위 테스트 (Mockito, DB 불필요)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("StaffQueryService 단위 테스트")
class StaffQueryServiceTest {

    @Mock private StaffRepository staffRepository;

    @InjectMocks private StaffQueryService staffQueryService;

    private Staff newStaff() {
        return Staff.create(StaffCreateCommand.builder()
                .name("홍목사").englishName("Hong")
                .position(Staff.StaffPosition.PASTOR)
                .category(Staff.StaffCategory.MINISTER)
                .build());
    }

    @Test
    @DisplayName("전체 목록 조회 - 표시 순서대로 매핑해 반환한다")
    void findAll() {
        given(staffRepository.findAllOrdered()).willReturn(List.of(newStaff()));

        var result = staffQueryService.findAll();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("카테고리별 조회 - repository 결과를 매핑해 반환한다")
    void findByCategory() {
        given(staffRepository.findByCategory(Staff.StaffCategory.MINISTER)).willReturn(List.of(newStaff()));

        var result = staffQueryService.findByCategory(Staff.StaffCategory.MINISTER);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("직분별 조회 - repository 결과를 매핑해 반환한다")
    void findByPosition() {
        given(staffRepository.findByPosition(Staff.StaffPosition.PASTOR)).willReturn(List.of(newStaff()));

        var result = staffQueryService.findByPosition(Staff.StaffPosition.PASTOR);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("담임목사 조회 - repository 결과를 매핑해 반환한다")
    void findSeniorPastors() {
        given(staffRepository.findSeniorPastors()).willReturn(List.of(newStaff()));

        var result = staffQueryService.findSeniorPastors();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("설교자 목록 조회 - repository 결과를 매핑해 반환한다")
    void findPreachers() {
        given(staffRepository.findPreachers()).willReturn(List.of(newStaff()));

        var result = staffQueryService.findPreachers();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("ID 조회 - 존재하지 않으면 NotFoundException")
    void findById_notFound() {
        given(staffRepository.findById(1L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> staffQueryService.findById(1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("ID 조회 - 정상 케이스면 응답을 반환한다")
    void findById_success() {
        given(staffRepository.findById(1L)).willReturn(Optional.of(newStaff()));

        var response = staffQueryService.findById(1L);

        assertThat(response.getName()).isEqualTo("홍목사");
    }

    @Test
    @DisplayName("전체 개수 - repository.count()를 그대로 반환한다")
    void countAll() {
        given(staffRepository.count()).willReturn(5L);

        assertThat(staffQueryService.countAll()).isEqualTo(5L);
    }

    @Test
    @DisplayName("대시보드용 최신 목록 - limit 만큼만 잘라서 반환한다")
    void findLatestForDashboard_limitsResult() {
        given(staffRepository.findAll(any(org.springframework.data.domain.Sort.class)))
                .willReturn(List.of(newStaff(), newStaff(), newStaff()));

        var result = staffQueryService.findLatestForDashboard(2);

        assertThat(result).hasSize(2);
    }
}
