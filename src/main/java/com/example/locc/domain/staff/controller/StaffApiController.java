package com.example.locc.domain.staff.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.staff.dto.request.StaffRequest;
import com.example.locc.domain.staff.dto.response.StaffResponse;
import com.example.locc.domain.staff.entity.Staff;
import com.example.locc.domain.staff.service.StaffCommandService;
import com.example.locc.domain.staff.service.StaffImageService;
import com.example.locc.domain.staff.service.StaffQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Staff API Controller
 * - 요청/응답 처리만 담당
 * - Request → Command 변환 (Controller 책임)
 * - 비즈니스 로직은 Service에 위임
 */
@Slf4j
@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffApiController {

    private final StaffCommandService staffCommandService;
    private final StaffQueryService staffQueryService;
    private final StaffImageService staffImageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StaffResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(staffQueryService.findAll()));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> listByCategory(@PathVariable Staff.StaffCategory category) {
        return ResponseEntity.ok(ApiResponse.ok(staffQueryService.findByCategory(category)));
    }

    @GetMapping("/senior-pastor")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> seniorPastors() {
        return ResponseEntity.ok(ApiResponse.ok(staffQueryService.findSeniorPastors()));
    }

    @GetMapping("/preachers")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> preachers() {
        return ResponseEntity.ok(ApiResponse.ok(staffQueryService.findPreachers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> detail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(staffQueryService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StaffResponse>> create(
            @Valid @RequestBody StaffRequest request, Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(staffCommandService.create(request.toCreateCommand(authentication.getName()))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StaffResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody StaffRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(ApiResponse.ok(staffCommandService.update(request.toUpdateCommand(id, authentication.getName()))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication authentication) {
        staffCommandService.delete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            Authentication authentication) {

        log.info("Uploading image for staff: {}", id);
        String imagePath = staffImageService.upload(image);
        StaffResponse updated = staffCommandService.updateImage(id, imagePath, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("imagePath", updated.getImagePath())));
    }

    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id, Authentication authentication) {
        log.info("Deleting image for staff: {}", id);
        StaffResponse staff = staffQueryService.findById(id);
        staffImageService.deleteByPath(staff.getImagePath());
        staffCommandService.updateImage(id, null, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
