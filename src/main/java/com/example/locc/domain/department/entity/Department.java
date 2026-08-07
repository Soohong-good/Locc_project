package com.example.locc.domain.department.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "departments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Department {

    /**
     * 교회 자체 갤러리 전용 코드 — 사역 부서가 아니라 "그리스도사랑교회 > 갤러리"의 저장소 역할
     * (gallery_image.department_id가 NOT NULL이라 부서 레코드를 빌려 쓰는 구조)
     * 부서 목록·부서 갤러리 조회에서는 제외된다.
     */
    public static final String CHURCH_CODE = "church";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // nursery, preschool, children, youth, young-adults, newcomers, multiethnic

    @Column(nullable = false, length = 100)
    private String name; // 태영아부, 유아유치부, 초등부...

    @Column(length = 100)
    private String nameEn; // Nursery Ministry, Preschool Ministry...

    @Column(length = 500)
    private String description; // 부서 설명 (예: "0세~4세 영유아를 위한 신앙 교육")

    // 예배 정보
    @Column(length = 50)
    private String worshipTime; // 예배 시간 (예: "오후 1시 30분")

    @Column(length = 50)
    private String worshipTimeEn; // 예배 시간 영문 (예: "1:30 PM")

    @Column(length = 100)
    private String worshipLocation; // 예배 장소 (예: "204호")

    @Column(length = 100)
    private String worshipLocationEn; // 예배 장소 영문 (예: "Room 204")

    // 특징 (JSON 또는 구분자로 저장 가능, 일단 3개 필드로)
    @Column(length = 200)
    private String feature1; // 특징 1

    @Column(length = 200)
    private String feature2; // 특징 2

    @Column(length = 200)
    private String feature3; // 특징 3

    @Column(length = 255)
    private String youtubeChannelId; // 유튜브 채널 ID

    @Column(length = 255)
    private String latestVideoId; // 최신 영상 ID (캐시용)

    @Column(length = 500)
    private String latestVideoTitle; // 최신 영상 제목 (캐시용)

    // 정적 팩토리 메서드
    public static Department create(String code, String name, String nameEn) {
        Department department = new Department();
        department.code = code;
        department.name = name;
        department.nameEn = nameEn;
        return department;
    }

    // 유튜브 채널 설정
    public void setYoutubeChannel(String youtubeChannelId) {
        this.youtubeChannelId = youtubeChannelId;
    }

    // 최신 영상 업데이트
    public void updateLatestVideo(String videoId, String videoTitle) {
        this.latestVideoId = videoId;
        this.latestVideoTitle = videoTitle;
    }
}
