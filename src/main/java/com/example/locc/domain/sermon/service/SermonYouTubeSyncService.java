package com.example.locc.domain.sermon.service;

import com.example.locc.config.YouTubeProperties;
import com.example.locc.domain.department.service.YouTubeService;
import com.example.locc.domain.sermon.entity.Sermon;
import com.example.locc.domain.sermon.repository.SermonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * YouTube 재생목록 기반 설교 자동 동기화 서비스
 *
 * 스케줄:
 *   - 월요일 03:00 KST: 주일오전 1·2부 + 주일오후
 *   - 목요일 03:00 KST: 수요예배
 *   - 토요일 03:00 KST: 금요기도회
 *
 * 중복 방지 기준 (둘 다 체크):
 *   1. youtubeVideoId — 동일 영상 재등록 방지
 *   2. category + sermonDate (+ serviceNumber) — 수동 작성 설교와의 충돌 방지
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SermonYouTubeSyncService {

    private final YouTubeService youTubeService;
    private final SermonRepository sermonRepository;
    private final YouTubeProperties youTubeProperties;

    // 제목에서 날짜를 추출하는 패턴 (우선순위 순)
    private static final List<Pattern> DATE_PATTERNS = List.of(
            // 2024. 5. 26. / 2024.05.26 / 2024-05-26 / 2024/05/26
            Pattern.compile("(\\d{4})[.\\-/]\\s*(\\d{1,2})[.\\-/]\\s*(\\d{1,2})"),
            // 2024년 5월 26일
            Pattern.compile("(\\d{4})년\\s*(\\d{1,2})월\\s*(\\d{1,2})일"),
            // 240526 (yyMMdd, 6자리 단독)
            Pattern.compile("(?<!\\d)(\\d{2})(\\d{2})(\\d{2})(?!\\d)")
    );

    // 제목 앞 날짜 제거용 (위치 무관 추출 패턴과 달리 앞부분 전용)
    private static final Pattern LEADING_DATE_PATTERN = Pattern.compile(
            "^\\d{2,4}[.\\-/]\\s*\\d{1,2}[.\\-/]\\s*\\d{1,2}\\.?\\s*"
    );
    // 예배 유형 키워드 (날짜 뒤에 오는 경우)
    private static final Pattern SERVICE_TYPE_PATTERN = Pattern.compile(
            "^(수요예배|금요기도회|금요예배|주일오전예배|주일오후예배|주일오전|주일오후|주일예배|새벽기도회|새벽기도|[12]부)[.。,\\s]*"
    );
    // 성경 구절: 괄호 안에 숫자:숫자 형식 (잠 11:30 / 마 5:1-12 등)
    private static final Pattern SCRIPTURE_PATTERN = Pattern.compile(
            "\\(([^)]*\\d+[:\\-]\\d+[^)]*)\\)"
    );
    // 설교자: 끝에 한글이름(2~4자) + 직함
    private static final Pattern PREACHER_PATTERN = Pattern.compile(
            "([가-힣]{2,4})\\s*(목사님?|전도사님?|강도사님?|장로님?|집사님?)\\s*$"
    );

    private record ParsedTitle(String title, String scripture, String preacher) {}

    private ParsedTitle parseTitle(String rawTitle) {
        if (rawTitle == null) return new ParsedTitle("제목 없음", null, null);

        String text = rawTitle.trim();

        // 1. 앞 날짜 제거 (26.06.10 / 2026.06.10 형식)
        Matcher dateMatcher = LEADING_DATE_PATTERN.matcher(text);
        if (dateMatcher.find()) {
            text = text.substring(dateMatcher.end()).trim();
        }

        // 2. 예배 유형 키워드 제거
        Matcher typeMatcher = SERVICE_TYPE_PATTERN.matcher(text);
        if (typeMatcher.find()) {
            text = text.substring(typeMatcher.end()).trim();
        }

        // 2-1. 주일 1부 / 주일 2부 제거 (위치 무관)
        text = text.replaceAll("주일\\s*[12]부[.。,\\s]*", "").trim();

        // 3. 성경 구절 추출
        String scripture = null;
        Matcher scriptureMatcher = SCRIPTURE_PATTERN.matcher(text);
        if (scriptureMatcher.find()) {
            scripture = scriptureMatcher.group(1).trim();
            if (scripture.length() > 100) scripture = scripture.substring(0, 100);
            text = (text.substring(0, scriptureMatcher.start()) + text.substring(scriptureMatcher.end())).trim();
        }

        // 4. 설교자 추출 (끝에 이름+직함)
        String preacher = null;
        Matcher preacherMatcher = PREACHER_PATTERN.matcher(text);
        if (preacherMatcher.find()) {
            preacher = preacherMatcher.group(0).trim();
            if (preacher.length() > 50) preacher = preacher.substring(0, 50);
            text = text.substring(0, preacherMatcher.start()).trim();
        }

        // 5. 끝 구두점 정리
        text = text.replaceAll("[.。,\\s]+$", "").trim();
        if (text.isEmpty()) text = rawTitle; // 파싱 실패 시 원본 유지
        if (text.length() > 200) text = text.substring(0, 200);

        return new ParsedTitle(text, scripture, preacher);
    }

    // ── 스케줄 메서드 ────────────────────────────────────────────────

    @Scheduled(cron = "0 0 3 * * MON", zone = "Asia/Seoul")
    @Transactional
    public void syncSundayServices() {
        log.info("[YouTube 동기화] 주일 예배 시작");
        syncPlaylist("sunday-morning-1", "주일오전", 1);
        syncPlaylist("sunday-morning-2", "주일오전", 2);
        syncPlaylist("sunday-afternoon", "주일오후", null);
        log.info("[YouTube 동기화] 주일 예배 완료");
    }

    @Scheduled(cron = "0 0 3 * * THU", zone = "Asia/Seoul")
    @Transactional
    public void syncWednesdayService() {
        log.info("[YouTube 동기화] 수요예배 시작");
        syncPlaylist("wednesday", "기타예배", 1);
        log.info("[YouTube 동기화] 수요예배 완료");
    }

    @Scheduled(cron = "0 0 3 * * SAT", zone = "Asia/Seoul")
    @Transactional
    public void syncFridayService() {
        log.info("[YouTube 동기화] 금요기도회 시작");
        syncPlaylist("friday", "기타예배", 2);
        log.info("[YouTube 동기화] 금요기도회 완료");
    }

    // ── 관리자 수동 트리거 ───────────────────────────────────────────

    /**
     * 재생목록 키로 수동 동기화 (관리자 API에서 호출)
     * @return 새로 생성된 설교 수
     */
    @Transactional
    public int syncByKey(String playlistKey) {
        return switch (playlistKey) {
            case "sunday-morning-1" -> syncPlaylist("sunday-morning-1", "주일오전", 1);
            case "sunday-morning-2" -> syncPlaylist("sunday-morning-2", "주일오전", 2);
            case "sunday-afternoon" -> syncPlaylist("sunday-afternoon", "주일오후", null);
            case "wednesday"        -> syncPlaylist("wednesday", "기타예배", 1);
            case "friday"           -> syncPlaylist("friday", "기타예배", 2);
            default -> throw new IllegalArgumentException("알 수 없는 재생목록 키: " + playlistKey);
        };
    }

    /**
     * 전체 수동 동기화 (관리자 API에서 호출)
     * @return 재생목록 키 → 생성 수 맵
     */
    @Transactional
    public Map<String, Integer> syncAll() {
        return Map.of(
                "sunday-morning-1", syncPlaylist("sunday-morning-1", "주일오전", 1),
                "sunday-morning-2", syncPlaylist("sunday-morning-2", "주일오전", 2),
                "sunday-afternoon", syncPlaylist("sunday-afternoon", "주일오후", null),
                "wednesday",        syncPlaylist("wednesday", "기타예배", 1),
                "friday",           syncPlaylist("friday", "기타예배", 2)
        );
    }

    // ── 내부 동기화 로직 ─────────────────────────────────────────────

    private int syncPlaylist(String playlistKey, String category, Integer serviceNumber) {
        String playlistId = youTubeProperties.getPlaylistId(playlistKey);
        if (!StringUtils.hasText(playlistId)) {
            log.warn("[YouTube 동기화] 재생목록 ID 없음: key={}", playlistKey);
            return 0;
        }

        List<Map<String, String>> videos = youTubeService.getLatestVideos(playlistId, 3);
        if (videos.isEmpty()) {
            log.warn("[YouTube 동기화] 영상 없음: key={}", playlistKey);
            return 0;
        }

        int created = 0;
        for (Map<String, String> video : videos) {
            String videoId   = video.get("videoId");
            String title     = video.get("title");
            String thumbnail = video.get("thumbnail");
            String publishedAt = video.get("publishedAt");

            // ① videoId 중복 체크 (동일 영상 재등록 방지)
            if (sermonRepository.existsByYoutubeVideoId(videoId)) {
                log.debug("[YouTube 동기화] 이미 등록됨: videoId={}", videoId);
                continue;
            }

            // ② 날짜 파싱 (제목 우선, publishedAt 폴백)
            LocalDate sermonDate = parseDateFromTitle(title);
            if (sermonDate == null) {
                sermonDate = parseDateFromPublishedAt(publishedAt);
            }
            if (sermonDate == null) {
                log.warn("[YouTube 동기화] 날짜 파싱 실패: title={}, publishedAt={}", title, publishedAt);
                continue;
            }

            // ③ 날짜+카테고리(+부) 중복 체크 (수동 작성 설교 충돌 방지)
            boolean exists = serviceNumber != null
                    ? sermonRepository.existsByCategoryAndSermonDateAndServiceNumber(category, sermonDate, serviceNumber)
                    : sermonRepository.existsByCategoryAndSermonDate(category, sermonDate);
            if (exists) {
                log.info("[YouTube 동기화] 해당 날짜 설교 이미 존재: category={}, date={}, serviceNumber={}",
                        category, sermonDate, serviceNumber);
                continue;
            }

            // ④ 제목 정제 (날짜·예배유형 제거, 성경구절·설교자 분리)
            ParsedTitle parsed = parseTitle(title);

            // ⑤ 설교 자동 생성
            String videoUrl = "https://www.youtube.com/watch?v=" + videoId;
            Sermon sermon = Sermon.createFromYouTube(parsed.title(), parsed.scripture(), parsed.preacher(),
                    category, serviceNumber, sermonDate, videoUrl, thumbnail, videoId);
            sermonRepository.save(sermon);
            log.info("[YouTube 동기화] 설교 생성: category={}, date={}, title={}, preacher={}, scripture={}",
                    category, sermonDate, parsed.title(), parsed.preacher(), parsed.scripture());
            created++;
        }
        return created;
    }

    // ── 날짜 파싱 헬퍼 ──────────────────────────────────────────────

    private LocalDate parseDateFromTitle(String title) {
        if (title == null) return null;
        for (Pattern pattern : DATE_PATTERNS) {
            Matcher m = pattern.matcher(title);
            if (m.find()) {
                try {
                    int g1 = Integer.parseInt(m.group(1));
                    int g2 = Integer.parseInt(m.group(2));
                    int g3 = Integer.parseInt(m.group(3));
                    int year = g1 < 100 ? 2000 + g1 : g1;
                    if (year < 2020 || year > 2040 || g2 < 1 || g2 > 12 || g3 < 1 || g3 > 31) continue;
                    return LocalDate.of(year, g2, g3);
                } catch (Exception ignored) {
                    // 다음 패턴 시도
                }
            }
        }
        return null;
    }

    private LocalDate parseDateFromPublishedAt(String publishedAt) {
        if (publishedAt == null || publishedAt.length() < 10) return null;
        try {
            return LocalDate.parse(publishedAt.substring(0, 10));
        } catch (Exception ignored) {
            return null;
        }
    }
}
