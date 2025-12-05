package com.example.locc.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sermon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sermon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "설교 제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    @Column(nullable = false, length = 200)
    private String title;

    @Size(max = 100, message = "본문은 100자를 초과할 수 없습니다")
    @Column(length = 100)
    private String scripture;

    @Size(max = 50, message = "설교자명은 50자를 초과할 수 없습니다")
    @Column(length = 50)
    private String preacher;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String audioUrl;

    @Column(length = 500)
    private String videoUrl;

    @Column(length = 500)
    private String thumbnailUrl;

    private LocalDateTime sermonDate;

    // ✅ 작성자는 createdBy User 관계로 관리
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Builder.Default
    @OneToMany(mappedBy = "sermon", cascade = CascadeType.ALL)
    private List<Attachment> attachments = new ArrayList<>();
}