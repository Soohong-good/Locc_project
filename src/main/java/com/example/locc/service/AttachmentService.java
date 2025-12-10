package com.example.locc.service;

import com.example.locc.entity.Attachment;
import com.example.locc.entity.Notice;
import com.example.locc.entity.User;
import com.example.locc.repository.AttachmentRepository;
import com.example.locc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Transactional
    public List<Attachment> saveAttachments(List<MultipartFile> files, Notice notice, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return saveAttachments(files, notice, user);
    }

    @Transactional
    public List<Attachment> saveAttachments(List<MultipartFile> files, Notice notice, User user) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        List<Attachment> attachments = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            try {
                String originalFilename = file.getOriginalFilename();
                String storedFilename = UUID.randomUUID().toString() + "_" + originalFilename;
                
                // 파일 저장 경로
                Path uploadPath = Paths.get(uploadDir, "notices");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(storedFilename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Attachment 엔티티 생성
                Attachment attachment = Attachment.builder()
                        .originalFileName(originalFilename)
                        .storedFileName(storedFilename)
                        .filePath(filePath.toString())
                        .fileSize(file.getSize())
                        .contentType(file.getContentType())
                        .type(Attachment.AttachmentType.NOTICE_FILE)
                        .notice(notice)
                        .uploadedBy(user)
                        .build();

                attachments.add(attachmentRepository.save(attachment));
                
                log.info("File uploaded successfully: {}", originalFilename);
            } catch (IOException e) {
                log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
                throw new RuntimeException("파일 업로드에 실패했습니다: " + file.getOriginalFilename());
            }
        }

        return attachments;
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("첨부파일을 찾을 수 없습니다."));

        try {
            Path filePath = Paths.get(attachment.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("파일을 찾을 수 없습니다: " + attachment.getOriginalFileName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일을 찾을 수 없습니다: " + attachment.getOriginalFileName(), e);
        }
    }

    @Transactional(readOnly = true)
    public Attachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("첨부파일을 찾을 수 없습니다."));
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        Attachment attachment = getAttachment(attachmentId);
        
        try {
            // 파일 삭제
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);
            
            // DB에서 삭제
            attachmentRepository.delete(attachment);
            
            log.info("File deleted successfully: {}", attachment.getOriginalFileName());
        } catch (IOException e) {
            log.error("Failed to delete file: {}", attachment.getOriginalFileName(), e);
            throw new RuntimeException("파일 삭제에 실패했습니다.");
        }
    }
}
