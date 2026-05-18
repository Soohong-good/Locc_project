package com.example.locc.domain.file.service;

import com.example.locc.config.AppProperties;
import com.example.locc.domain.file.dto.response.FileResponse;
import com.example.locc.domain.file.entity.File;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 파일 URL 생성 컴포넌트
 *
 * FileResponse.from(file)은 상대경로를 반환한다.
 * React 개발 환경(localhost:3000 ↔ localhost:8080)처럼 프론트/백이 다른 도메인일 경우
 * 절대경로가 필요하다. 이 컴포넌트가 AppProperties.url을 주입받아 일관된 URL을 생성한다.
 *
 * 사용 예시:
 *   fileUrlResolver.toResponse(file)   → { downloadUrl: "http://...:8080/api/files/download/1", ... }
 *
 * 운영 환경(Nginx 리버스 프록시로 같은 도메인):
 *   app.url = ""  →  상대경로 반환 (기본값)
 */
@Component
@RequiredArgsConstructor
public class FileUrlResolver {

    private final AppProperties appProperties;

    /**
     * 단일 파일 → FileResponse (절대경로 포함)
     */
    public FileResponse toResponse(File file) {
        return FileResponse.from(file, resolveBaseUrl());
    }

    /**
     * 파일 목록 → FileResponse 목록
     */
    public List<FileResponse> toResponses(List<File> files) {
        String baseUrl = resolveBaseUrl();
        return files.stream()
                .map(file -> FileResponse.from(file, baseUrl))
                .toList();
    }

    /**
     * 공개 이미지 URL 생성 (썸네일, 본문 이미지, 갤러리)
     * FileCommandService.uploadContentImage()와 동일한 규칙
     */
    public String toImageUrl(Long fileId) {
        return resolveBaseUrl() + "/api/files/image/" + fileId;
    }

    /**
     * 보호 파일 다운로드 URL 생성
     */
    public String toDownloadUrl(Long fileId) {
        return resolveBaseUrl() + "/api/files/download/" + fileId;
    }

    // ───── private ─────

    /**
     * baseUrl 결정
     * - 운영(Nginx 같은 도메인): app.url = "" → 상대경로
     * - 개발(포트 분리):         app.url = "http://localhost:8080" → 절대경로
     */
    private String resolveBaseUrl() {
        String url = appProperties.getUrl();
        if (url == null || url.isBlank() || url.equals("/")) {
            return "";
        }
        return url.stripTrailing();
    }
}
