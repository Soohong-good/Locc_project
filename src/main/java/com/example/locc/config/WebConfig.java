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
        // Path.toUri() 를 사용하면 Windows/Unix 모두 안전한 file:/// URI가 만들어짐
        Path uploadRoot = fileProperties.getUploadRootPath();
        String uploadRootUri = ensureTrailingSlash(uploadRoot.toUri().toString());

        // Staff 이미지 (예: /images/staff/xxx.png -> <uploadRoot>/staff/xxx.png)
        registry.addResourceHandler("/images/staff/**")
                .addResourceLocations(ensureTrailingSlash(uploadRoot.resolve("staff").toUri().toString()))
                .setCachePeriod(3600);

        // 업로드 전체 접근 (예: /uploads/gallery/xxx.png -> <uploadRoot>/gallery/xxx.png)
        // 즉, URL의 /uploads/** 는 uploadRoot 하위로 직접 매핑됨
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadRootUri);
    }

    private String ensureTrailingSlash(String uri) {
        return uri.endsWith("/") ? uri : uri + "/";
    }
}
