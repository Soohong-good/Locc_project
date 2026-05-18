package com.example.locc.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    // 캐시 이름 상수
    public static final String CACHE_STAFF        = "staffList";
    public static final String CACHE_DEPARTMENTS  = "departmentList";
    public static final String CACHE_GALLERY_TITLES = "galleryTitles";
    public static final String CACHE_YOUTUBE      = "youtubeVideos";
    public static final String CACHE_YOUTUBE_CH   = "youtubeChannelVideos";

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();

        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(jsonSerializer))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> configs = Map.of(
                // 섬김이 목록 — 1시간 (관리자가 직접 수정 시 evict)
                CACHE_STAFF, defaults.entryTtl(Duration.ofHours(1)),
                // 부서 목록 — 24시간 (거의 변경 없음)
                CACHE_DEPARTMENTS, defaults.entryTtl(Duration.ofHours(24)),
                // 갤러리 제목 목록 — 30분 (업로드 시 evict)
                CACHE_GALLERY_TITLES, defaults.entryTtl(Duration.ofMinutes(30)),
                // YouTube 재생목록 — 1시간
                CACHE_YOUTUBE, defaults.entryTtl(Duration.ofHours(1)),
                CACHE_YOUTUBE_CH, defaults.entryTtl(Duration.ofHours(1))
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaults.entryTtl(Duration.ofMinutes(10)))
                .withInitialCacheConfigurations(configs)
                .build();
    }
}
