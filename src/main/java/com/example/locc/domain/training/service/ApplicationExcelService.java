package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.response.ApplicationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 훈련 신청자 엑셀 생성 Service
 * - Apache POI 엑셀 생성 로직 전담
 * - Controller는 ExcelResult만 받아 HTTP 헤더 조립
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationExcelService {

    private final TrainingApplyQueryService applicationQueryService;
    private final TrainingQueryService trainingQueryService;

    /**
     * 엑셀 생성 결과 (파일명 + 바이트 배열)
     */
    public record ExcelResult(String fileName, byte[] content) {}

    /**
     * 특정 훈련 신청자 엑셀 생성
     */
    public ExcelResult generateExcel(Long trainingId) {
        List<ApplicationResponse> applications = applicationQueryService.getAllByTraining(trainingId);
        String trainingTitle = trainingQueryService.findDetailById(trainingId).getTitle();

        String safeTitle = (trainingTitle == null ? "훈련" : trainingTitle)
                .replaceAll("[\\\\/:*?\"<>|]", "_")
                .trim();

        String fileName = safeTitle + "_신청자명단.xlsx";

        String safeSheetName = (safeTitle + "_신청자명단")
                .replaceAll("[\\\\/:*?\\[\\]]", "_");
        if (safeSheetName.length() > 31) {
            safeSheetName = safeSheetName.substring(0, 31);
        }

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(safeSheetName);

            // 헤더 스타일
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // 헤더 생성
            String[] headers = {"번호", "이름", "연락처", "납부방법", "신청일"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // 데이터 스타일
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            // 데이터 생성
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            int rowNum = 1;
            for (ApplicationResponse app : applications) {
                Row row = sheet.createRow(rowNum++);

                Cell cell0 = row.createCell(0);
                cell0.setCellValue(rowNum - 1);
                cell0.setCellStyle(dataStyle);

                Cell cell1 = row.createCell(1);
                cell1.setCellValue(app.getUserName());
                cell1.setCellStyle(dataStyle);

                Cell cell2 = row.createCell(2);
                cell2.setCellValue(app.getPhone());
                cell2.setCellStyle(dataStyle);

                Cell cell3 = row.createCell(3);
                String pm = app.getPaymentMethod();
                if ("CASH".equals(pm)) {
                    cell3.setCellValue("현금납부");
                } else if ("BANK".equals(pm)) {
                    cell3.setCellValue("계좌이체");
                } else {
                    cell3.setCellValue("-");
                }
                cell3.setCellStyle(dataStyle);

                Cell cell4 = row.createCell(4);
                cell4.setCellValue(app.getAppliedAt().format(formatter));
                cell4.setCellStyle(dataStyle);
            }

            // 컬럼 너비 자동 조정
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 1024);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);

            log.info("엑셀 생성 완료: trainingId={}, 신청자 수={}", trainingId, applications.size());
            return new ExcelResult(fileName, outputStream.toByteArray());

        } catch (Exception e) {
            log.error("엑셀 생성 실패: trainingId={}", trainingId, e);
            throw new RuntimeException("엑셀 파일 생성에 실패했습니다.", e);
        }
    }
}
