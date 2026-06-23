# syntax=docker/dockerfile:1

# -----------------------------------------------------------------------------
# 1) Build stage — Vite 프로덕션 번들 생성
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# 의존성 레이어 캐싱: 매니페스트 먼저 복사
COPY package.json package-lock.json* ./
RUN npm install

# 소스 복사 후 빌드
COPY . .

# VITE_API_URL 은 빌드 타임에 번들에 인라인된다.
# 배포 시: --build-arg VITE_API_URL=https://api.example.com/api
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# -----------------------------------------------------------------------------
# 2) Serve stage — nginx 정적 서빙 (SPA history fallback)
# -----------------------------------------------------------------------------
FROM nginx:alpine AS serve

# SPA 라우팅 fallback 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 산출물 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
