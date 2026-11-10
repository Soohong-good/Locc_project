# ── Stage 1: React 빌드 ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# package.json 먼저 복사 → 의존성 레이어 캐싱 최적화
# (소스 코드가 바뀌어도 의존성이 동일하면 npm ci 단계 재사용)
COPY package*.json ./
RUN npm ci

# 루트 .env의 Vite 변수를 빌드 ARG → ENV로 주입
ARG VITE_APP_NAME
ARG VITE_KAKAO_MAP_KEY
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_KAKAO_MAP_KEY=$VITE_KAKAO_MAP_KEY

# 소스 코드 복사 후 빌드
COPY . .
RUN NODE_OPTIONS=--max-old-space-size=1536 npm run build

# ── Stage 2: Nginx로 정적 파일 서빙 ──────────────────────────────
FROM nginx:1.25-alpine

# 기본 nginx 설정 제거 후 커스텀 설정 적용
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf

# 빌드된 React 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 보안: nginx가 필요한 디렉토리 쓰기 권한 설정 (non-root 실행 대비)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
