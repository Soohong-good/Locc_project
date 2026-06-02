package com.example.locc.domain.auth.service;

import com.example.locc.config.AppProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * 비동기 이메일 발송 전용 서비스
 * - @Async 프록시가 제대로 작동하도록 별도 클래스로 분리
 * - Thymeleaf 제거: 이메일 HTML을 Java Text Block으로 직접 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncEmailSender {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    /**
     * 비동기 이메일 발송 - 인증 코드
     */
    @Async
    public void sendVerificationEmail(String to, String code) {
        long startTime = System.currentTimeMillis();
        log.debug("[비동기 이메일] 인증 코드 발송 시작 (스레드: {})", Thread.currentThread().getName());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("그리스도사랑교회 <noreply@locc.kr>");
            helper.setTo(to);
            helper.setSubject("[그리스도 사랑교회] 이메일 인증 코드");
            helper.setText(buildVerificationCodeHtml(code), true);

            mailSender.send(message);

            long totalTime = System.currentTimeMillis() - startTime;
            log.info("[비동기 이메일] 인증 코드 발송 완료 ({}ms)", totalTime);

        } catch (MessagingException e) {
            log.error("[비동기 이메일] 인증 코드 발송 실패", e);
        }
    }

    /**
     * 비동기 이메일 발송 - 비밀번호 재설정
     */
    @Async
    public void sendPasswordResetEmail(String to, String token, String name) {
        long startTime = System.currentTimeMillis();
        log.debug("[비동기 이메일] 비밀번호 재설정 발송 시작 (스레드: {})", Thread.currentThread().getName());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("그리스도사랑교회 <noreply@locc.kr>");
            helper.setTo(to);
            helper.setSubject("[그리스도 사랑교회] 비밀번호 재설정");

            String baseUrl = appProperties.getFrontendUrl().isBlank()
                    ? appProperties.getUrl()
                    : appProperties.getFrontendUrl();
            String resetUrl = baseUrl + "/reset-password?token=" + token;

            helper.setText(buildPasswordResetHtml(name, resetUrl), true);

            mailSender.send(message);

            long totalTime = System.currentTimeMillis() - startTime;
            log.info("[비동기 이메일] 비밀번호 재설정 발송 완료 ({}ms)", totalTime);

        } catch (MessagingException e) {
            log.error("[비동기 이메일] 비밀번호 재설정 발송 실패", e);
        }
    }

    /**
     * 비동기 이메일 발송 - 서버/프론트 에러 알림
     * adminEmail이 비어 있으면 발송하지 않음
     */
    @Async
    public void sendErrorAlert(String subject, String errorType, String message, String detail) {
        String adminEmail = appProperties.getAdminEmail();
        if (adminEmail == null || adminEmail.isBlank()) return;

        try {
            MimeMessage mail = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mail, true, "UTF-8");
            helper.setFrom("그리스도사랑교회 <noreply@getitstudy.by-works.net>");
            helper.setTo(adminEmail);
            helper.setSubject("[그리스도 사랑교회] " + subject);
            helper.setText(buildErrorAlertHtml(errorType, message, detail), true);
            mailSender.send(mail);
            log.info("[에러 알림] 이메일 발송 완료 → {}", adminEmail);
        } catch (MessagingException e) {
            log.error("[에러 알림] 이메일 발송 실패", e);
        }
    }

    // ── HTML 빌더 ────────────────────────────────────────────────────────

    private String buildErrorAlertHtml(String errorType, String message, String detail) {
        return """
                <!DOCTYPE html>
                <html lang="ko">
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;font-family:'Malgun Gothic',Arial,sans-serif;background-color:#f5f5f5;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0"
                             style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                        <tr>
                          <td style="padding:30px 40px;background-color:#dc2626;border-radius:8px 8px 0 0;">
                            <h1 style="margin:0;font-size:20px;color:#ffffff;">🚨 서버 에러 알림</h1>
                            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">그리스도 사랑교회 웹사이트</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:30px 40px;">
                            <table width="100%%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                                  <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">에러 유형</span>
                                  <span style="font-size:14px;color:#0f172a;font-weight:600;">%s</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                                  <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">메시지</span>
                                  <span style="font-size:14px;color:#dc2626;">%s</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:10px 0;">
                                  <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:8px;">상세 정보</span>
                                  <pre style="margin:0;padding:16px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;color:#475569;white-space:pre-wrap;word-break:break-all;font-family:'Courier New',monospace;">%s</pre>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:20px 40px;background-color:#f8fafc;border-top:1px solid #e5e5e5;border-radius:0 0 8px 8px;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#94a3b8;">이 메일은 자동 발송된 에러 알림입니다.</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(errorType, message, detail);
    }

    private String buildVerificationCodeHtml(String code) {
        return """
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0;padding:0;font-family:'Malgun Gothic','맑은 고딕',Arial,sans-serif;background-color:#f5f5f5;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                          <!-- 헤더 -->
                          <tr>
                            <td style="padding:40px 40px 30px;text-align:center;border-bottom:1px solid #e5e5e5;">
                              <h1 style="margin:0;font-size:24px;font-weight:300;color:#1e293b;">그리스도 사랑교회</h1>
                            </td>
                          </tr>
                          <!-- 본문 -->
                          <tr>
                            <td style="padding:40px;">
                              <h2 style="margin:0 0 20px;font-size:20px;font-weight:500;color:#0f172a;">이메일 인증 코드</h2>
                              <p style="margin:0 0 30px;font-size:15px;line-height:1.6;color:#475569;">
                                회원가입을 위한 이메일 인증 코드를 안내해 드립니다.<br>
                                아래 인증 코드를 입력하여 이메일 인증을 완료해주세요.
                              </p>
                              <!-- 인증 코드 박스 -->
                              <div style="background-color:#f8fafc;border:2px solid #e2e8f0;border-radius:8px;padding:30px;text-align:center;margin:30px 0;">
                                <div style="font-size:14px;color:#64748b;margin-bottom:10px;font-weight:500;">인증 코드</div>
                                <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#0f172a;font-family:'Courier New',monospace;">
                                  %s
                                </div>
                              </div>
                              <!-- 안내 -->
                              <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;margin:30px 0;border-radius:4px;">
                                <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
                                  <strong>⏱️ 유효 시간:</strong> 이 코드는 <strong>5분간</strong> 유효합니다.<br>
                                  <strong>🔒 보안:</strong> 본인이 요청하지 않았다면 이 메일을 무시하세요.
                                </p>
                              </div>
                              <p style="margin:30px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
                                감사합니다.<br>
                                <strong style="color:#475569;">그리스도 사랑교회</strong> 드림
                              </p>
                            </td>
                          </tr>
                          <!-- 푸터 -->
                          <tr>
                            <td style="padding:30px;background-color:#f8fafc;border-top:1px solid #e5e5e5;text-align:center;border-radius:0 0 8px 8px;">
                              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                                이 이메일은 회원가입 시 자동으로 발송된 메일입니다.<br>
                                문의사항이 있으시면 교회로 연락 주시기 바랍니다.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(code);
    }

    private String buildPasswordResetHtml(String name, String resetUrl) {
        return """
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0;padding:0;font-family:'Malgun Gothic','맑은 고딕',Arial,sans-serif;background-color:#f5f5f5;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                          <!-- 헤더 -->
                          <tr>
                            <td style="padding:40px 40px 30px;text-align:center;border-bottom:1px solid #e5e5e5;">
                              <h1 style="margin:0;font-size:24px;font-weight:300;color:#1e293b;">그리스도 사랑교회</h1>
                            </td>
                          </tr>
                          <!-- 본문 -->
                          <tr>
                            <td style="padding:40px;">
                              <h2 style="margin:0 0 10px;font-size:20px;font-weight:500;color:#0f172a;">비밀번호 재설정</h2>
                              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
                                안녕하세요, <strong>%s</strong>님
                              </p>
                              <p style="margin:0 0 30px;font-size:15px;line-height:1.6;color:#475569;">
                                비밀번호 재설정을 요청하셨습니다.<br>
                                아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
                              </p>
                              <!-- 버튼 -->
                              <div style="text-align:center;margin:40px 0;">
                                <a href="%s"
                                   style="display:inline-block;padding:16px 40px;background-color:#1e293b;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:500;">
                                  비밀번호 재설정하기
                                </a>
                              </div>
                              <!-- 안내 -->
                              <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;margin:30px 0;border-radius:4px;">
                                <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
                                  <strong>⏱️ 유효 시간:</strong> 이 링크는 <strong>30분간</strong> 유효합니다.<br>
                                  <strong>🔒 보안:</strong> 본인이 요청하지 않았다면 이 메일을 무시하세요.
                                </p>
                              </div>
                              <p style="margin:30px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
                                감사합니다.<br>
                                <strong style="color:#475569;">그리스도 사랑교회</strong> 드림
                              </p>
                            </td>
                          </tr>
                          <!-- 푸터 -->
                          <tr>
                            <td style="padding:30px;background-color:#f8fafc;border-top:1px solid #e5e5e5;text-align:center;border-radius:0 0 8px 8px;">
                              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                                이 이메일은 비밀번호 재설정 요청 시 자동으로 발송된 메일입니다.<br>
                                문의사항이 있으시면 교회로 연락 주시기 바랍니다.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(name, resetUrl);
    }
}
