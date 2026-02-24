package com.example.locc.domain.file.util;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * PDF 썸네일 생성 유틸리티
 * - PDF 첫 페이지를 이미지로 변환
 * - 썸네일 크기 조정
 */
@Slf4j
@Component
public class PdfThumbnailGenerator {

    private static final int DEFAULT_DPI = 150; // PDF 렌더링 해상도
    private static final int THUMBNAIL_WIDTH = 800; // 썸네일 너비
    private static final float THUMBNAIL_QUALITY = 0.85f; // 썸네일 품질

    /**
     * PDF 첫 페이지를 썸네일 이미지로 변환
     * 
     * @param pdfInputStream PDF 파일 InputStream
     * @return 썸네일 이미지 InputStream (JPEG)
     * @throws IOException PDF 처리 실패
     */
    public InputStream generateThumbnail(InputStream pdfInputStream) throws IOException {
        // InputStream을 byte[]로 변환
        byte[] pdfBytes = pdfInputStream.readAllBytes();
        
        try (PDDocument document = PDDocument.load(pdfBytes)) {
            
            if (document.getNumberOfPages() == 0) {
                throw new IOException("PDF 문서에 페이지가 없습니다.");
            }

            // 첫 페이지 렌더링
            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage image = renderer.renderImageWithDPI(0, DEFAULT_DPI);

            // 썸네일 크기로 리사이징
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

    /**
     * PDF 첫 페이지를 BufferedImage로 변환
     * 
     * @param pdfInputStream PDF 파일 InputStream
     * @return BufferedImage
     * @throws IOException PDF 처리 실패
     */
    public BufferedImage renderFirstPage(InputStream pdfInputStream) throws IOException {
        byte[] pdfBytes = pdfInputStream.readAllBytes();
        
        try (PDDocument document = PDDocument.load(pdfBytes)) {
            
            if (document.getNumberOfPages() == 0) {
                throw new IOException("PDF 문서에 페이지가 없습니다.");
            }

            PDFRenderer renderer = new PDFRenderer(document);
            return renderer.renderImageWithDPI(0, DEFAULT_DPI);

        } catch (IOException e) {
            log.error("PDF 첫 페이지 렌더링 실패", e);
            throw new IOException("PDF 렌더링에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * BufferedImage를 JPEG InputStream으로 변환
     * 
     * @param image BufferedImage
     * @return JPEG InputStream
     * @throws IOException 변환 실패
     */
    public InputStream imageToInputStream(BufferedImage image) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", output);
        return new ByteArrayInputStream(output.toByteArray());
    }
}
