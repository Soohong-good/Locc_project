package com.example.locc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 애플리케이션 전역 설정
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    /**
     * 서버 기본 URL
     * - 이메일 링크 생성 시 사용
     * - 파일 절대 URL 생성 시 prefix로 사용
     * 기본값: http://localhost:8080
     */
    private String url = "http://localhost:8080";

    /**
     * CORS 허용 오리진 목록
     * 로컬: http://localhost:3000 (React dev server)
     * 운영: 실제 프론트 도메인
     *
     * application.yml 예시:
     *   app:
     *     cors-origins:
     *       - http://localhost:3000
     *       - https://your-domain.com
     */
    private List<String> corsOrigins = List.of(
            "http://localhost:3000",
            "http://localhost:8080"
    );
}
