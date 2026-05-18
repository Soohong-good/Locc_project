package com.example.locc.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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
        // SecurityConfig에서 /uploads/gallery/** 는 permitAll 처리됨
        String galleryPath = fileProperties.resolve("gallery").toUri().toString();
        registry.addResourceHandler("/uploads/gallery/**")
                .addResourceLocations(galleryPath + "/")
                .setCachePeriod(86400); // 1일 캐시
    }
}
