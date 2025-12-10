package com.example.locc.controller.api;

import com.example.locc.entity.Attachment;
import com.example.locc.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        log.info("Downloading attachment: {}", id);

        Attachment attachment = attachmentService.getAttachment(id);
        Resource resource = attachmentService.loadFileAsResource(id);

        String contentType = attachment.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        // 파일명 인코딩 (한글 파일명 지원)
        String encodedFilename;
        try {
            encodedFilename = URLEncoder.encode(attachment.getOriginalFileName(), StandardCharsets.UTF_8.toString())
                    .replaceAll("\\+", "%20");
        } catch (UnsupportedEncodingException e) {
            encodedFilename = attachment.getOriginalFileName();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + encodedFilename + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        log.info("Deleting attachment: {}", id);
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok().build();
    }
}
