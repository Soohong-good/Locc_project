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
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * 비동기 이메일 발송 전용 서비스
 * - @Async 프록시가 제대로 작동하도록 별도 클래스로 분리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncEmailSender {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final AppProperties appProperties;

    /**
     * 비동기 이메일 발송 - 인증 코드
     * 백그라운드 스레드에서 실행되므로 API 응답이 즉시 반환됨
     */
    @Async
    public void sendVerificationEmail(String to, String code) {
        long startTime = System.currentTimeMillis();
        log.info("[비동기 이메일] 인증 코드 발송 시작 (스레드: {}): {}", Thread.currentThread().getName(), to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("[그리스도 사랑교회] 이메일 인증 코드");

            // Thymeleaf 템플릿으로 HTML 생성
            String htmlContent = buildVerificationCodeHtml(code);
            helper.setText(htmlContent, true);

            mailSender.send(message);

            long totalTime = System.currentTimeMillis() - startTime;
            log.info("[비동기 이메일] 인증 코드 발송 완료 ({}ms): {}", totalTime, to);

        } catch (MessagingException e) {
            log.error("[비동기 이메일] 인증 코드 발송 실패: {}", to, e);
        }
    }

    /**
     * 비동기 이메일 발송 - 비밀번호 재설정
     */
    @Async
    public void sendPasswordResetEmail(String to, String token, String name) {
        long startTime = System.currentTimeMillis();
        log.info("[비동기 이메일] 비밀번호 재설정 발송 시작 (스레드: {}): {}", Thread.currentThread().getName(), to);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("[그리스도 사랑교회] 비밀번호 재설정");

            // Thymeleaf 템플릿으로 HTML 생성
            String resetUrl = appProperties.getUrl() + "/auth/reset-password?token=" + token;
            String htmlContent = buildPasswordResetHtml(name, resetUrl);
            helper.setText(htmlContent, true);

            mailSender.send(message);

            long totalTime = System.currentTimeMillis() - startTime;
            log.info("[비동기 이메일] 비밀번호 재설정 발송 완료 ({}ms): {}", totalTime, to);

        } catch (MessagingException e) {
            log.error("[비동기 이메일] 비밀번호 재설정 발송 실패: {}", to, e);
        }
    }

    /**
     * HTML 이메일 내용 생성 - 인증 코드
     */
    private String buildVerificationCodeHtml(String code) {
        Context context = new Context();
        context.setVariable("code", code);
        return templateEngine.process("email/verification-code", context);
    }

    /**
     * HTML 이메일 내용 생성 - 비밀번호 재설정
     */
    private String buildPasswordResetHtml(String name, String resetUrl) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("resetUrl", resetUrl);
        return templateEngine.process("email/password-reset", context);
    }
}
