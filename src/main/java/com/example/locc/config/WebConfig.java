package com.example.locc.config;

import com.example.locc.domain.admin.interceptor.VisitorCounterInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final VisitorCounterInterceptor visitorCounterInterceptor;
    private final FileProperties fileProperties;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(visitorCounterInterceptor)
                .addPathPatterns("/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Static resources
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");

        Path uploadRoot = fileProperties.getUploadRootPath();

        // Staff 이미지 직접 접근 (Thymeleaf 뷰에서 사용)
        registry.addResourceHandler("/images/staff/**")
                .addResourceLocations(ensureTrailingSlash(uploadRoot.resolve("staff").toUri().toString()))
                .setCachePeriod(3600);

        // TODO: Thymeleaf 퇴출 후 아래 핸들러 제거 예정
        //   React 전환 완료 이후에는 파일 접근을 /api/files/image/** 로만 허용
        //   /uploads/** 직접 노출은 파일 접근 정책 우회 가능성이 있음
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(ensureTrailingSlash(uploadRoot.toUri().toString()));
    }

    private String ensureTrailingSlash(String uri) {
        return uri.endsWith("/") ? uri : uri + "/";
    }
}
