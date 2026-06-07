package com.example.locc.domain.praisesheet.service;

import com.example.locc.domain.praisesheet.dto.command.PraiseSheetCreateCommand;
import com.example.locc.domain.praisesheet.dto.command.PraiseSheetUpdateCommand;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetDetailResponse;
import com.example.locc.domain.praisesheet.entity.PraiseSheet;
import com.example.locc.domain.praisesheet.repository.PraiseSheetRepository;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import com.example.locc.domain.file.service.FileCommandService;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.domain.user.entity.AreaType;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.domain.user.service.UserPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PraiseSheetCommandService {

    private final PraiseSheetRepository praiseSheetRepository;
    private final PraiseSheetQueryService praiseSheetQueryService;
    private final UserRepository userRepository;
    private final FileCommandService fileCommandService;
    private final FileQueryService fileQueryService;
    private final UserPermissionService userPermissionService;

    public PraiseSheetDetailResponse create(PraiseSheetCreateCommand command) {
        if (!userPermissionService.hasPermission(command.getCreatedByEmail(), AreaType.PRAISE_SHEET)) {
            throw new IllegalStateException("찬양악보 작성 권한이 없습니다.");
        }
        User author = findUser(command.getCreatedByEmail());
        PraiseSheet ps = PraiseSheet.create(command.withDefaults(), author);
        PraiseSheet saved = praiseSheetRepository.save(ps);
        List<AttachmentInfo> files = uploadFiles(saved.getId(), command.getFiles(), command.getCreatedByEmail());
        return PraiseSheetDetailResponse.from(saved, files);
    }

    public PraiseSheetDetailResponse update(PraiseSheetUpdateCommand command) {
        PraiseSheet ps = praiseSheetQueryService.findById(command.getPraiseSheetId());
        User user = findUser(command.getUpdatedByEmail());
        if (!ps.canModify(user)) throw new IllegalStateException("권한이 없습니다.");
        ps.update(command);
        List<AttachmentInfo> files = command.getFiles() == null || command.getFiles().isEmpty()
                ? fileQueryService.getPraiseSheetAttachments(ps.getId())
                : uploadFiles(ps.getId(), command.getFiles(), command.getUpdatedByEmail());
        return PraiseSheetDetailResponse.from(ps, files);
    }

    public void delete(Long id, String email) {
        PraiseSheet ps = praiseSheetQueryService.findById(id);
        User user = findUser(email);
        if (!ps.canModify(user)) throw new IllegalStateException("권한이 없습니다.");
        fileCommandService.deletePraiseSheetFiles(id);
        praiseSheetRepository.delete(ps);
    }

    public void increaseViews(Long id) {
        praiseSheetQueryService.findById(id).increaseViews();
    }

    public void togglePin(Long id, String email) {
        PraiseSheet ps = praiseSheetQueryService.findById(id);
        User user = findUser(email);
        if (!user.isAdmin()) throw new IllegalStateException("관리자만 고정할 수 있습니다.");
        ps.togglePin();
    }

    public String uploadContentImage(MultipartFile image, String email) {
        if (!userPermissionService.hasPermission(email, AreaType.PRAISE_SHEET)) {
            throw new IllegalStateException("찬양악보 작성 권한이 없습니다.");
        }
        return fileCommandService.uploadPraiseSheetContentImage(image, email);
    }

    private List<AttachmentInfo> uploadFiles(Long entityId, List<MultipartFile> files, String email) {
        if (files == null || files.isEmpty()) return List.of();
        return fileCommandService.uploadPraiseSheetAttachments(files, entityId, email)
                .stream().map(AttachmentInfo::from).collect(Collectors.toList());
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }
}
