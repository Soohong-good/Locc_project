package com.example.locc.domain.praisesheet.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PraiseSheetSearchCondition {

    private String keyword;

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 10;

    public void setSize(Integer size) {
        this.size = (size != null && size > 0) ? Math.min(size, 100) : 10;
    }

    public Pageable toPageable() {
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public boolean hasKeyword() {
        return keyword != null && !keyword.trim().isEmpty();
    }
}
