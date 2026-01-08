package com.example.locc.domain.file.service;

import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.file.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * File 조회 전용 서비스
 * - 읽기 전용 트랜잭션
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FileQueryService {

    private final FileRepository fileRepository;

    /**
     * 파일 조회 (ID로)
     */
    public File getFile(Long fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다. ID: " + fileId));
    }

    /**
     * 파일 조회 (업로더 정보 포함)
     */
    public File getFileWithUploader(Long fileId) {
        return fileRepository.findByIdWithUploader(fileId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다. ID: " + fileId));
    }

    /**
     * 특정 엔티티의 모든 파일 조회
     */
    public List<File> getFilesByEntity(File.EntityType entityType, Long entityId) {
        return fileRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * 특정 엔티티의 파일 조회 (업로더 정보 포함)
     */
    public List<File> getFilesByEntityWithUploader(File.EntityType entityType, Long entityId) {
        return fileRepository.findByEntityTypeAndEntityIdWithUploader(entityType, entityId);
    }

    /**
     * 특정 엔티티의 특정 카테고리 파일 조회
     */
    public List<File> getFilesByEntityAndCategory(
            File.EntityType entityType,
            Long entityId,
            File.FileCategory category
    ) {
        return fileRepository.findByEntityTypeAndEntityIdAndCategory(entityType, entityId, category);
    }

    /**
     * 파일 개수 조회
     */
    public long countByEntity(File.EntityType entityType, Long entityId) {
        return fileRepository.countByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * 여러 엔티티의 파일 개수를 한 번에 조회 (N+1 방지)
     * @return Map<entityId, count>
     */
    public java.util.Map<Long, Long> countByEntities(File.EntityType entityType, List<Long> entityIds) {
        if (entityIds == null || entityIds.isEmpty()) {
            return java.util.Collections.emptyMap();
        }
        
        List<Object[]> results = fileRepository.countByEntityTypeAndEntityIdIn(entityType, entityIds);
        
        return results.stream()
                .collect(java.util.stream.Collectors.toMap(
                    row -> (Long) row[0],      // entityId
                    row -> (Long) row[1]       // count
                ));
    }

    /**
     * 파일 리소스 로드 (다운로드용)
     */
    public Resource loadFileAsResource(Long fileId) {
        File file = getFile(fileId);

        try {
            Path filePath = Paths.get(file.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("파일을 읽을 수 없습니다: " + file.getOriginalFileName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 경로가 잘못되었습니다: " + file.getOriginalFileName(), e);
        }
    }
}
