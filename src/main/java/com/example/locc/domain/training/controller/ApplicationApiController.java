package com.example.locc.domain.training.controller;

import com.example.locc.domain.training.dto.request.ApplicationRequest;
import com.example.locc.domain.training.dto.response.ApplicationResponse;
import com.example.locc.domain.training.service.ApplicationCommandService;
import com.example.locc.domain.training.service.ApplicationQueryService;
import com.example.locc.domain.training.service.TrainingQueryService;
import com.example.locc.domain.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * TrainingApplication API Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationApiController {

    private final ApplicationCommandService applicationCommandService;
    private final ApplicationQueryService applicationQueryService;
    private final TrainingQueryService trainingQueryService;

    /**
     * 신청서 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> detail(@PathVariable Long id) {
        ApplicationResponse application = applicationQueryService.getDetail(id);
        return ResponseEntity.ok(application);
    }

    /**
     * 특정 훈련의 신청자 목록 (관리자용)
     */
    @GetMapping("/training/{trainingId}")
    public ResponseEntity<Page<ApplicationResponse>> listByTraining(
            @PathVariable Long trainingId,
            @PageableDefault(size = 50, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(applicationQueryService.getListByTraining(trainingId, pageable));
    }

    /**
     * 특정 훈련의 신청자 엑셀 다운로드 (관리자용)
     */
    @GetMapping("/training/{trainingId}/excel")
    public ResponseEntity<byte[]> downloadExcel(@PathVariable Long trainingId) {
        try {
            List<ApplicationResponse> applications = applicationQueryService.getAllByTraining(trainingId);
            String trainingTitle = trainingQueryService.findDetailById(trainingId).getTitle();

            // ✅ 파일명용 금지문자 제거 + 공백 정리(권장)
            String safeTitle = (trainingTitle == null ? "훈련" : trainingTitle)
                    .replaceAll("[\\\\/:*?\"<>|]", "_")
                    .trim();

            // ✅ 파일명 (다운로드 파일명)
            String fileName = safeTitle + "_신청자명단.xlsx";

            Workbook workbook = new XSSFWorkbook();

            // ✅ 시트명도 제한이 있어서(31자/금지문자) 별도로 안전 처리
            String safeSheetName = (safeTitle + "_신청자명단")
                    .replaceAll("[\\\\/:*?\\[\\]]", "_"); // 시트명 금지문자: \ / ? * [ ] :
            if (safeSheetName.length() > 31) {
                safeSheetName = safeSheetName.substring(0, 31);
            }

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
            Row headerRow = sheet.createRow(0);
            String[] headers = {"번호", "이름", "연락처", "납부방법", "신청일"};
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
                // ✅ null-safe + 값 기준 변환
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

            // 바이트 배열로 변환
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();

            // ✅ 한글 파일명 안전하게 내려주기 (filename* 포함)
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            ContentDisposition contentDisposition = ContentDisposition.attachment()
                    .filename(fileName, StandardCharsets.UTF_8)
                    .build();
            httpHeaders.setContentDisposition(contentDisposition);

            return new ResponseEntity<>(outputStream.toByteArray(), httpHeaders, HttpStatus.OK);

        } catch (Exception e) {
            log.error("엑셀 다운로드 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 내 신청 내역
     */
    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponse>> myApplications(
            @AuthenticationPrincipal User user) {
        List<ApplicationResponse> applications = applicationQueryService.getMyApplications(user.getId());
        return ResponseEntity.ok(applications);
    }

    /**
     * 훈련 신청
     */
    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(
            @Valid @RequestBody ApplicationRequest request,
            Authentication authentication) {

        log.info("훈련 신청: trainingId={}, user={}", request.getTrainingId(), authentication.getName());

        ApplicationResponse response = applicationCommandService.apply(
                request.toCommand(),
                authentication.getName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 신청 취소
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long id,
            Authentication authentication) {

        log.info("신청 취소: applicationId={}, user={}", id, authentication.getName());

        applicationCommandService.cancel(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }
}
