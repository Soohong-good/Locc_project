package com.example.locc.domain.sermon.dto.request;

import com.example.locc.domain.sermon.dto.command.SermonCreateCommand;
import com.example.locc.domain.sermon.dto.command.SermonUpdateCommand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

/**
 * Sermon 생성/수정 요청 DTO
 * - Controller 입력 전용 (웹/API에서 들어오는 원본)
 * - Validation은 여기서만
 * - Controller에서 Command로 변환
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SermonRequest {

    @NotBlank(message = "설교 제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;

    @Size(max = 100, message = "성경 구절은 100자를 초과할 수 없습니다")
    private String scripture;

    @Size(max = 50, message = "설교자명은 50자를 초과할 수 없습니다")
    private String preacher;

    private String content;

    private String audioUrl;

    private String videoUrl;

    private String thumbnailUrl;

    private LocalDate sermonDate;

    @Size(max = 50, message = "카테고리는 50자를 초과할 수 없습니다")
    private String category;

    private Integer serviceNumber;  // 1부, 2부 구분 (주일오전/주일오후 등에서 사용)

    /**
     * 첨부파일 목록
     */
    private List<MultipartFile> files;

    public SermonCreateCommand toCreateCommand(String createdByEmail) {
        return SermonCreateCommand.builder()
                .title(title).scripture(scripture).preacher(preacher)
                .content(content).audioUrl(audioUrl).videoUrl(videoUrl)
                .thumbnailUrl(thumbnailUrl).sermonDate(sermonDate)
                .category(category).serviceNumber(serviceNumber)
                .files(files).createdByEmail(createdByEmail)
                .build();
    }

    public SermonUpdateCommand toUpdateCommand(Long sermonId, String updatedByEmail) {
        return SermonUpdateCommand.builder()
                .sermonId(sermonId).title(title).scripture(scripture).preacher(preacher)
                .content(content).audioUrl(audioUrl).videoUrl(videoUrl)
                .thumbnailUrl(thumbnailUrl).sermonDate(sermonDate)
                .category(category).serviceNumber(serviceNumber)
                .files(files).updatedByEmail(updatedByEmail)
                .build();
    }
}
