package com.example.locc.domain.helprequest.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.helprequest.dto.request.HelpRequestCreateRequest;
import com.example.locc.domain.helprequest.dto.response.HelpRequestResponse;
import com.example.locc.domain.helprequest.service.HelpRequestCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 도움 요청 API Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/help-request")
@RequiredArgsConstructor
public class HelpRequestApiController {

    private final HelpRequestCommandService helpRequestCommandService;

    @PostMapping
    public ResponseEntity<ApiResponse<HelpRequestResponse>> create(@Valid @RequestBody HelpRequestCreateRequest request) {
        log.debug("[도움 요청 API] 요청 수신");
        return ResponseEntity.ok(ApiResponse.ok(helpRequestCommandService.create(request.toCommand())));
    }
}
