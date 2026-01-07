package com.example.locc.domain.notice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Notice 검색 조건
 * 검색 파라미터를 하나의 객체로 관리
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeSearchCondition {
    
    private String keyword;
    
    @Builder.Default
    private Integer page = 0;
    
    @Builder.Default
    private Integer size = 10;
    
    @Builder.Default
    private String sortBy = "createdAt";
    
    @Builder.Default
    private Sort.Direction direction = Sort.Direction.DESC;
    
    /**
     * Pageable 객체로 변환
     */
    public Pageable toPageable() {
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }
    
    /**
     * 검색 조건이 있는지 확인
     */
    public boolean hasKeyword() {
        return keyword != null && !keyword.trim().isEmpty();
    }
}
