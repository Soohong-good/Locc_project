package com.example.locc.domain.application.entity;

public enum FacilityApplicationStatus {

    PENDING("접수 대기"),
    COMPLETED("처리 완료");

    private final String label;

    FacilityApplicationStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
