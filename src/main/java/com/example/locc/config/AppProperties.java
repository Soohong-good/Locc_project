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
     * - 파일 절대경로 URL prefix로 사용
     * - 운영(Nginx 단일 도메인): 비워두면 상대경로 반환
     * - 개발(포트 분리):         http://localhost:8080
     */
    private String url = "";

    /**
     * 프론트엔드 URL
     * - 이메일 링크(비밀번호 재설정 등)에 사용
     * - 개발: http://localhost:3000
     * - 운영: https://yourdomain.com
     * - 비워두면 app.url을 fallback으로 사용
     */
    private String frontendUrl = "";

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
     */
    private String oauth2RedirectUrl = "/oauth2/callback";

    /**
     * JWT 쿠키 Secure 플래그
     * - 운영(HTTPS): true (반드시)
     * - 개발(HTTP):  false
     * application-local.yml: false
     * application-prod.yml:  true
     */
    private boolean cookieSecure = false;

    /**
     * 에러 알림 수신 이메일
     * - 비워두면 에러 알림 이메일 비활성화
     * - application.yml: app.admin-email: ${ADMIN_ALERT_EMAIL:}
     */
    private String adminEmail = "";
}
