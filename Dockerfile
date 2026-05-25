# 1단계: Gradle로 빌드
FROM gradle:8.5-jdk17 AS build

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 파일 먼저 복사 (캐싱 최적화)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# 소스 코드 복사
COPY src ./src

# 빌드 실행 (테스트 제외)
RUN gradle build -x test --no-daemon

# 2단계: 실행 환경
FROM eclipse-temurin:17-jre-alpine

# 보안: non-root 사용자로 실행 (컨테이너 탈출 시 호스트 영향 최소화)
RUN addgroup -S locc && adduser -S locc -G locc

WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 파일 소유권 변경
RUN chown locc:locc app.jar

# 업로드/로그 디렉토리 사전 생성 + 소유권 설정
# - USER 전환 전에 생성해야 locc 유저에게 쓰기 권한이 부여됨
# - Docker 볼륨이 새로 생성될 때 이 디렉토리 권한을 그대로 상속함
RUN mkdir -p /app/uploads /app/logs && \
    chown -R locc:locc /app/uploads /app/logs

# non-root 사용자로 전환
USER locc

# 환경변수 설정 (기본값)
ENV SPRING_PROFILES_ACTIVE=prod

# 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
