package com.example.locc.domain.sermon.service;

import com.example.locc.domain.sermon.dto.request.SermonSearchCondition;
import com.example.locc.domain.sermon.dto.response.SermonDetailResponse;
import com.example.locc.domain.sermon.dto.response.SermonResponse;
import com.example.locc.domain.sermon.entity.Sermon;
import com.example.locc.domain.sermon.repository.SermonRepository;
import com.example.locc.domain.file.dto.FileDto;
import com.example.locc.domain.file.entity.File;
import com.example.locc.exception.SermonNotFoundException;
import com.example.locc.domain.file.service.FileQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    /**
     * 목록 조회
     */
    public Page<SermonResponse> findList(SermonSearchCondition condition) {
        log.debug("Finding sermon list with condition: {}", condition);
        
        Page<Sermon> sermons;
        
        if (condition.hasCategory() && condition.hasKeyword()) {
            // 카테고리 + 검색
            sermons = sermonRepository.searchByCategory(
                    condition.getCategory(),
                    condition.getKeyword(),
                    condition.toPageable()
            );
        } else if (condition.hasCategory()) {
            // 카테고리만
            sermons = sermonRepository.findByCategory(
                    condition.getCategory(),
                    condition.toPageable()
            );
        } else if (condition.hasKeyword()) {
            // 검색만
            sermons = sermonRepository.search(
                    condition.getKeyword(),
                    condition.toPageable()
            );
        } else {
            // 전체 목록
            sermons = sermonRepository.findList(condition.toPageable());
        }
        
        return sermons.map(SermonResponse::from);
    }

    /**
     * 상세 조회
     */
    public SermonDetailResponse findDetail(Long id) {
        log.debug("Finding sermon detail: {}", id);
        
        Sermon sermon = sermonRepository.findDetailById(id)
                .orElseThrow(() -> new SermonNotFoundException(id));
        
        // 파일 정보 조회
        List<FileDto> files = fileQueryService.getFilesByEntityWithUploader(
                File.EntityType.SERMON, id)
                .stream()
                .map(FileDto::fromEntity)
                .collect(Collectors.toList());
        
        return SermonDetailResponse.from(sermon, files);
    }

    /**
     * 최근 설교 조회 (N개)
     */
    public List<SermonResponse> findLatest(int limit) {
        log.debug("Finding latest {} sermons", limit);
        
        return sermonRepository.findLatest(PageRequest.of(0, limit))
                .stream()
                .map(SermonResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 카테고리별 최신 설교 조회 (N개)
     */
    public List<SermonResponse> findLatestByCategory(String category, int limit) {
        log.debug("Finding latest {} sermons by category: {}", limit, category);
        
        return sermonRepository.findByCategory(category, PageRequest.of(0, limit))
                .stream()
                .map(SermonResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * ID로 조회 (내부용)
     */
    Sermon findById(Long id) {
        return sermonRepository.findById(id)
                .orElseThrow(() -> new SermonNotFoundException(id));
    }

    /**
     * 전체 설교 개수 조회 (Admin용)
     */
    public Long countAll() {
        return sermonRepository.count();
    }

    /**
     * 최근 N일 이내 등록된 설교 개수 조회 (Admin용)
     */
    public Long countRecent(int days) {
        java.time.LocalDateTime since = java.time.LocalDateTime.now().minusDays(days);
        return sermonRepository.countByCreatedAtAfter(since);
    }
}
