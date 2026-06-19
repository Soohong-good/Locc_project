# CLAUDE.md — LOCC 프로젝트 작업 가이드 (세션 인수인계)

> 이 파일은 **다른 세션의 Claude가 작업을 이어받기 위한 메모리**입니다.
> 새 세션은 작업 시작 전 이 파일을 먼저 읽으세요.

---

## 0. 프로젝트 개요

- **LOCC** = 그리스도사랑교회(Love Of Christ Church) 공식 홈페이지 풀스택 프로젝트
- **목적**: 개발 입문자(소유자)의 **IT 취업 포트폴리오 완성도 높이기**
- **스택**: Spring Boot 3 / Java 17 / JPA / MariaDB / Redis (백엔드), React 19 + Vite / Tailwind v4 (프론트), Docker · Nginx · GitHub Actions
- **백엔드 구조**: 도메인별 패키지 + **CQRS** (XxxCommandService / XxxQueryService 분리)
- 규모: 도메인 19개, Service 52, Controller 33, Repository 24, Entity 29

---

## 1. ⚠️ 작업 규칙 (반드시 지킬 것)

- **작업 브랜치**: `claude/it-career-portfolio-review-ycjde7` — **이 브랜치에서만** 개발/푸시. `master`는 건드리지 않는다.
- **소유자가 PC ↔ 클라우드 세션을 오가며 작업** → 항상 **시작 전 pull, 끝나면 push**.
- PR은 **소유자가 명시적으로 요청할 때만** 생성.
- 커밋 메시지는 한국어, 끝에 Co-Authored-By 트레일러 유지.
- 소통은 한국어. 소유자는 **입문자**이므로 비유·단계별 설명을 곁들인다.

---

## 2. ⚠️ 환경 함정 (이걸 모르면 시간 날림)

### (A) 클라우드 세션엔 JDK 17이 없고 21만 있음
`build.gradle`은 `JavaLanguageVersion.of(17)`로 고정(13번째 줄). 클라우드에서 `./gradlew test`를 돌리려면:
```bash
# 1) 임시로 21로 변경
sed -i 's/JavaLanguageVersion.of(17)/JavaLanguageVersion.of(21)/' build.gradle
chmod +x ./gradlew            # 클라우드 체크아웃 시 실행권한 종종 사라짐
./gradlew test --tests "*XxxTest" --no-daemon
# 2) 끝나면 반드시 17로 원복 (절대 21로 커밋 금지!)
sed -i 's/JavaLanguageVersion.of(21)/JavaLanguageVersion.of(17)/' build.gradle
git checkout gradlew
```
> **PC 환경 (확인됨, 2026-06 세션)**: JDK 17이 `C:\Users\zaqxs\.jdks\temurin-17.0.19`에 설치돼 있음(IntelliJ가 받은 temurin). 단 **`java`가 시스템 PATH에 없어서** `gradlew`가 그냥은 JDK를 못 찾는다. PowerShell에서 `JAVA_HOME`을 지정해 실행할 것:
> ```powershell
> $env:JAVA_HOME = "C:\Users\zaqxs\.jdks\temurin-17.0.19"
> & "C:\dev\locc\gradlew.bat" -p "C:\dev\locc" test --tests "*XxxTest" --no-daemon --console=plain
> ```
> **build.gradle은 17 그대로 두면 됨(PC에선 토글 불필요).** 21 토글은 클라우드 전용.

### (B) 클라우드 세션은 DB를 못 띄움 (중요)
Docker 데몬은 켤 수 있으나 **DB 이미지 다운로드가 차단됨(403)**. 즉 클라우드에서는:
- ✅ **Mockito 단위 테스트** (DB 불필요) → 작성·검증 가능
- ❌ **@DataJpaTest / @WebMvcTest / @SpringBootTest(DB)** → 검증 불가
  → 이런 통합 테스트는 **코드만 작성**하고 **검증은 PC나 CI에 맡긴다**. 검증 못 한 통합 테스트를 무턱대고 푸시해 CI를 깨지 말 것.

### (C) GitHub Actions API 응답이 심하게 캐시됨
이 환경의 MCP GitHub 도구는 잡 상태를 **실제보다 수 분~십 분 늦게** 반영함("in_progress"로 박혀 있음). 실제 완료 여부는 `list_workflow_jobs`의 `completed_at` 또는 잡 재조회로 판단. 폴링을 과하게 반복하지 말 것.
> **PC 세션 주의**: PC(로컬)에는 `gh` CLI도 MCP GitHub 도구도 **없다**. repo가 private이라 WebFetch도 404. → CI 결과는 **GitHub 웹 Actions 탭**에서 보거나 **클라우드 세션**(MCP GitHub 있음)에서 확인한다. PC에선 push까지만 하고 CI 확인은 다음 클라우드 세션/웹으로 미룬다.

### (D) 엔티티 빌더가 private
`Notice`, `User`, `UserAreaPermission` 등은 `@Builder(access = PRIVATE)`. 테스트에서 직접 `builder()` 못 씀.
→ 단위 테스트에선 **`mock(User.class)` 등 Mockito mock** 사용하거나, 공개 정적 팩토리(`Notice.create(...)`, `UserAreaPermission.grant(...)`)를 쓴다.
→ Mockito는 **strict stubbing**이라 실제로 호출되는 메서드만 stub할 것(단락평가 `||` 주의).

---

## 3. 진행 현황 (Phase별)

| Phase | 내용 | 상태 |
|-------|------|------|
| docs | README에 Mermaid 시스템 아키텍처 다이어그램 추가 | ✅ |
| Phase 0 | GitHub Actions CI 파이프라인(`.github/workflows/ci.yml`) — 백엔드 테스트·빌드(MariaDB+Redis 서비스, JDK17) + 프론트 빌드 | ✅ |
| Phase 1 | 프론트 ESLint 검사 추가 + 기존 린트 에러 정리 (`<Icon/>` 미사용 오탐은 코드 삭제가 아니라 **설정으로 해결**) | ✅ |
| Phase 2 | 백엔드 단위 테스트 (Mockito, DB 불필요) | 🔄 진행 중 |

### Phase 2 테스트 인벤토리 (현재 78개 단위 + contextLoads)
- `notice/service/NoticeCommandServiceTest` (6): 작성/이미지 권한, 작성자 미존재, 고정토글 NotFound/비관리자, 삭제 권한
- `notice/service/NoticeQueryServiceTest` (5): 상세/내부 NotFound, 키워드 유무 라우팅, countRecent
- `sermon/service/SermonQueryServiceTest` (8): 입력검증, 통합조회 조립, 최신1건 null, countRecent
- `user/service/UserPermissionServiceTest` (13): 권한 조회/부여/회수/보유여부 전 경로
- `user/service/UserQueryServiceTest` (17): 목록(PENDING/APPROVED 정렬)·단건 조회·카운트·이메일 중복검증 정상/예외
- `user/service/UserMyPageServiceTest` (8): 조회 NotFound, 프로필 수정, 비번 변경(소셜계정 차단/현재비번 불일치/성공)
- `user/service/UserCommandServiceTest` (18): 회원가입(중복·인증), 운영자 권한(ADMIN 차단), 승인/반려, 차단(PENDING 동시반려)/삭제, TOTP 활성화/검증
- `user/service/CustomUserDetailsServiceTest` (3): 인증 로드 — 미존재/소셜전용/정상
- `LoccApplicationTests` (1): contextLoads (CI에서 실DB로 검증)

**user 도메인 5개 서비스 단위 테스트 완결.** 로컬(PC JDK17) GREEN 확인 완료. (CI는 PC 세션에서 직접 확인 불가 → push 후 웹/클라우드에서 확인할 것 — §2C)

---

## 4. 다음 작업 우선순위 (git 변경 빈도 기준)

변경이 잦은(=버그 위험 높은) 도메인 우선. `git log` churn 분석 결과:

| 우선 | 도메인 | 변경횟수 | 메모 |
|------|--------|---------|------|
| ✅완료 | **user (전체)** | 36 | 5개 서비스(Permission·Query·MyPage·Command·UserDetails) 단위 테스트 **완결** |
| 다음 | **training** | 20 | 서비스 로직이면 클라우드/PC 단위 테스트 가능 |
| 그다음 | **department** | 18 | 〃 |
| | admin | 29 | 대부분 **컨트롤러** → DB 필요 → PC/CI |

### 향후 더 키울 수 있는 축 (선택)
- **통합 테스트**: `@DataJpaTest`로 Repository 커스텀 쿼리(search 등) 검증 → **PC/CI에서만**
- **컨트롤러 테스트**: `@WebMvcTest`+MockMvc → PC/CI
- **JaCoCo 커버리지 배지** → README 첫인상 강화
- **프론트엔드 테스트**: 현재 테스트 도구 없음(Vitest 등 도입 필요)

> 권장 흐름: **user 도메인 완결 → training → JaCoCo 배지**. "한 도메인을 끝까지 테스트"가 포트폴리오에서 깔끔.

---

## 5. 새 세션 시작 시 체크리스트
1. `git checkout claude/it-career-portfolio-review-ycjde7 && git pull` 로 최신화
2. 이 파일(§2 함정) 숙지
3. 단위 테스트 작성 → §2(A) 방식으로 로컬 검증 → 17 원복 → 커밋·푸시
4. CI GREEN 확인(§2C 캐시 주의) 후 소유자에게 보고
