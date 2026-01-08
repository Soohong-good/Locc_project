package com.example.locc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Static resources (개발자가 직접 추가한 정적 리소스)
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        // Images (classpath - 정적 이미지: 로고, 아이콘 등)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");

        // CSS
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");

        // JavaScript
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");

        // ===== 업로드된 파일 (filesystem) =====
        String uploadLocation = uploadDir.endsWith("/") ? "file:" + uploadDir + "/" : "file:" + uploadDir + "/";
        
        // Staff 이미지
        registry.addResourceHandler("/images/staff/**")
                .addResourceLocations(uploadLocation + "staff/")
                .setCachePeriod(3600);

        // Notice 첨부파일 및 에디터 이미지
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);
    }
}