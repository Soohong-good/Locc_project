package com.example.locc.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FileProperties fileProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 리소스 (favicon 등)
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        // 갤러리 이미지 직접 서빙 (공개 콘텐츠)
        Path galleryDir = fileProperties.resolve("gallery");
        ensureDir(galleryDir);
        registry.addResourceHandler("/uploads/gallery/**")
                .addResourceLocations(galleryDir.toUri().toString() + "/")
                .setCachePeriod(86400);

        // 스태프 이미지 직접 서빙 (공개 콘텐츠)
        Path staffDir = fileProperties.resolve("staff");
        ensureDir(staffDir);
        registry.addResourceHandler("/uploads/staff/**")
                .addResourceLocations(staffDir.toUri().toString() + "/")
                .setCachePeriod(86400);
    }

    private void ensureDir(Path dir) {
        if (!Files.exists(dir)) {
            try {
                Files.createDirectories(dir);
                log.info("업로드 디렉토리 생성: {}", dir);
            } catch (IOException e) {
                log.warn("업로드 디렉토리 생성 실패: {} — {}", dir, e.getMessage());
            }
        }
    }
}
