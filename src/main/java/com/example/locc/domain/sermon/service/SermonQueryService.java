package com.example.locc.domain.sermon.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.sermon.dto.request.SermonSearchCondition;
import com.example.locc.domain.sermon.dto.response.SermonDetailResponse;
import com.example.locc.domain.sermon.dto.response.SermonPageResponse;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.entity.Sermon;
import com.example.locc.domain.sermon.repository.SermonRepository;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import com.example.locc.exception.InvalidInputException;
import com.example.locc.exception.NotFoundException;
import com.example.locc.domain.file.service.FileQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Sermon 조회 전용 서비스
 * - 읽기 전용 트랜잭션
 * - Command Service와 책임 분리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SermonQueryService {

    private final SermonRepository sermonRepository;
    private final FileQueryService fileQueryService;
    private final YouTubeService youTubeService;
    private final YouTubeProperties youTubeProperties;

    // ─────────────────────────────────────────────
    // 기본 조회
    // ─────────────────────────────────────────────

    public Page<SermonResponse> findList(SermonSearchCondition condition) {
        log.debug("Finding sermon list with condition: {}", condition);

        Page<Sermon> sermons;

        if (condition.hasCategory() && condition.hasKeyword()) {
            sermons = sermonRepository.searchByCategory(
                    condition.getCategory(), condition.getKeyword(), condition.toPageable());
        } else if (condition.hasCategory()) {
            sermons = sermonRepository.findByCategory(
                    condition.getCategory(), condition.toPageable());
        } else if (condition.hasKeyword()) {
            sermons = sermonRepository.search(condition.getKeyword(), condition.toPageable());
        } else {
            sermons = sermonRepository.findList(condition.toPageable());
        }

        return sermons.map(SermonResponse::from);
    }

    public SermonDetailResponse findDetail(Long id) {
        log.debug("Finding sermon detail: {}", id);
        Sermon sermon = sermonRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("설교를 찾을 수 없습니다. ID: " + id));
        List<AttachmentInfo> files = fileQueryService.getSermonAttachments(id);
        return SermonDetailResponse.from(sermon, files);
    }

    public List<SermonResponse> findLatest(int limit) {
        return sermonRepository.findLatest(PageRequest.of(0, limit))
                .stream().map(SermonResponse::from).collect(Collectors.toList());
    }

    public List<SermonResponse> findLatestByCategory(String category, int limit) {
        return sermonRepository.findByCategory(category, PageRequest.of(0, limit))
                .stream().map(SermonResponse::from).collect(Collectors.toList());
    }

    /**
     * 카테고리별 최신 설교 단건 조회 (없으면 null)
     */
    public SermonResponse findLatestOneByCategory(String category) {
        List<SermonResponse> result = findLatestByCategory(category, 1);
        return result.isEmpty() ? null : result.get(0);
    }

    public List<SermonResponse> findLatestByCategoryAndServiceNumber(String category, Integer serviceNumber, int limit) {
        return sermonRepository.findLatestByCategoryAndServiceNumber(
                        category, serviceNumber, PageRequest.of(0, limit))
                .stream().map(SermonResponse::from).collect(Collectors.toList());
    }

    public Page<SermonResponse> findByCategoryAndServiceNumber(String category, Integer serviceNumber, int page, int size) {
        return sermonRepository.findByCategoryAndServiceNumber(
                        category, serviceNumber, PageRequest.of(page, size))
                .map(SermonResponse::from);
    }

    public Page<SermonResponse> findByCategoryAndServiceNumberExact(String category, Integer serviceNumber, int page, int size) {
        return sermonRepository.findByCategoryAndServiceNumberExact(
                        category, serviceNumber, PageRequest.of(page, size))
                .map(SermonResponse::from);
    }

    public List<SermonResponse> findLatestByCategoryAndServiceNumberExact(String category, Integer serviceNumber, int limit) {
        return sermonRepository.findLatestByCategoryAndServiceNumberExact(
                        category, serviceNumber, PageRequest.of(0, limit))
                .stream().map(SermonResponse::from).collect(Collectors.toList());
    }

    public Page<SermonResponse> findPagedForAdmin(int page, int size) {
        log.debug("관리자 설교 목록 조회: page={}, size={}", page, size);
        return sermonRepository.findList(PageRequest.of(page, size))
                .map(SermonResponse::from);
    }

    Sermon findById(Long id) {
        return sermonRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("설교를 찾을 수 없습니다. ID: " + id));
    }

    public Long countAll() {
        return sermonRepository.count();
    }

    public Long countRecent(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return sermonRepository.countByCreatedAtAfter(since);
    }

    // ─────────────────────────────────────────────
    // 페이지 전용 통합 조회 (YouTube + 설교 데이터)
    // ─────────────────────────────────────────────

    /**
     * 주일오전 통합 조회 (1부 / 2부)
     */
    public SermonPageResponse getSundayMorningPage(int serviceNumber, int page, int size) {
        if (serviceNumber != 1 && serviceNumber != 2) {
            throw new InvalidInputException("지원하지 않는 예배 서비스 번호입니다. (허용: 1, 2)");
        }
        String playlistKey = "sunday-morning-" + serviceNumber;
        List<Map<String, String>> youtubeVideos = fetchYoutubeVideos(playlistKey);
        Page<SermonResponse> sermons = findByCategoryAndServiceNumber("주일오전", serviceNumber, page, size);
        List<SermonResponse> latestList = findLatestByCategoryAndServiceNumber("주일오전", serviceNumber, 1);

        return SermonPageResponse.builder()
                .sermons(sermons.getContent())
                .latestSermon(latestList.isEmpty() ? null : latestList.get(0))
                .youtubeVideos(youtubeVideos)
                .currentPage(page)
                .totalPages(sermons.getTotalPages())
                .totalItems(sermons.getTotalElements())
                .selectedServiceNumber(serviceNumber)
                .build();
    }

    /**
     * 주일오후 통합 조회
     */
    public SermonPageResponse getSundayAfternoonPage(int page, int size) {
        List<Map<String, String>> youtubeVideos = fetchYoutubeVideos("sunday-afternoon");
        SermonSearchCondition condition = SermonSearchCondition.builder()
                .category("주일오후").page(page).size(size).build();
        Page<SermonResponse> sermons = findList(condition);
        List<SermonResponse> latestList = findLatestByCategory("주일오후", 1);

        return SermonPageResponse.builder()
                .sermons(sermons.getContent())
                .latestSermon(latestList.isEmpty() ? null : latestList.get(0))
                .youtubeVideos(youtubeVideos)
                .currentPage(page)
                .totalPages(sermons.getTotalPages())
                .totalItems(sermons.getTotalElements())
                .build();
    }

    /**
     * 기타예배 통합 조회 (수요 / 금요)
     */
    public SermonPageResponse getWeekdayPage(String type, int page, int size) {
        if (!"wednesday".equals(type) && !"friday".equals(type)) {
            throw new InvalidInputException("지원하지 않는 예배 타입입니다. (허용: wednesday, friday)");
        }
        int serviceNumber = "wednesday".equals(type) ? 1 : 2;
        List<Map<String, String>> youtubeVideos = fetchYoutubeVideos(type);
        Page<SermonResponse> sermons = findByCategoryAndServiceNumber("기타예배", serviceNumber, page, size);
        List<SermonResponse> latestList = findLatestByCategoryAndServiceNumber("기타예배", serviceNumber, 1);

        return SermonPageResponse.builder()
                .sermons(sermons.getContent())
                .latestSermon(latestList.isEmpty() ? null : latestList.get(0))
                .youtubeVideos(youtubeVideos)
                .currentPage(page)
                .totalPages(sermons.getTotalPages())
                .totalItems(sermons.getTotalElements())
                .selectedType(type)
                .build();
    }

    /**
     * 훈련용메시지 통합 조회 (카테고리 탭 지원)
     * serviceNumber: 1=성경학교, 2=기초복음메시지, 3=하이델베르크 요리문답, 4=웨스트민스터 소요리문답
     */
    public SermonPageResponse getTrainingMessagePage(int serviceNumber, int page, int size) {
        if (serviceNumber < 1 || serviceNumber > 4) {
            throw new InvalidInputException("지원하지 않는 훈련 메시지 타입입니다. (허용: 1~4)");
        }
        Page<SermonResponse> sermons = findByCategoryAndServiceNumberExact("훈련용메시지", serviceNumber, page, size);
        List<SermonResponse> latestList = findLatestByCategoryAndServiceNumberExact("훈련용메시지", serviceNumber, 1);

        return SermonPageResponse.builder()
                .sermons(sermons.getContent())
                .latestSermon(latestList.isEmpty() ? null : latestList.get(0))
                .youtubeVideos(List.of())
                .currentPage(page)
                .totalPages(sermons.getTotalPages())
                .totalItems(sermons.getTotalElements())
                .selectedServiceNumber(serviceNumber)
                .build();
    }

    // ─────────────────────────────────────────────
    // private
    // ─────────────────────────────────────────────

    private List<Map<String, String>> fetchYoutubeVideos(String playlistKey) {
        String playlistId = youTubeProperties.getPlaylistId(playlistKey);
        if (playlistId == null || playlistId.isEmpty()) {
            return List.of();
        }
        return youTubeService.getLatestVideos(playlistId, 1);
    }
}
