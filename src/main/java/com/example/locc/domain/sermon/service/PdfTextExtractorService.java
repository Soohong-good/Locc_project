package com.example.locc.domain.sermon.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 설교 PDF 녹취록 → 평문 텍스트 추출 서비스
 *
 * <p>PDF를 줄바꿈이 보존된 평문으로 추출한다. 구조화(HTML 변환)는 프론트 공용 유틸
 * {@code formatTranscript}(설교 상세·송구영신 공통)가 표시 시점에 단일 처리하므로
 * 백엔드는 텍스트 추출만 담당한다(파싱 규칙 중복 제거).
 *
 * <p>추출 실패 시 빈 문자열을 반환하며 업로드 자체는 성공 처리한다.
 */
@Slf4j
@Service
public class PdfTextExtractorService {

    /**
     * 첨부 목록에서 첫 번째 PDF를 찾아 평문 텍스트로 추출.
     * PDF가 없거나 추출 실패 시 빈 문자열 반환.
     */
    public String extractFromFirstPdf(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return "";
        for (MultipartFile file : files) {
            if (isPdf(file)) {
                return extractText(file);
            }
        }
        return "";
    }

    private boolean isPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) return false;
        String contentType = file.getContentType();
        if (contentType != null && contentType.equalsIgnoreCase("application/pdf")) return true;
        String name = file.getOriginalFilename();
        return name != null && name.toLowerCase().endsWith(".pdf");
    }

    private String extractText(MultipartFile pdf) {
        try (PDDocument document = PDDocument.load(pdf.getInputStream())) {
            // setSortByPosition(true)는 다단 컬럼 레이아웃에서 같은 Y좌표의 좌/우 컬럼 텍스트를
            // 한 줄로 섞어버리는 부작용이 있어 오히려 순서가 깨졌다(실제 설교 PDF로 검증 완료).
            // PDF 내부 스트림 순서(기본값 false)가 컬럼 단위 작성 순서를 그대로 보존한다.
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return text == null ? "" : text.strip();
        } catch (Exception e) {
            log.warn("설교 PDF 텍스트 추출 실패: {}", e.getMessage());
            return "";
        }
    }
}
