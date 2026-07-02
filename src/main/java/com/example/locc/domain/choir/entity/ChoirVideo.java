package com.example.locc.domain.choir.entity;

import com.example.locc.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 찬양대 YouTube 영상 엔티티
 * - Sermon 도메인과 분리: 찬양대 영상은 설교가 아니므로 Sermon 카테고리를 오염시키지 않기 위함
 * - 불변성을 위해 Setter 제거, 팩토리 메서드로 생성
 */
@Entity
@Table(name = "choir_video")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(access = AccessLevel.PRIVATE)
public class ChoirVideo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 50, unique = true)
    private String youtubeVideoId;

    @Column(length = 255)
    private String videoUrl;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column
    private LocalDate publishedAt;

    @Column(name = "choir_name", length = 30)
    private String choirName;

    // ===== 팩토리 메서드 =====

    public static ChoirVideo create(String title, String videoUrl, String thumbnailUrl,
                                     String youtubeVideoId, LocalDate publishedAt, String choirName) {
        return ChoirVideo.builder()
                .title(title)
                .videoUrl(videoUrl)
                .thumbnailUrl(thumbnailUrl)
                .youtubeVideoId(youtubeVideoId)
                .publishedAt(publishedAt)
                .choirName(choirName)
                .build();
    }
}
