package com.example.locc.domain.application.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.common.PageResponse;
import com.example.locc.domain.application.dto.request.FacilitySearchCondition;
import com.example.locc.domain.application.dto.response.FacilityCategoryResponse;
import com.example.locc.domain.application.dto.response.FacilityApplicationDetailResponse;
import com.example.locc.domain.application.dto.response.FacilityApplicationResponse;
import com.example.locc.domain.application.service.FacilityCommandService;
import com.example.locc.domain.application.service.FacilityQueryService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/facility-applications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
public class ApplicationAdminApiController {

    private final FacilityCommandService commandService;
    private final FacilityQueryService   queryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<FacilityApplicationResponse>>> list(
            @ModelAttribute FacilitySearchCondition condition) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(queryService.findListForAdmin(condition))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityApplicationDetailResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(queryService.findDetail(id)));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<FacilityApplicationDetailResponse>> complete(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String adminMemo = body != null ? body.get("adminMemo") : null;
        return ResponseEntity.ok(ApiResponse.ok(commandService.complete(id, adminMemo)));
    }

    @PatchMapping("/{id}/memo")
    public ResponseEntity<ApiResponse<FacilityApplicationDetailResponse>> updateMemo(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(commandService.updateAdminMemo(id, body.get("adminMemo"))));
    }

    @GetMapping("/excel")
    public void downloadExcel(@ModelAttribute FacilitySearchCondition condition,
                              HttpServletResponse response) throws IOException {
        commandService.downloadExcel(condition, response);
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<FacilityCategoryResponse>>> categories() {
        return ResponseEntity.ok(ApiResponse.ok(queryService.findAllCategories()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Void>> createCategory(@RequestBody Map<String, Object> body) {
        commandService.createCategory(
                (String) body.get("name"),
                (String) body.get("description"),
                body.get("sortOrder") != null ? (Integer) body.get("sortOrder") : 0);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> updateCategory(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        commandService.updateCategory(id,
                (String) body.get("name"),
                (String) body.get("description"),
                body.get("sortOrder") != null ? (Integer) body.get("sortOrder") : 0);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PatchMapping("/categories/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleCategory(@PathVariable Long id) {
        commandService.toggleCategoryActive(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
