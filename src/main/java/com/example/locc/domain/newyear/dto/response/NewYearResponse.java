package com.example.locc.domain.newyear.dto.response;

import com.example.locc.domain.newyear.entity.NewYear;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NewYearResponse {

    private String title;
    private String description;
    private String youtubePlaylistId;
    private String latestVideoId;
    private String latestVideoTitle;
    private Integer year;
    private String transcript;
    private String pdfUrl; // PDF 스트리밍 URL (있으면 iframe으로 표시)

    public static NewYearResponse from(NewYear entity) {
        if (entity == null) return null;

        return NewYearResponse.builder()
                .title(entity.getTitle())
                .description(entity.getDescription())
                .youtubePlaylistId(entity.getYoutubePlaylistId())
                .latestVideoId(entity.getLatestVideoId())
                .latestVideoTitle(entity.getLatestVideoTitle())
                .year(entity.getYear())
                .transcript(entity.getTranscript())
                .pdfUrl(entity.getPdfFileId() != null
                        ? "/api/files/pdf/" + entity.getPdfFileId()
                        : null)
                .build();
    }

    /** DB에 레코드가 없을 때 프론트에 null 대신 반환 */
    public static NewYearResponse empty() {
        return NewYearResponse.builder()
                .title("송구영신예배")
                .description("한 해를 보내고 새 해를 맞이하는 특별 예배")
                .build();
    }
}
