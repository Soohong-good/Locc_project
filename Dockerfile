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

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 환경변수 설정 (기본값)
ENV SPRING_PROFILES_ACTIVE=prod

# 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
