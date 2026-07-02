package com.example.locc.domain.choir.service;

import com.example.locc.domain.choir.dto.response.ChoirVideoResponse;
import com.example.locc.domain.choir.repository.ChoirVideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChoirQueryService {

    private final ChoirVideoRepository choirVideoRepository;

    public Page<ChoirVideoResponse> findList(Pageable pageable, String choirName) {
        Page<com.example.locc.domain.choir.entity.ChoirVideo> page = StringUtils.hasText(choirName)
                ? choirVideoRepository.findByChoirNameOrderByPublishedAtDesc(choirName, pageable)
                : choirVideoRepository.findAllByOrderByPublishedAtDesc(pageable);
        return page.map(ChoirVideoResponse::from);
    }
}
