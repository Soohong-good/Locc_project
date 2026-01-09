package com.example.locc.domain.admin.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 방문자 통계 Entity
 * - Phase 4에서 사용
 * - Redis 카운팅 → DB 스냅샷 저장
 */
@Entity
@Table(name = "visitor_statistics")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VisitorStatistics {
    
    @Id
    @Column(name = "stat_date")
    private LocalDate statDate;
    
    /**
     * 페이지뷰 카운트 (전체 요청 수)
     * 정적 리소스, 관리자 페이지 제외
     */
    @Column(name = "page_view_count", nullable = false)
    private Integer pageViewCount;
    
    /**
     * 방문 카운트 (현재는 pageViewCount와 동일)
     * TODO Phase 4.5: Unique visitor 추적 시 의미 분리
     */
    @Column(name = "visit_count", nullable = false)
    private Integer visitCount;
    
    /**
     * 고유 방문자 수 (Phase 4.5에서 구현)
     */
    @Column(name = "unique_visitor_count")
    private Integer uniqueVisitorCount;
    
    /**
     * 정적 팩토리 메서드
     */
    public static VisitorStatistics create(LocalDate date) {
        VisitorStatistics stats = new VisitorStatistics();
        stats.statDate = date;
        stats.visitCount = 0;
        stats.pageViewCount = 0;
        stats.uniqueVisitorCount = 0;
        return stats;
    }
    
    /**
     * 카운트 업데이트 (Phase 4에서 Scheduler가 호출)
     */
    public void setVisitCount(Integer count) {
        this.visitCount = count;
    }
    
    public void setPageViewCount(Integer count) {
        this.pageViewCount = count;
    }
    
    public void setUniqueVisitorCount(Integer count) {
        this.uniqueVisitorCount = count;
    }
}
