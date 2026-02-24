package com.example.locc.domain.helprequest.entity;

import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 도움 요청 엔티티
 * - 복음말씀 페이지에서 신앙 상담이나 도움이 필요한 방문자의 요청을 저장
 */
@Entity
@Table(name = "help_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HelpRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 요청자 이름
     */
    @Column(nullable = false, length = 50)
    private String name;

    /**
     * 요청자 전화번호
     */
    @Column(nullable = false, length = 20)
    private String phone;

    /**
     * 요청자 이메일
     */
    @Column(nullable = false, length = 100)
    private String email;

    /**
     * 도움이 필요한 내용
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 처리 상태
     * PENDING: 대기중
     * IN_PROGRESS: 처리중
     * COMPLETED: 완료
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HelpRequestStatus status = HelpRequestStatus.PENDING;

    /**
     * 관리자 메모
     */
    @Column(columnDefinition = "TEXT")
    private String adminMemo;

    // ========== 정적 팩토리 메서드 ==========

    /**
     * 도움 요청 생성
     */
    public static HelpRequest create(String name, String phone, String email, String content) {
        HelpRequest helpRequest = new HelpRequest();
        helpRequest.name = name;
        helpRequest.phone = phone;
        helpRequest.email = email;
        helpRequest.content = content;
        helpRequest.status = HelpRequestStatus.PENDING;
        return helpRequest;
    }

    // ========== 비즈니스 로직 ==========

    /**
     * 상태 변경
     */
    public void updateStatus(HelpRequestStatus status) {
        this.status = status;
    }

    /**
     * 관리자 메모 작성/수정
     */
    public void updateAdminMemo(String adminMemo) {
        this.adminMemo = adminMemo;
    }

    /**
     * 처리 시작
     */
    public void startProcessing() {
        this.status = HelpRequestStatus.IN_PROGRESS;
    }

    /**
     * 처리 완료
     */
    public void complete() {
        this.status = HelpRequestStatus.COMPLETED;
    }
}
