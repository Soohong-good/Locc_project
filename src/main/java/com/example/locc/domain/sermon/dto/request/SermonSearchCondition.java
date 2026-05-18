package com.example.locc.domain.sermon.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Sermon 검색 조건
 * 검색 파라미터를 하나의 객체로 관리
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SermonSearchCondition {
    
    private String keyword;
    private String category;
    
    @Builder.Default
    private Integer page = 0;
    
    @Builder.Default
    private Integer size = 10;
    
    @Builder.Default
    private String sortBy = "sermonDate";
    
    @Builder.Default
    private Sort.Direction direction = Sort.Direction.DESC;
    
    public void setSize(Integer size) {
        this.size = (size != null && size > 0) ? Math.min(size, 100) : 10;
    }

    /**
     * Pageable 객체로 변환
     */
    public Pageable toPageable() {
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }
    
    /**
     * 키워드 검색 조건이 있는지 확인
     */
    public boolean hasKeyword() {
        return keyword != null && !keyword.trim().isEmpty();
    }
    
    /**
     * 카테고리 검색 조건이 있는지 확인
     */
    public boolean hasCategory() {
        return category != null && !category.trim().isEmpty();
    }
}
