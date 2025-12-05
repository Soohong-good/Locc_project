package com.example.locc.entity;

import com.example.locc.entity.BaseEntity;
import com.example.locc.entity.Notice;
import com.example.locc.entity.Sermon;
import com.example.locc.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFileName;  // 원본 파일명

    @Column(nullable = false)
    private String storedFileName;    // 서버 저장 파일명 (UUID)

    @Column(nullable = false)
    private String filePath;          // 파일 경로

    @Column(nullable = false)
    private Long fileSize;            // 파일 크기 (bytes)

    @Column(length = 100)
    private String contentType;       // MIME 타입

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttachmentType type;      // 첨부파일 타입

    // Notice나 Sermon에 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id")
    private Notice notice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sermon_id")
    private Sermon sermon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    public enum AttachmentType {
        SERMON_MANUSCRIPT,    // 설교 원고
        NOTICE_FILE,          // 공지사항 첨부
        RESOURCE             // 자료실
    }
}