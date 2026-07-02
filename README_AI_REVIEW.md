# AI Code Review Pipeline

Claude Code 작업 완료 시 자동으로 NVIDIA Build API를 사용해 코드 리뷰를 수행하는 파이프라인입니다.

## 동작 방식

```
Claude 응답 완료
    ↓
Stop Hook 실행 (.claude/hooks/ai-review.ps1)
    ↓
git diff HEAD → 변경 파일 추출
    ↓
변경 없거나 너무 작으면 → 종료
    ↓
NVIDIA API 호출 (qwen/qwen3.5-122b-a10b)
    ↓
결과 저장 (.claude/review/review-YYYY-MM-DD.md + .json)
    ↓
Critical/High 이슈 존재 + auto_fix=true → pending-fix.json 생성
```

## 파일 구조

```
.claude/
├── hooks/
│   └── ai-review.ps1          # Stop hook 진입점 (PowerShell)
├── scripts/
│   └── review.mjs             # Node.js 메인 로직
├── prompts/
│   ├── review-system.md       # 시스템 프롬프트
│   └── review-prompt.md       # 리뷰 요청 템플릿
├── config/
│   └── review-config.json     # 설정 파일
├── review/                    # 리뷰 결과 저장 (자동 생성)
│   ├── review-YYYY-MM-DD.md
│   ├── review-YYYY-MM-DD.json
│   └── pending-fix.json       # auto_fix 시 생성
├── logs/
│   └── review.log             # 실행 로그
└── settings.json              # Stop hook 등록
```

## 환경 설정

### 1. API Key 등록

`.env` 파일에 추가:

```
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxx
```

### 2. 설정 변경 (`.claude/config/review-config.json`)

| 항목 | 기본값 | 설명 |
|------|--------|------|
| `enabled` | `true` | 리뷰 파이프라인 활성화 여부 |
| `auto_fix` | `false` | Critical/High 이슈 발견 시 자동 수정 요청 여부 |
| `model` | `qwen/qwen3.5-122b-a10b` | NVIDIA Build 모델 ID |
| `max_tokens` | `8192` | 최대 응답 토큰 |
| `temperature` | `0.2` | 낮을수록 일관된 결과 |
| `timeout_ms` | `60000` | API 타임아웃 (ms) |
| `retry_count` | `3` | 실패 시 재시도 횟수 |
| `retry_delay_ms` | `2000` | 재시도 대기 시간 (지수 백오프) |
| `min_diff_lines` | `10` | 최소 diff 라인 수 (미만이면 스킵) |
| `severity_threshold` | `"High"` | auto_fix 트리거 기준 심각도 |

## 연결 테스트

```powershell
node .claude/scripts/review.mjs --test
```

## 리뷰 결과 보기

```powershell
# 오늘 리뷰 결과
cat .claude/review/review-2026-06-30.md

# 로그 확인
cat .claude/logs/review.log
```

## 리뷰 항목

- Spring Boot / MVC 레이어 분리
- SOLID 원칙 준수
- Clean Code (네이밍, 중복, 복잡도)
- 보안: XSS, CSRF, SQL Injection, JWT
- 성능: N+1 쿼리, 페이지네이션 누락
- 예외 처리 및 @Valid 검증
- 데드 코드 및 불필요한 import
- React: useEffect 의존성, 메모리 누수

## 이슈 심각도

| 등급 | 기준 |
|------|------|
| Critical | 보안 취약점, 데이터 손실 위험, 운영 장애 |
| High | 로직 버그, 심각한 성능 이슈, 인증 누락 |
| Medium | 코드 스멜, 유지보수 문제, 검증 누락 |
| Low | 스타일, 네이밍, 사소한 중복 |

## 문제 해결

### Hook이 실행되지 않을 때
- `.claude/settings.json`의 Stop hook 등록 확인
- PowerShell ExecutionPolicy 확인: `Get-ExecutionPolicy`
- 로그 확인: `.claude/logs/review.log`

### API 오류 시
- `NVIDIA_API_KEY` 환경변수 확인
- API Key 유효성: NVIDIA Build 콘솔에서 확인
- 연결 테스트: `node .claude/scripts/review.mjs --test`

### 리뷰가 스킵될 때
- `git diff HEAD`에 변경사항이 없는 경우 (커밋 후 상태)
- diff 라인 수가 `min_diff_lines` 미만인 경우
- `enabled: false` 설정 확인
