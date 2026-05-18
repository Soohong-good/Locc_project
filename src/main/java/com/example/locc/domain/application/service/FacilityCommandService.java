package com.example.locc.domain.application.service;

import com.example.locc.domain.application.dto.command.FacilityCreateCommand;
import com.example.locc.domain.application.dto.request.FacilitySearchCondition;
import com.example.locc.domain.application.dto.response.FacilityApplicationDetailResponse;
import com.example.locc.domain.application.entity.FacilityApplication;
import com.example.locc.domain.application.entity.FacilityCategory;
import com.example.locc.domain.application.repository.FacilityApplicationRepository;
import com.example.locc.domain.application.repository.FacilityCategoryRepository;
import com.example.locc.domain.user.entity.User;
import com.example.locc.domain.user.repository.UserRepository;
import com.example.locc.exception.NotFoundException;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FacilityCommandService {

    private final FacilityApplicationRepository applicationRepository;
    private final FacilityCategoryRepository    categoryRepository;
    private final FacilityQueryService          queryService;
    private final UserRepository                userRepository;

    public FacilityApplicationDetailResponse create(FacilityCreateCommand command) {
        User user = findUserByEmail(command.getUserEmail());
        FacilityCategory category = categoryRepository.findById(command.getCategoryId())
                .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."));
        if (!category.getIsActive()) throw new IllegalStateException("비활성화된 카테고리입니다.");
        return FacilityApplicationDetailResponse.from(
                applicationRepository.save(FacilityApplication.create(command, category, user)));
    }

    public void cancel(Long id, String email) {
        FacilityApplication application = queryService.findEntityById(id);
        User user = findUserByEmail(email);
        if (!application.canCancel(user)) throw new IllegalStateException("취소할 수 없는 신청입니다.");
        applicationRepository.delete(application);
    }

    public FacilityApplicationDetailResponse complete(Long id, String adminMemo) {
        FacilityApplication application = queryService.findEntityById(id);
        application.complete();
        if (adminMemo != null) application.updateAdminMemo(adminMemo);
        return FacilityApplicationDetailResponse.from(application);
    }

    public FacilityApplicationDetailResponse updateAdminMemo(Long id, String adminMemo) {
        FacilityApplication application = queryService.findEntityById(id);
        application.updateAdminMemo(adminMemo);
        return FacilityApplicationDetailResponse.from(application);
    }

    public void createCategory(String name, String description, Integer sortOrder) {
        categoryRepository.save(FacilityCategory.create(name, description, sortOrder));
    }

    public void updateCategory(Long id, String name, String description, Integer sortOrder) {
        categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."))
                .update(name, description, sortOrder);
    }

    public void toggleCategoryActive(Long id) {
        FacilityCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."));
        if (category.getIsActive()) category.deactivate(); else category.activate();
    }

    public void downloadExcel(FacilitySearchCondition condition, HttpServletResponse response) throws IOException {
        List<FacilityApplication> list = queryService.findAllForExcel(condition);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("신청 목록");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            String[] headers = {"번호", "카테고리", "신청자", "이메일", "사용 날짜", "시작 시간", "종료 시간", "목적", "인원", "기타 요청사항", "상태", "접수일시"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            for (int i = 0; i < list.size(); i++) {
                FacilityApplication a = list.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(a.getId());
                row.createCell(1).setCellValue(a.getCategory().getName());
                row.createCell(2).setCellValue(a.getUser().getName());
                row.createCell(3).setCellValue(a.getUser().getEmail());
                row.createCell(4).setCellValue(a.getUseDate().toString());
                row.createCell(5).setCellValue(a.getUseStartTime().toString());
                row.createCell(6).setCellValue(a.getUseEndTime().toString());
                row.createCell(7).setCellValue(a.getPurpose());
                row.createCell(8).setCellValue(a.getHeadCount());
                row.createCell(9).setCellValue(a.getMemo() != null ? a.getMemo() : "");
                row.createCell(10).setCellValue(a.getStatus().getLabel());
                row.createCell(11).setCellValue(a.getCreatedAt().toString());
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

            String filename = URLEncoder.encode("신청목록.xlsx", StandardCharsets.UTF_8);
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + filename);
            workbook.write(response.getOutputStream());
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));
    }
}
