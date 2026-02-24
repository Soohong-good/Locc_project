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
     * - 이메일 링크, 파일 절대경로 URL prefix로 사용
     * - 운영(Nginx 단일 도메인): 비워두면 상대경로 반환
     * - 개발(포트 분리):         http://localhost:8080
     */
    private String url = "";

    /**
     * CORS 허용 오리진 목록
     * application-local.yml:
     *   - http://localhost:3000   (React dev server)
     *   - http://localhost:8080   (Spring Boot)
     * application-prod.yml:
     *   - https://yourdomain.com
     *
     * 코드 기본값은 지정하지 않는다. yml에서 반드시 설정할 것.
     */
    private List<String> corsOrigins = List.of();

    /**
     * OAuth2 로그인 성공 후 리다이렉트 URL (프론트엔드 기준)
     * - 개발: http://localhost:3000/oauth2/callback
     * - 운영: https://yourdomain.com/oauth2/callback
     *
     * 토큰은 쿼리 파라미터로 전달: ?accessToken=...&refreshToken=...
     */
    private String oauth2RedirectUrl = "/oauth2/callback";
}
