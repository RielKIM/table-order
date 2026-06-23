#!/bin/sh
# 컨테이너 시작 스크립트
# 1) DB 마이그레이션 적용 (항상)
# 2) 시드 실행 (RUN_SEED=true 일 때만 — 시드는 기존 데이터를 삭제하므로 기본 비활성)
# 3) 컴파일된 서버(dist) 실행
set -e

echo "[entrypoint] 데이터베이스 마이그레이션 실행..."
npm run migrate:latest:prod

if [ "$RUN_SEED" = "true" ]; then
  echo "[entrypoint] 시드 데이터 적용 (RUN_SEED=true)..."
  npm run seed:run:prod
else
  echo "[entrypoint] 시드 건너뜀 (RUN_SEED 미설정). 최초 1회만 RUN_SEED=true 로 실행하세요."
fi

echo "[entrypoint] 서버 시작 (port=${PORT:-3000})..."
exec node dist/app.js
