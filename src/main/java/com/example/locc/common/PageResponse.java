package com.example.locc.common;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 페이징 공통 응답 래퍼
 *
 * Spring의 Page<T>를 그대로 직렬화하면 불필요한 필드가 너무 많음.
 * 프론트가 필요한 필드만 추려서 일관된 구조로 제공.
 *
 * 응답 예시:
 * {
 *   "content": [...],
 *   "pageInfo": {
 *     "page": 0,
 *     "size": 10,
 *     "totalElements": 42,
 *     "totalPages": 5,
 *     "first": true,
 *     "last": false
 *   }
 * }
 */
@Getter
public class PageResponse<T> {

    private final List<T> content;
    private final PageInfo pageInfo;

    private PageResponse(List<T> content, PageInfo pageInfo) {
        this.content = content;
        this.pageInfo = pageInfo;
    }

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                PageInfo.from(page)
        );
    }

    @Getter
    public static class PageInfo {
        private final int page;
        private final int size;
        private final long totalElements;
        private final int totalPages;
        private final boolean first;
        private final boolean last;

        private PageInfo(int page, int size, long totalElements,
                         int totalPages, boolean first, boolean last) {
            this.page = page;
            this.size = size;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.first = first;
            this.last = last;
        }

        public static PageInfo from(Page<?> page) {
            return new PageInfo(
                    page.getNumber(),
                    page.getSize(),
                    page.getTotalElements(),
                    page.getTotalPages(),
                    page.isFirst(),
                    page.isLast()
            );
        }
    }
}
