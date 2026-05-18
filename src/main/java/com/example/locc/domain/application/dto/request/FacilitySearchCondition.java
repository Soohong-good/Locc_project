package com.example.locc.domain.application.dto.request;

import com.example.locc.domain.application.entity.FacilityApplicationStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Getter
@Setter
public class FacilitySearchCondition {

    private Long categoryId;
    private FacilityApplicationStatus status;
    private int page = 0;
    private int size = 20;

    public void setSize(int size) {
        this.size = size > 0 ? Math.min(size, 100) : 20;
    }

    public Pageable toPageable() {
        return PageRequest.of(page, size);
    }
}
