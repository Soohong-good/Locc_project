package com.example.locc.domain.bible.controller;

import com.example.locc.common.ApiResponse;
import com.example.locc.domain.bible.dto.response.BiblePassageResponse;
import com.example.locc.domain.bible.service.BibleQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 성경 본문 조회 API (공개)
 * GET /api/bible/passage?ref=고린도후서9:1~15&version=개역개정
 */
@RestController
@RequestMapping("/api/bible")
@RequiredArgsConstructor
public class BibleApiController {

    private final BibleQueryService bibleQueryService;

    @GetMapping("/passage")
    public ResponseEntity<ApiResponse<BiblePassageResponse>> getPassage(
            @RequestParam String ref,
            @RequestParam(required = false) String version) {
        return ResponseEntity.ok(ApiResponse.ok(bibleQueryService.getPassage(ref, version)));
    }
}
