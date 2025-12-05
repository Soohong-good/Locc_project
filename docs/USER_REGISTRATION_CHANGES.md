# 회원가입 요구사항 변경사항

## 변경 개요
회원가입 시스템을 교회 교인 관리에 맞게 재설계하였습니다.

## 주요 변경사항

### 1. 권한 체계
- **기존**: USER, ADMIN
- **변경 후**: 
  - Role: USER, ADMIN (유지)
  - UserType: REGISTERED(등록교인), UNREGISTERED(미등록교인) 추가

### 2. User 엔티티 변경

#### PK 변경
- **기존**: Long id (Auto Increment)
- **변경 후**: UUID id (자동 생성)
  - MariaDB에서 BINARY(16)으로 저장
  - @PrePersist로 자동 생성

#### 필드 변경

**삭제된 필드:**
- username (사용자명)
- fullName (이름)

**추가된 필드:**
- name (이름) - 필수
- gender (성별) - 필수
- phoneNumber (전화번호) - 필수
- userType (회원 유형) - 필수
- address (주소) - 미등록교인 필수
- birth (생년월일) - 미등록교인 필수
- registrationPath (등록 경로, 500자 이내) - 미등록교인 필수

**변경된 인증 방식:**
- 기존: username 기반 로그인
- 변경 후: email 기반 로그인

### 3. 회원 유형별 요구사항

#### 등록교인 (REGISTERED)
필수 입력 항목:
- email
- password
- name
- gender
- phoneNumber

#### 미등록교인 (UNREGISTERED)
필수 입력 항목:
- email
- password
- name
- gender
- phoneNumber
- address
- birth
- registrationPath (500자 이내)

### 4. 수정된 파일 목록

#### Entity
- `User.java`
  - UUID PK로 변경
  - 필드 구조 재설계
  - UserType enum 추가
  - @PrePersist로 UUID 자동 생성

#### DTO
- `RegisterRequest.java` - 회원가입 요청 DTO
- `LoginRequest.java` - email 기반 로그인
- `UserInfoResponse.java` - 사용자 정보 응답 DTO

#### Repository
- `UserRepository.java`
  - UUID 기반으로 변경
  - username 관련 메서드 제거
  - email 기반 메서드로 변경

#### Service
- `AuthService.java`
  - 회원가입 로직에 UserType별 검증 추가
  - email 기반 인증으로 변경
- `CustomUserDetailsService.java`
  - email 기반 사용자 조회

#### Controller
- `AuthController.java`
  - email 기반 로그인/회원가입 API
  - UserInfoResponse에 새 필드 포함

#### Test
- `AuthServiceTest.java`
  - 모든 테스트 케이스 업데이트
  - 미등록교인 테스트 추가

#### Database Migration
- `V2__update_user_schema.sql`
  - users 테이블 재생성
  - refresh_tokens 테이블 FK 수정
  - notice, sermon 테이블 FK 수정

## API 변경사항

### 회원가입 API
**Endpoint**: `POST /api/auth/register`

**요청 예시 - 등록교인:**
```json
{
  "email": "user@example.com",
  "password": "password123!",
  "name": "홍길동",
  "gender": "남",
  "phoneNumber": "010-1234-5678",
  "userType": "REGISTERED"
}
```

**요청 예시 - 미등록교인:**
```json
{
  "email": "guest@example.com",
  "password": "password123!",
  "name": "김철수",
  "gender": "남",
  "phoneNumber": "010-9876-5432",
  "userType": "UNREGISTERED",
  "address": "서울시 강남구 테헤란로 123",
  "birth": "1990-01-01",
  "registrationPath": "친구 소개로 방문했습니다."
}
```

### 로그인 API
**Endpoint**: `POST /api/auth/login`

**요청 예시:**
```json
{
  "email": "user@example.com",
  "password": "password123!"
}
```

### 사용자 정보 조회 API
**Endpoint**: `GET /api/auth/me`

**응답 예시:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "홍길동",
  "gender": "남",
  "phoneNumber": "010-1234-5678",
  "role": "USER",
  "userType": "REGISTERED",
  "address": null,
  "birth": null,
  "registrationPath": null
}
```

## 데이터베이스 마이그레이션

### 실행 방법
1. 기존 데이터는 `users_backup` 테이블에 백업됩니다.
2. `V2__update_user_schema.sql` 마이그레이션이 자동 실행됩니다.
3. 테스트 후 백업 테이블 삭제: `DROP TABLE users_backup;`

### 주의사항
- 기존 사용자 데이터는 새 스키마와 호환되지 않습니다.
- 프로덕션 배포 전 데이터 마이그레이션 스크립트가 필요할 수 있습니다.

## 테스트

### 단위 테스트
```bash
./gradlew test --tests AuthServiceTest
```

### 통합 테스트
```bash
./gradlew test
```

## 향후 작업
1. 프론트엔드 회원가입/로그인 폼 수정
2. 기존 데이터 마이그레이션 스크립트 작성 (필요시)
3. 관리자 페이지에서 회원 유형별 필터링 기능 추가
4. 미등록교인 전환 기능 (미등록 → 등록교인)
