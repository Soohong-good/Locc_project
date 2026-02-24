# 그리스도 사랑교회 웹사이트 - Spring Boot 프로젝트 구조

## 프로젝트 개요
- **프로젝트명**: locc (Love Of Christ Church)
- **프레임워크**: Spring Boot 3.5.7
- **Java 버전**: 17
- **템플릿 엔진**: Thymeleaf
- **데이터베이스**: MariaDB
- **빌드 도구**: Gradle

## 디렉토리 구조

```
locc/
├── src/
│   ├── main/
│   │   ├── java/com/example/locc/
│   │   │   ├── LoccApplication.java              # 메인 애플리케이션 클래스
│   │   │   ├── controller/                       # 컨트롤러 레이어
│   │   │   │   ├── MainController.java           # 메인 페이지 컨트롤러
│   │   │   │   ├── SermonViewController.java     # 설교 뷰 컨트롤러
│   │   │   │   └── NoticeViewController.java     # 공지사항 뷰 컨트롤러
│   │   │   ├── service/                          # 서비스 레이어
│   │   │   │   ├── SermonService.java            # 설교 비즈니스 로직
│   │   │   │   └── NoticeService.java            # 공지사항 비즈니스 로직
│   │   │   ├── repository/                       # 데이터 접근 레이어
│   │   │   │   ├── SermonRepository.java         # 설교 데이터 접근
│   │   │   │   └── NoticeRepository.java         # 공지사항 데이터 접근
│   │   │   ├── entity/                           # 엔티티 클래스
│   │   │   │   ├── Sermon.java                   # 설교 엔티티
│   │   │   │   └── Notice.java                   # 공지사항 엔티티
│   │   │   ├── dto/                              # 데이터 전송 객체
│   │   │   │   ├── SermonDto.java                # 설교 DTO
│   │   │   │   └── NoticeDto.java                # 공지사항 DTO
│   │   │   └── config/                           # 설정 클래스
│   │   │       └── WebConfig.java                # 웹 설정
│   │   └── resources/
│   │       ├── templates/                        # Thymeleaf 템플릿
│   │       │   └── main.html                     # 메인 페이지
│   │       ├── static/                           # 정적 리소스
│   │       │   ├── css/                          # CSS 파일
│   │       │   ├── js/                           # JavaScript 파일
│   │       │   └── images/                       # 이미지 파일
│   │       └── application.yml                   # 애플리케이션 설정 (별도)
│   └── test/                                     # 테스트 코드
│       └── java/com/example/locc/
│           └── LoccApplicationTests.java
├── build.gradle                                  # Gradle 빌드 설정
├── settings.gradle                               # Gradle 프로젝트 설정
└── .gitignore                                    # Git 무시 파일 목록

```

## 주요 컴포넌트 설명

### 1. Controller Layer
- **MainController**: 메인 페이지, 교회 소개, 예배 안내, 부서 안내, 오시는 길 등 정적 페이지 처리
- **SermonViewController**: 설교 목록 조회, 상세 조회, 최신 설교 조회
- **NoticeViewController**: 공지사항 목록 조회, 상세 조회

### 2. Service Layer
- **SermonService**: 설교 관련 비즈니스 로직 처리 (조회, 변환)
- **NoticeService**: 공지사항 관련 비즈니스 로직 처리 (조회, 조회수 증가)

### 3. Repository Layer
- **SermonRepository**: 설교 데이터 CRUD 및 커스텀 쿼리
- **NoticeRepository**: 공지사항 데이터 CRUD 및 정렬 쿼리

### 4. Entity Layer
- **Sermon**: 설교 테이블 매핑 (제목, 본문, 목사님, 날짜, URL 등)
- **Notice**: 공지사항 테이블 매핑 (제목, 내용, 작성자, 조회수 등)

### 5. DTO Layer
- **SermonDto**: 설교 데이터 전송 객체
- **NoticeDto**: 공지사항 데이터 전송 객체

### 6. Config Layer
- **WebConfig**: 정적 리소스 핸들링 및 뷰 컨트롤러 설정

## 데이터베이스 스키마

### Sermon Table
```sql
CREATE TABLE sermon (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    scripture VARCHAR(100),
    preacher VARCHAR(50),
    content TEXT,
    audio_url VARCHAR(500),
    video_url VARCHAR(500),
    sermon_date DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Notice Table
```sql
CREATE TABLE notice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author VARCHAR(50),
    view_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

## URL 매핑

### 메인 페이지
- `GET /` - 홈페이지
- `GET /about` - 교회 소개
- `GET /worship` - 예배 안내
- `GET /ministry` - 부서 안내
- `GET /contact` - 오시는 길

### 설교
- `GET /sermon` - 설교 목록
- `GET /sermon/{id}` - 설교 상세
- `GET /sermon/latest` - 최신 설교

### 공지사항
- `GET /notice` - 공지사항 목록
- `GET /notice/{id}` - 공지사항 상세

## 의존성 (build.gradle)

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    compileOnly 'org.projectlombok:lombok'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    runtimeOnly 'org.mariadb.jdbc:mariadb-java-client'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

## 환경 설정

### 1. 환경 변수 설정

프로젝트는 민감한 정보를 환경 변수로 관리합니다. `.env.example` 파일을 복사하여 `.env` 파일을 생성하고 실제 값으로 변경하세요.

```bash
cp .env.example .env
```

### 2. 필수 환경 변수

**데이터베이스:**
```bash
DB_URL=jdbc:mariadb://localhost:3306/locc
DB_USERNAME=loccuser
DB_PASSWORD=your-password
```

**JWT 설정:**
```bash
# ⚠️ 운영 환경에서는 반드시 강력한 키로 변경!
JWT_SECRET=your-secret-key-minimum-256-bits
```

**이메일 (Gmail SMTP):**
```bash
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**외부 API:**
```bash
KAKAO_MAP_API_KEY=your-kakao-map-api-key
YOUTUBE_API_KEY=your-youtube-api-key
```

### 3. 환경별 프로파일

**로컬 개발 환경:**
```bash
SPRING_PROFILES_ACTIVE=local
JPA_DDL_AUTO=update
THYMELEAF_CACHE=false
ERROR_INCLUDE_STACKTRACE=always
LOG_LEVEL_APP=DEBUG
```

**운영 환경:**
```bash
SPRING_PROFILES_ACTIVE=prod
JPA_DDL_AUTO=validate
THYMELEAF_CACHE=true
ERROR_INCLUDE_STACKTRACE=never
LOG_LEVEL_APP=INFO
```

### 4. 설정 파일 구조

```
resources/
├── application.yml           # 공통 설정 (환경변수 기반)
├── application-local.yml     # 로컬 개발 전용 설정
└── application-prod.yml      # 운영 환경 전용 설정
```

**특징:**
- 민감한 정보는 모두 환경변수로 관리
- `application-local.yml`과 `application-prod.yml`은 Git에 추적되지 않음
- 환경별 차이만 각 파일에 정의

### 5. OAuth2 설정 (선택사항)

소셜 로그인 기능 사용 시:

**Kakao:**
- https://developers.kakao.com 에서 앱 생성
- REST API 키를 `KAKAO_CLIENT_ID`에 설정

**Naver:**
- https://developers.naver.com 에서 앱 생성
- Client ID와 Secret을 설정

## 실행 방법

### 1. 데이터베이스 설정
application.yml 파일에서 데이터베이스 설정 확인 및 수정

### 2. 빌드
```bash
./gradlew build
```

### 3. 실행
```bash
./gradlew bootRun
```

### 4. 접속
브라우저에서 `http://localhost:8080` 접속

## 테스트 실행

### 테스트 데이터베이스 설정

테스트는 MariaDB를 사용합니다. 테스트 실행 전에 MariaDB를 설치하고 실행해주세요.

**테스트 DB 설정 (`src/test/resources/application-test.yml`)**
```yaml
spring:
  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://localhost:3306/locc_test?createDatabaseIfNotExist=true
    username: root
    password: 
```

### MariaDB 설치 및 실행

1. **Windows**
   ```bash
   # MariaDB 다운로드 및 설치
   # https://mariadb.org/download/
   
   # 서비스 시작
   net start MariaDB
   ```

2. **테스트 실행**
   ```bash
   # 전체 테스트
   gradlew test
   
   # 특정 테스트만 실행
   gradlew test --tests "com.example.locc.service.*"
   ```

### 테스트 구조

- **Unit Tests**: Mockito를 사용한 단위 테스트 (DB 불필요)
  - `AuthServiceTest`
  - `NoticeServiceTest`
  - `SermonServiceTest`

- **Integration Tests**: 실제 DB를 사용하는 통합 테스트
  - `NoticeRepositoryTest`
  - `NoticeApiIntegrationTest`

**참고**: Integration 테스트는 MariaDB가 실행 중이어야 합니다.

## 추가 구현 예정 사항

1. **관리자 페이지**: 설교, 공지사항 CRUD 기능
2. **파일 업로드**: 설교 오디오/비디오, 공지사항 첨부파일
3. **검색 기능**: 설교, 공지사항 검색
4. **페이징**: 목록 페이지 페이징 처리
5. **댓글 기능**: 설교, 공지사항 댓글
6. **회원 관리**: 회원가입, 로그인, 권한 관리
7. **예배 실시간 스트리밍**: 유튜브 라이브 연동
8. **교회 앨범**: 사진 갤러리

## 기술 스택 요약

- **Backend**: Spring Boot 3.5.7, Spring Data JPA, Spring MVC
- **Frontend**: Thymeleaf, Tailwind CSS, Vanilla JavaScript
- **Database**: MariaDB
- **Build**: Gradle
- **Java**: 17
- **Library**: Lombok (코드 간소화)