# syntax=docker/dockerfile:1
# 테이블오더 Server API 프로덕션 이미지 (multi-stage)
#
# 중요: 빌드 컨텍스트는 "리포지토리 루트"여야 합니다.
#   knexfile.ts 가 마이그레이션/시드를 ../database 경로로 참조하므로
#   컨테이너 내부에서 server/ 와 database/ 의 상대 위치를 동일하게 유지합니다.
#
# 빌드 예시 (리포 루트에서):
#   docker build -f server/Dockerfile -t table-order-server .
# Render: Root Directory = 리포 루트, Dockerfile Path = server/Dockerfile

# ===== 1단계: 빌드 =====
FROM node:20-alpine AS builder
WORKDIR /app/server

# 의존성 설치 (빌드 + 마이그레이션 도구 ts-node/typescript 포함)
COPY server/package.json ./
RUN npm install

# 소스 복사 후 TypeScript 컴파일 (dist 생성)
COPY server/ ./
RUN npm run build

# ===== 2단계: 실행 =====
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
# ts-node 마이그레이션 시 타입체크 비용/외부 파일 이슈 방지
ENV TS_NODE_TRANSPILE_ONLY=true
WORKDIR /app/server

# 비루트 유저 생성
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# 빌드 산출물 및 실행에 필요한 파일 복사
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist
COPY server/package.json ./
COPY server/knexfile.ts ./
COPY server/tsconfig.json ./

# 마이그레이션/시드 파일 (cwd=/app/server 기준 ../database 로 해석됨)
COPY database/ /app/database/

# 컨테이너 시작 스크립트
COPY server/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && chown -R nodejs:nodejs /app

USER nodejs

# PORT 는 런타임에 process.env.PORT 로 주입됨 (Render 가 동적 할당).
# EXPOSE 는 문서화 목적이며 기본 로컬 포트를 표기.
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
