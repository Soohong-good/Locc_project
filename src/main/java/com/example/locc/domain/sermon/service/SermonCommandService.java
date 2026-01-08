package com.example.locc.domain.sermon.service;

import com.example.locc.domain.sermon.dto.command.SermonCreateCommand;
import com.example.locc.domain.sermon.dto.command.SermonUpdateCommand;
import com.example.locc.domain.sermon.dto.response.SermonDetailResponse;
import com.example.locc.domain.sermon.entity.Sermon;
import com.example.locc.domain.sermon.repository.SermonRepository;
import com.example.locc.domain.file.dto.FileDto;
import com.example.locc.domain.file.entity.File;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Sermon 명령 전용 서비스
 * - CUD 작업만 처리
 * - 트랜잭션 관리
 * - Command 객체만 받음 (Request 받지 않음)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SermonCommandService {

    private final SermonRepository sermonRepository;
    private final SermonQueryService sermonQueryService;
    private final UserRepository userRepository;
    private final FileCommandService fileCommandService;
    private final FileQueryService fileQueryService;

    /**
     * Sermon 생성
     */
    public SermonDetailResponse create(SermonCreateCommand command) {
        log.info("Creating sermon: {} by {}", command.getTitle(), command.getCreatedByEmail());

        // 사용자 조회
        User author = findUserByEmail(command.getCreatedByEmail());

        // Entity 생성 (팩토리 메서드 사용)
        Sermon sermon = Sermon.create(command, author);
        Sermon savedSermon = sermonRepository.save(sermon);

        // 파일 업로드
        List<FileDto> files = uploadFiles(savedSermon.getId(), command);

        return SermonDetailResponse.from(savedSermon, files);
    }

    /**
     * Sermon 수정
     */
    public SermonDetailResponse update(SermonUpdateCommand command) {
        log.info("Updating sermon: {} by {}", command.getSermonId(), command.getUpdatedByEmail());

        // Sermon 조회
        Sermon sermon = sermonQueryService.findById(command.getSermonId());

        // 권한 검증
        User user = findUserByEmail(command.getUpdatedByEmail());
        validateModifyPermission(sermon, user);

        // 수정 (Entity 메서드 사용)
        sermon.update(command);

        // 파일 업로드
        List<FileDto> files = uploadFiles(sermon.getId(), command);

        return SermonDetailResponse.from(sermon, files);
    }

    /**
     * Sermon 삭제
     */
    public void delete(Long sermonId, String email) {
        log.info("Deleting sermon: {} by {}", sermonId, email);

        Sermon sermon = sermonQueryService.findById(sermonId);
        User user = findUserByEmail(email);

        // 권한 검증
        validateModifyPermission(sermon, user);

        // 파일 먼저 삭제
        fileCommandService.deleteAllByEntity(File.EntityType.SERMON, sermonId);

        // Sermon 삭제
        sermonRepository.delete(sermon);
    }

    // ===== Private Helper Methods =====

    /**
     * 파일 업로드 (생성용)
     */
    private List<FileDto> uploadFiles(Long sermonId, SermonCreateCommand command) {
        if (command.getFiles() == null || command.getFiles().isEmpty()) {
            return List.of();
        }

        return fileCommandService.uploadFiles(
                        command.getFiles(),
                        File.EntityType.SERMON,
                        sermonId,
                        File.FileCategory.ATTACHMENT,
                        command.getCreatedByEmail()
                )
                .stream()
                .map(FileDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 파일 업로드 (수정용)
     */
    private List<FileDto> uploadFiles(Long sermonId, SermonUpdateCommand command) {
        // 새 파일 업로드
        if (command.getFiles() != null && !command.getFiles().isEmpty()) {
            fileCommandService.uploadFiles(
                    command.getFiles(),
                    File.EntityType.SERMON,
                    sermonId,
                    File.FileCategory.ATTACHMENT,
                    command.getUpdatedByEmail()
            );
        }
        
        // 최종 파일 목록 조회 및 반환
        return fileQueryService.getFilesByEntityWithUploader(File.EntityType.SERMON, sermonId)
                .stream()
                .map(FileDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 사용자 조회
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));
    }

    /**
     * 수정 권한 검증
     */
    private void validateModifyPermission(Sermon sermon, User user) {
        if (!sermon.canModify(user)) {
            throw new IllegalStateException("권한이 없습니다.");
        }
    }
}
