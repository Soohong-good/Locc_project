package com.example.locc.domain.newyear.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.newyear.dto.request.NewYearPlaylistUpdateRequest;
import com.example.locc.domain.newyear.dto.request.NewYearScriptureUpdateRequest;
import com.example.locc.domain.newyear.dto.request.NewYearTranscriptUpdateRequest;
import com.example.locc.domain.newyear.dto.response.NewYearResponse;
import com.example.locc.domain.newyear.service.NewYearCommandService;
import com.example.locc.domain.newyear.service.NewYearQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@Slf4j
@RestController
@RequestMapping("/api/newyear")
@RequiredArgsConstructor
public class NewYearApiController {

    private final NewYearQueryService newYearQueryService;
    private final NewYearCommandService newYearCommandService;

    /**
     * SPA 조회용 (공개)
     * - 최신 송구영신예배 데이터 반환
     * - DB에 레코드가 없을 때 empty() 반환 (Service 책임)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<NewYearResponse>> getLatest() {
        return ResponseEntity.ok(ApiResponse.ok(newYearQueryService.getLatestResponse()));
    }

    @PostMapping("/update-video")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateVideo() {
        newYearCommandService.updateLatestVideo();
        return ResponseEntity.ok(ApiResponse.ok(null, "송구영신예배 최신 영상이 업데이트되었습니다."));
    }

    @PutMapping("/playlist")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updatePlaylist(@Valid @RequestBody NewYearPlaylistUpdateRequest request) {
        newYearCommandService.updateYoutubePlaylist(request.getPlaylistId());
        return ResponseEntity.ok(ApiResponse.ok(null, "YouTube 재생목록 ID가 설정되었습니다."));
    }

    @PutMapping("/transcript")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ApiResponse<Void>> updateTranscript(@RequestBody NewYearTranscriptUpdateRequest request) {
        newYearCommandService.updateTranscript(request.getTranscript());
        return ResponseEntity.ok(ApiResponse.ok(null, "녹취본이 저장되었습니다."));
    }

    @PutMapping("/scripture")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ApiResponse<Void>> updateScripture(@RequestBody NewYearScriptureUpdateRequest request) {
        newYearCommandService.updateScripture(request.getScripture());
        return ResponseEntity.ok(ApiResponse.ok(null, "본문 성경 참조가 저장되었습니다."));
    }

    @PostMapping(value = "/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ApiResponse<Void>> uploadPdf(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        newYearCommandService.uploadPdf(file, principal.getName());
        return ResponseEntity.ok(ApiResponse.ok(null, "PDF가 업로드되었습니다."));
    }
}