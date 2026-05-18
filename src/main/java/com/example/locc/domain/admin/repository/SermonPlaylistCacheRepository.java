package com.example.locc.domain.admin.repository;

import com.example.locc.domain.admin.entity.SermonPlaylistCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SermonPlaylistCacheRepository extends JpaRepository<SermonPlaylistCache, Long> {
    Optional<SermonPlaylistCache> findByPlaylistKey(String playlistKey);
}
