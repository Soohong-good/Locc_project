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

            helper.setFrom("그리스도사랑교회 <smtpcode1@gmail.com>");
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

            helper.setFrom("그리스도사랑교회 <smtpcode1@gmail.com>");
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
     * 비동기 이메일 발송 - 회원가입 승인 완료 안내
     */
    @Async
    public void sendApprovalEmail(String to, String name) {
        long startTime = System.currentTimeMillis();
        log.debug("[비동기 이메일] 승인 완료 안내 발송 시작 (스레드: {})", Thread.currentThread().getName());

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("그리스도사랑교회 <smtpcode1@gmail.com>");
            helper.setTo(to);
            helper.setSubject("[그리스도 사랑교회] 회원가입이 승인되었습니다");

            String baseUrl = appProperties.getFrontendUrl().isBlank()
                    ? appProperties.getUrl()
                    : appProperties.getFrontendUrl();
            String loginUrl = baseUrl + "/login";

            helper.setText(buildApprovalHtml(name, loginUrl), true);

            mailSender.send(message);

            long totalTime = System.currentTimeMillis() - startTime;
            log.info("[비동기 이메일] 승인 완료 안내 발송 완료 ({}ms)", totalTime);

        } catch (MessagingException e) {
            log.error("[비동기 이메일] 승인 완료 안내 발송 실패", e);
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
            helper.setFrom("그리스도사랑교회 <smtpcode1@gmail.com>");
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
                  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Noto Sans KR','Malgun Gothic',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background-color:#ffffff;border:1px solid #e4e4e7;box-shadow:0 2px 8px -4px rgba(0,0,0,0.05);max-width:600px;width:100%%;">
                          <!-- 본문 -->
                          <tr>
                            <td style="padding:48px 56px 40px;">
                              <!-- 헤더: 로고 -->
                              <div style="margin-bottom:48px;">
                                <img src="https://locc.kr/logo.png" alt="그리스도 사랑교회" height="36"
                                     style="height:36px;width:auto;display:block;">
                              </div>
                              <!-- 제목 -->
                              <h1 style="margin:0 0 24px;font-size:30px;font-weight:500;letter-spacing:-0.5px;color:#18181b;line-height:1.2;">
                                이메일 인증 코드
                              </h1>
                              <!-- 설명 -->
                              <p style="margin:0 0 36px;font-size:15px;color:#52525b;line-height:2;">
                                안녕하세요.<br>
                                요청하신 이메일 인증 코드를 발송해 드립니다.<br>
                                아래의 6자리 코드를 진행 중인 화면에 입력하여 인증을 완료해 주세요.
                              </p>
                              <!-- 인증 코드 -->
                              <div style="margin:0 0 36px;padding:28px 0;border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;">
                                <span style="font-family:'ui-monospace','Courier New',monospace;font-size:52px;font-weight:300;letter-spacing:0.25em;color:#18181b;">
                                  %s
                                </span>
                              </div>
                              <!-- 안내 사항 -->
                              <div style="margin:0 0 56px;">
                                <p style="margin:0 0 10px;font-size:13px;color:#71717a;line-height:1.7;display:flex;align-items:flex-start;">
                                  <span style="margin-right:8px;color:#d4d4d8;">•</span>
                                  이 인증 코드는 발송 시점으로부터 <strong style="font-weight:500;color:#27272a;">&nbsp;5분 동안만&nbsp;</strong> 유효합니다.
                                </p>
                                <p style="margin:0;font-size:13px;color:#71717a;line-height:1.7;display:flex;align-items:flex-start;">
                                  <span style="margin-right:8px;color:#d4d4d8;">•</span>
                                  본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다. 보안을 위해 절대 타인에게 이 코드를 알려주지 마세요.
                                </p>
                              </div>
                              <!-- 푸터 -->
                              <div style="padding-top:24px;border-top:1px solid #f4f4f5;">
                                <p style="margin:0 0 4px;font-size:11px;color:#a1a1aa;line-height:1.8;">본 메일은 발신 전용입니다. 관련된 문의사항은 교회 사무실로 연락해 주시기 바랍니다.</p>
                                <p style="margin:0;font-size:11px;color:#a1a1aa;">© 그리스도 사랑교회. All rights reserved.</p>
                              </div>
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

    private String buildApprovalHtml(String name, String loginUrl) {
        return """
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
                </head>
                <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Noto Sans KR','Malgun Gothic',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background-color:#ffffff;border:1px solid #e4e4e7;box-shadow:0 2px 8px -4px rgba(0,0,0,0.05);max-width:600px;width:100%%;">
                          <!-- 본문 -->
                          <tr>
                            <td style="padding:48px 56px 40px;">
                              <!-- 헤더: 로고 -->
                              <div style="margin-bottom:48px;">
                                <img src="https://locc.kr/logo.png" alt="그리스도 사랑교회" height="36"
                                     style="height:36px;width:auto;display:block;">
                              </div>
                              <!-- 제목 -->
                              <h1 style="margin:0 0 24px;font-size:30px;font-weight:500;letter-spacing:-0.5px;color:#18181b;line-height:1.2;">
                                회원가입이 승인되었습니다
                              </h1>
                              <!-- 설명 -->
                              <p style="margin:0 0 36px;font-size:15px;color:#52525b;line-height:2;">
                                안녕하세요, <strong style="font-weight:500;color:#27272a;">%s</strong>님.<br>
                                그리스도 사랑교회 웹사이트 회원가입 신청이 관리자 승인을 완료했습니다.<br>
                                이제 로그인하여 서비스를 이용하실 수 있습니다.
                              </p>
                              <!-- 버튼 -->
                              <div style="margin:0 0 36px;padding:28px 0;border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;text-align:center;">
                                <a href="%s"
                                   style="display:inline-block;padding:14px 36px;background-color:#18181b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;">
                                  로그인하러 가기
                                </a>
                              </div>
                              <!-- 푸터 -->
                              <div style="padding-top:24px;border-top:1px solid #f4f4f5;">
                                <p style="margin:0 0 4px;font-size:11px;color:#a1a1aa;line-height:1.8;">본 메일은 발신 전용입니다. 관련된 문의사항은 교회 사무실로 연락해 주시기 바랍니다.</p>
                                <p style="margin:0;font-size:11px;color:#a1a1aa;">© 그리스도 사랑교회. All rights reserved.</p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(name, loginUrl);
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
