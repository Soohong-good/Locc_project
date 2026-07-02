package com.example.locc.domain.choir.repository;

import com.example.locc.domain.choir.entity.ChoirVideo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChoirVideoRepository extends JpaRepository<ChoirVideo, Long> {

    boolean existsByYoutubeVideoId(String youtubeVideoId);

    Page<ChoirVideo> findAllByOrderByPublishedAtDesc(Pageable pageable);

    Page<ChoirVideo> findByChoirNameOrderByPublishedAtDesc(String choirName, Pageable pageable);
}
