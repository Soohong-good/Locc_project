package com.example.locc.domain.sermon.service;

import com.example.locc.domain.sermon.dto.command.SermonCreateCommand;
import com.example.locc.domain.sermon.dto.command.SermonUpdateCommand;
import com.example.locc.domain.sermon.dto.response.SermonDetailResponse;
import com.example.locc.domain.sermon.entity.Sermon;
import com.example.locc.domain.sermon.repository.SermonRepository;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private final PdfTextExtractorService pdfTextExtractorService;

    /**
     * content가 비어있을 때만 true (PDF 자동 추출 대상)
     * Quill 에디터가 빈 상태에서도 {@code <p> </p>} 같은 HTML 태그+공백 문자를 만들어내는 경우가 있어
     * 단순 isBlank()로는 걸러지지 않음 — 태그를 제거한 순수 텍스트 기준으로 판단한다.
     */
    private boolean isBlank(String s) {
        if (s == null) return true;
        if (s.contains("<img")) return false;
        return s.replaceAll("<[^>]*>", "").replace("&nbsp;", " ").isBlank();
    }

    /**
     * Sermon 생성
     */
    public SermonDetailResponse create(SermonCreateCommand command) {
        log.debug("Creating sermon: {}", command.getTitle());

        // 사용자 조회
        User author = findUserByEmail(command.getCreatedByEmail());

        // Entity 생성 (팩토리 메서드 사용)
        Sermon sermon = Sermon.create(command, author);
        Sermon savedSermon = sermonRepository.save(sermon);

        // content 미입력 + PDF 첨부 시 자동 추출 (파일 업로드 전, 스트림 소비 방지)
        if (isBlank(command.getContent())) {
            savedSermon.applyExtractedContent(
                    pdfTextExtractorService.extractFromFirstPdf(command.getFiles()));
        }

        // 파일 업로드
        List<AttachmentInfo> files = uploadFiles(savedSermon.getId(), command);

        return SermonDetailResponse.from(savedSermon, files);
    }

    /**
     * Sermon 수정
     */
    public SermonDetailResponse update(SermonUpdateCommand command) {
        log.debug("Updating sermon: {}", command.getSermonId());

        // Sermon 조회
        Sermon sermon = sermonQueryService.findById(command.getSermonId());

        // 권한 검증
        User user = findUserByEmail(command.getUpdatedByEmail());
        validateModifyPermission(sermon, user);

        // 수정 (Entity 메서드 사용)
        sermon.update(command);

        // content 미입력 + PDF 첨부 시 자동 추출 (파일 업로드 전, 스트림 소비 방지)
        if (isBlank(command.getContent())) {
            sermon.applyExtractedContent(
                    pdfTextExtractorService.extractFromFirstPdf(command.getFiles()));
        }

        // 파일 업로드
        List<AttachmentInfo> files = uploadFiles(sermon.getId(), command);

        return SermonDetailResponse.from(sermon, files);
    }

    /**
     * Sermon 삭제
     */
    public void delete(Long sermonId, String email) {
        log.debug("Deleting sermon: {}", sermonId);

        Sermon sermon = sermonQueryService.findById(sermonId);
        User user = findUserByEmail(email);

        // 권한 검증
        validateModifyPermission(sermon, user);

        // 파일 먼저 삭제
        fileCommandService.deleteSermonFiles(sermonId);

        // Sermon 삭제
        sermonRepository.delete(sermon);
    }

    /**
     * 조회수 증가 (공지·주보·찬양악보와 동일하게 상세 진입 시 1회 호출)
     */
    public void increaseViews(Long sermonId) {
        Sermon sermon = sermonQueryService.findById(sermonId);
        sermon.increaseViews();
    }

    /**
     * 본문 이미지 업로드 (에디터용)
     */
    public String uploadContentImage(MultipartFile image, String email) {
        return fileCommandService.uploadSermonContentImage(image, email);
    }

    // ===== Private Helper Methods =====

    /**
     * 파일 업로드 (생성용)
     */
    private List<AttachmentInfo> uploadFiles(Long sermonId, SermonCreateCommand command) {
        if (command.getFiles() == null || command.getFiles().isEmpty()) {
            return List.of();
        }

        return fileCommandService.uploadSermonAttachments(
                        command.getFiles(),
                        sermonId,
                        command.getCreatedByEmail()
                )
                .stream()
                .map(AttachmentInfo::from)
                .collect(Collectors.toList());
    }

    /**
     * 파일 업로드 (수정용)
     */
    private List<AttachmentInfo> uploadFiles(Long sermonId, SermonUpdateCommand command) {
        if (command.getFiles() != null && !command.getFiles().isEmpty()) {
            fileCommandService.uploadSermonAttachments(
                    command.getFiles(),
                    sermonId,
                    command.getUpdatedByEmail()
            );
        }

        return fileQueryService.getSermonAttachments(sermonId);
    }

    /**
     * 사용자 조회
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
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
