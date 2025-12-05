package com.example.locc.service;

import com.example.locc.dto.SermonDto;
import com.example.locc.entity.Sermon;
import com.example.locc.entity.User;
import com.example.locc.exception.SermonNotFoundException;
import com.example.locc.repository.SermonRepository;
import com.example.locc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SermonService {

    private final SermonRepository sermonRepository;
    private final UserRepository userRepository;

    public List<SermonDto> findRecent(int limit) {
        log.debug("Fetching recent sermons with limit: {}", limit);
        return sermonRepository.findAll().stream()
                .limit(limit)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Page<SermonDto> findRecent(Pageable pageable) {
        log.debug("Fetching recent sermons with pagination: {}", pageable);
        return sermonRepository.findAllPaged(pageable)
                .map(this::convertToDto);
    }

    public SermonDto findLatest() {
        log.debug("Fetching latest sermon");
        return sermonRepository.findLatest()
                .map(this::convertToDto)
                .orElse(null);
    }

    public SermonDto findById(Long id) {
        log.debug("Fetching sermon by id: {}", id);
        return sermonRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new SermonNotFoundException(id));
    }

    public List<SermonDto> findByPreacher(String preacher) {
        log.debug("Fetching sermons by preacher: {}", preacher);
        return sermonRepository.findByPreacher(preacher).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Page<SermonDto> findByPreacher(String preacher, Pageable pageable) {
        log.debug("Fetching sermons by preacher: {} with pagination: {}", preacher, pageable);
        return sermonRepository.findByPreacherPaged(preacher, pageable)
                .map(this::convertToDto);
    }

    public Page<SermonDto> search(String keyword, Pageable pageable) {
        log.debug("Searching sermons with keyword: {} and pagination: {}", keyword, pageable);
        return sermonRepository.search(keyword, pageable)
                .map(this::convertToDto);
    }

    @Transactional
    public SermonDto create(SermonDto sermonDto, String email) {
        log.info("Creating new sermon: {} by user: {}", sermonDto.getTitle(), email);

        // 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        Sermon sermon = Sermon.builder()
                .title(sermonDto.getTitle())
                .scripture(sermonDto.getScripture())
                .preacher(sermonDto.getPreacher())
                .content(sermonDto.getContent())
                .audioUrl(sermonDto.getAudioUrl())
                .videoUrl(sermonDto.getVideoUrl())
                .thumbnailUrl(sermonDto.getThumbnailUrl())
                .sermonDate(sermonDto.getSermonDate())
                .createdBy(user)  // ✅ User 관계 설정
                .build();

        Sermon savedSermon = sermonRepository.save(sermon);
        return convertToDto(savedSermon);
    }

    @Transactional
    public SermonDto update(Long id, SermonDto sermonDto, String email) {
        log.info("Updating sermon id: {} by user: {}", id, email);

        Sermon sermon = sermonRepository.findById(id)
                .orElseThrow(() -> new SermonNotFoundException(id));

        // 권한 체크 (작성자 본인 또는 관리자만 수정 가능)
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        if (!sermon.getCreatedBy().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new IllegalStateException("설교를 수정할 권한이 없습니다.");
        }

        sermon.setTitle(sermonDto.getTitle());
        sermon.setScripture(sermonDto.getScripture());
        sermon.setPreacher(sermonDto.getPreacher());
        sermon.setContent(sermonDto.getContent());
        sermon.setAudioUrl(sermonDto.getAudioUrl());
        sermon.setVideoUrl(sermonDto.getVideoUrl());
        sermon.setThumbnailUrl(sermonDto.getThumbnailUrl());
        sermon.setSermonDate(sermonDto.getSermonDate());

        return convertToDto(sermon);
    }

    @Transactional
    public void delete(Long id, String email) {
        log.info("Deleting sermon id: {} by user: {}", id, email);

        Sermon sermon = sermonRepository.findById(id)
                .orElseThrow(() -> new SermonNotFoundException(id));

        // 권한 체크 (작성자 본인 또는 관리자만 삭제 가능)
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));

        if (!sermon.getCreatedBy().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new IllegalStateException("설교를 삭제할 권한이 없습니다.");
        }

        // DB에서 실제로 삭제
        sermonRepository.delete(sermon);
    }

    private SermonDto convertToDto(Sermon sermon) {
        SermonDto.SermonDtoBuilder builder = SermonDto.builder()
                .id(sermon.getId())
                .title(sermon.getTitle())
                .scripture(sermon.getScripture())
                .preacher(sermon.getPreacher())
                .content(sermon.getContent())
                .audioUrl(sermon.getAudioUrl())
                .videoUrl(sermon.getVideoUrl())
                .thumbnailUrl(sermon.getThumbnailUrl())
                .sermonDate(sermon.getSermonDate())
                .createdAt(sermon.getCreatedAt());
        
        // 작성자 정보 추가
        if (sermon.getCreatedBy() != null) {
            builder.createdById(sermon.getCreatedBy().getId())
                   .createdByEmail(sermon.getCreatedBy().getEmail())
                   .createdByName(sermon.getCreatedBy().getName());
        }
        
        return builder.build();
    }
}