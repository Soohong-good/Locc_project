package com.example.locc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 파일 업로드 관련 설정
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "file")
public class FileProperties {

    /**
     * 파일 업로드 루트 디렉토리 경로
     * - application.yml 기본값: ${user.home}/locc-data/uploads
     */
    private String uploadDir;

    /**
     * 업로드 루트 디렉토리 Path (절대경로 + normalize)
     */
    public Path getUploadRootPath() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    /**
     * 업로드 하위 디렉토리 Path (예: gallery, staff, notice 등)
     */
    public Path resolve(String childDir) {
        return getUploadRootPath().resolve(childDir).normalize();
    }
}
