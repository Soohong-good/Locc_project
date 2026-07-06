package com.example.locc.domain.training.service;

import com.example.locc.domain.training.dto.response.ApplicationResponse;
import com.example.locc.domain.training.entity.Training;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

/**
 * ApplicationExcelService 단위 테스트 (Mockito, DB 불필요)
 * - Apache POI로 만든 실제 엑셀 바이트를 다시 읽어서 내용까지 검증한다.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ApplicationExcelService 단위 테스트")
class ApplicationExcelServiceTest {

    @Mock private TrainingApplyQueryService applicationQueryService;
    @Mock private TrainingQueryService trainingQueryService;

    @InjectMocks private ApplicationExcelService applicationExcelService;

    private ApplicationResponse application(String name, String phone, String paymentMethod) {
        return ApplicationResponse.builder()
                .id(1L)
                .userName(name)
                .phone(phone)
                .paymentMethod(paymentMethod)
                .appliedAt(LocalDateTime.of(2026, 1, 15, 10, 30))
                .build();
    }

    @Test
    @DisplayName("정상 케이스 - 파일명과 시트 내용(헤더·데이터·납부방법 한글 변환)이 올바르다")
    void generateExcel_success() throws IOException {
        given(applicationQueryService.getAllByTraining(1L)).willReturn(List.of(
                application("홍길동", "010-1111-2222", "CASH"),
                application("김철수", "010-3333-4444", "BANK"),
                application("이영희", "010-5555-6666", "UNKNOWN")
        ));
        given(trainingQueryService.findDetailById(1L)).willReturn(Training.builder().title("리딩지저스").build());

        ApplicationExcelService.ExcelResult result = applicationExcelService.generateExcel(1L);

        assertThat(result.fileName()).isEqualTo("리딩지저스_신청자명단.xlsx");

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(result.content()))) {
            Sheet sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(0);
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("번호");
            assertThat(header.getCell(1).getStringCellValue()).isEqualTo("이름");
            assertThat(header.getCell(4).getStringCellValue()).isEqualTo("신청일");

            assertThat(sheet.getLastRowNum()).isEqualTo(3); // 헤더(0) + 데이터 3행

            Row row1 = sheet.getRow(1);
            assertThat(row1.getCell(1).getStringCellValue()).isEqualTo("홍길동");
            assertThat(row1.getCell(3).getStringCellValue()).isEqualTo("현금납부");

            Row row2 = sheet.getRow(2);
            assertThat(row2.getCell(3).getStringCellValue()).isEqualTo("계좌이체");

            Row row3 = sheet.getRow(3);
            assertThat(row3.getCell(3).getStringCellValue()).isEqualTo("-"); // 알 수 없는 결제수단
        }
    }

    @Test
    @DisplayName("훈련 제목에 특수문자가 있으면 파일명에서 밑줄로 치환된다")
    void generateExcel_sanitizesSpecialCharsInTitle() {
        given(applicationQueryService.getAllByTraining(1L)).willReturn(List.of());
        given(trainingQueryService.findDetailById(1L)).willReturn(Training.builder().title("2026/여름:수련회*").build());

        ApplicationExcelService.ExcelResult result = applicationExcelService.generateExcel(1L);

        assertThat(result.fileName()).isEqualTo("2026_여름_수련회__신청자명단.xlsx");
    }

    @Test
    @DisplayName("훈련 제목이 null이면 '훈련'으로 대체된다")
    void generateExcel_nullTitleFallsBackToDefault() {
        given(applicationQueryService.getAllByTraining(1L)).willReturn(List.of());
        given(trainingQueryService.findDetailById(1L)).willReturn(Training.builder().title(null).build());

        ApplicationExcelService.ExcelResult result = applicationExcelService.generateExcel(1L);

        assertThat(result.fileName()).isEqualTo("훈련_신청자명단.xlsx");
    }

    @Test
    @DisplayName("신청자가 없어도 헤더만 있는 엑셀이 정상 생성된다")
    void generateExcel_emptyApplications() throws IOException {
        given(applicationQueryService.getAllByTraining(1L)).willReturn(List.of());
        given(trainingQueryService.findDetailById(1L)).willReturn(Training.builder().title("빈 훈련").build());

        ApplicationExcelService.ExcelResult result = applicationExcelService.generateExcel(1L);

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(result.content()))) {
            Sheet sheet = workbook.getSheetAt(0);
            assertThat(sheet.getLastRowNum()).isEqualTo(0); // 헤더 행만 존재
        }
    }

    @Test
    @DisplayName("긴 훈련 제목은 엑셀 시트명 31자 제한에 맞게 잘린다")
    void generateExcel_longTitleTruncatesSheetName() throws IOException {
        String longTitle = "아주아주아주아주아주아주아주아주아주아주긴훈련제목입니다";
        given(applicationQueryService.getAllByTraining(1L)).willReturn(List.of());
        given(trainingQueryService.findDetailById(1L)).willReturn(Training.builder().title(longTitle).build());

        ApplicationExcelService.ExcelResult result = applicationExcelService.generateExcel(1L);

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(result.content()))) {
            assertThat(workbook.getSheetName(0).length()).isLessThanOrEqualTo(31);
        }
    }
}
