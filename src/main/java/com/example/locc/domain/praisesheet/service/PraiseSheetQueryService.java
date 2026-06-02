package com.example.locc.domain.praisesheet.service;

import com.example.locc.domain.praisesheet.dto.request.PraiseSheetSearchCondition;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetDetailResponse;
import com.example.locc.domain.praisesheet.dto.response.PraiseSheetResponse;
import com.example.locc.domain.praisesheet.entity.PraiseSheet;
import com.example.locc.domain.praisesheet.repository.PraiseSheetRepository;
import com.example.locc.domain.file.dto.response.AttachmentInfo;
import com.example.locc.domain.file.service.FileQueryService;
import com.example.locc.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PraiseSheetQueryService {

    private final PraiseSheetRepository praiseSheetRepository;
    private final FileQueryService fileQueryService;

    public Page<PraiseSheetResponse> findList(PraiseSheetSearchCondition condition) {
        Page<PraiseSheet> pages = condition.hasKeyword()
                ? praiseSheetRepository.search(condition.getKeyword(), condition.toPageable())
                : praiseSheetRepository.findList(condition.toPageable());

        List<Long> ids = pages.getContent().stream().map(PraiseSheet::getId).collect(Collectors.toList());
        Map<Long, Long> fileCountMap = fileQueryService.countPraiseSheetAttachments(ids);

        return pages.map(ps -> PraiseSheetResponse.from(ps, fileCountMap.getOrDefault(ps.getId(), 0L) > 0));
    }

    public PraiseSheetDetailResponse findDetail(Long id) {
        PraiseSheet ps = praiseSheetRepository.findDetailById(id)
                .orElseThrow(() -> new NotFoundException("찬양악보를 찾을 수 없습니다. ID: " + id));
        List<AttachmentInfo> files = fileQueryService.getPraiseSheetAttachments(id);
        return PraiseSheetDetailResponse.from(ps, files);
    }

    PraiseSheet findById(Long id) {
        return praiseSheetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("찬양악보를 찾을 수 없습니다. ID: " + id));
    }
}
