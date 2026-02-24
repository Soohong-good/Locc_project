package com.example.locc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 애플리케이션 전역 설정
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    
    /**
     * 애플리케이션 URL
     * 이메일 등에서 링크 생성 시 사용
     * 기본값: http://localhost:8080
     */
    private String url = "http://localhost:8080";
}
