# Server API 배포 가이드

Express + TypeScript + Knex + PostgreSQL 서버의 프로덕션 배포 안내입니다.

## 1. 환경변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `JWT_SECRET` | ✅ | JWT 서명 키 |
| `DATABASE_URL` | ✅(또는 DB_* 조합) | `postgres://user:pass@host:5432/db`. 있으면 우선 사용, SSL 자동 활성화 |
| `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` | △ | `DATABASE_URL` 미사용 시 필요 |
| `PORT` | ✖ | 미설정 시 3000. Render 등은 런타임에 주입 |
| `ALLOWED_ORIGINS` | ✖ | CORS 허용 origin (쉼표 구분) |
| `RUN_SEED` | ✖ | `true` 일 때만 컨테이너 시작 시 시드 실행 (시드는 기존 데이터 삭제) |

`validateEnv()` 가 기동 시 `JWT_SECRET` 과 DB 설정 누락을 검증하여 fail-closed 로 중단합니다.

## 2. Docker 빌드 (빌드 컨텍스트 = 리포 루트)

`knexfile.ts` 가 마이그레이션/시드를 `../database` 로 참조하므로 빌드 컨텍스트는 **리포 루트**여야 합니다.

```bash
# 리포 루트에서 실행
docker build -f server/Dockerfile -t table-order-server .
docker run -p 3000:3000 \
  -e JWT_SECRET=change-me \
  -e DATABASE_URL=postgres://user:pass@host:5432/table_order \
  -e ALLOWED_ORIGINS=https://your-frontend \
  table-order-server
```

컨테이너 시작 흐름 (`docker-entrypoint.sh`):
1. `npm run migrate:latest:prod` — 마이그레이션 적용 (항상)
2. `RUN_SEED=true` 인 경우에만 `npm run seed:run:prod` — 시드 적용
3. `node dist/app.js` — 서버 실행

> 시드는 기존 데이터를 삭제하므로 **최초 1회**만 `RUN_SEED=true` 로 실행하세요.

## 3. Render 배포

- **Root Directory**: 리포 루트
- **Dockerfile Path**: `server/Dockerfile`
- **Environment**: `JWT_SECRET`, `DATABASE_URL`(Render PostgreSQL Internal URL), `ALLOWED_ORIGINS` 설정
- `PORT` 는 Render 가 주입 → 코드가 `process.env.PORT` 사용
- Render PostgreSQL 은 SSL 필요 → `DATABASE_URL` 사용 시 `ssl: { rejectUnauthorized: false }` 자동 적용

## 4. 수동 마이그레이션/시드 (로컬·CI)

```bash
npm run build              # tsc → dist
npm run migrate:latest     # 개발 DB 마이그레이션
npm run seed:run           # 개발 DB 시드
npm run migrate:latest:prod  # NODE_ENV=production 환경
npm run seed:run:prod
npm start                  # node dist/app.js
```
