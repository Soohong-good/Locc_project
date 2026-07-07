package com.example.locc.domain.file.service;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Component;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Component
public class PdfThumbnailGenerator {

    private static final int DEFAULT_DPI = 150;
    private static final int THUMBNAIL_WIDTH = 800;
    private static final float THUMBNAIL_QUALITY = 0.85f;

    /**
     * PDF 첫 페이지를 썸네일 이미지(JPEG)로 변환
     */
    public InputStream generateThumbnail(InputStream pdfInputStream) throws IOException {
        byte[] pdfBytes = pdfInputStream.readAllBytes();

        try (PDDocument document = PDDocument.load(pdfBytes)) {
            if (document.getNumberOfPages() == 0) {
                throw new IOException("PDF 문서에 페이지가 없습니다.");
            }

            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage image = renderer.renderImageWithDPI(0, DEFAULT_DPI);

            ByteArrayOutputStream thumbnailOutput = new ByteArrayOutputStream();
            Thumbnails.of(image)
                    .width(THUMBNAIL_WIDTH)
                    .outputFormat("jpg")
                    .outputQuality(THUMBNAIL_QUALITY)
                    .toOutputStream(thumbnailOutput);

            log.info("PDF 썸네일 생성 완료 - 원본: {}x{}, 썸네일: {}px width",
                    image.getWidth(), image.getHeight(), THUMBNAIL_WIDTH);

            return new ByteArrayInputStream(thumbnailOutput.toByteArray());

        } catch (IOException e) {
            log.error("PDF 썸네일 생성 실패", e);
            throw new IOException("PDF 썸네일 생성에 실패했습니다: " + e.getMessage(), e);
        }
    }
}
