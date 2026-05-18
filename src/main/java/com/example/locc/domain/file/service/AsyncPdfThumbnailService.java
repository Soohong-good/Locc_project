package com.example.locc.domain.file.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

/**
 * PDF 썸네일을 비동기로 렌더링하는 전용 서비스.
 * FileCommandService에서 분리한 이유: @Async는 Spring AOP 프록시를 통해야 동작하므로
 * 동일 빈 내부 호출로는 적용되지 않는다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncPdfThumbnailService {

    private final PdfThumbnailGenerator pdfThumbnailGenerator;

    @Async
    public void renderAndSave(byte[] pdfBytes, Path thumbnailPath) {
        try {
            Files.createDirectories(thumbnailPath.getParent());
            var thumbnailStream = pdfThumbnailGenerator.generateThumbnail(new ByteArrayInputStream(pdfBytes));
            Files.copy(thumbnailStream, thumbnailPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("PDF 썸네일 비동기 생성 완료: {}", thumbnailPath.getFileName());
        } catch (IOException e) {
            log.error("PDF 썸네일 비동기 생성 실패: {}", thumbnailPath, e);
        }
    }
}
