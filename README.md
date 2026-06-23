# 테이블오더 (Table Order)

매장 테이블에서 고객이 직접 주문하고, 관리자가 실시간으로 주문을 관리하는
테이블오더 플랫폼입니다. 단일 SPA(Customer + Admin)와 REST/SSE API 서버로 구성된
npm workspaces 모노레포입니다.

## 기술 스택

| 영역 | 스택 |
|---|---|
| Server | Node.js, Express, TypeScript, Knex, PostgreSQL, JWT, SSE |
| Client | React, TypeScript, Vite, React Router, Zustand, Tailwind CSS |
| Infra | npm workspaces, Docker Compose(로컬 DB), Render(배포) |

## 디렉토리 구조

```
table-order/
├── render.yaml          # Render 배포 Blueprint (DB + Server + Client)
├── DEPLOYMENT.md        # Render 배포 가이드
├── docker-compose.yml   # 로컬 PostgreSQL
├── package.json         # 루트 워크스페이스 (client, server)
├── server/              # Express + TypeScript API (SSE 포함)
│   ├── src/             # app.ts, features/, config/, middleware/ ...
│   └── knexfile.ts      # 마이그레이션/시드 설정
├── client/              # React + Vite SPA (Customer / Admin)
│   └── src/apps/        # admin/, customer/, shared/
└── aidlc-docs/          # 설계 문서 (요구사항, 유저스토리, 설계)
```

## 로컬 개발

### 1. 사전 요구사항
- Node.js >= 20
- Docker (로컬 PostgreSQL용)

### 2. 의존성 설치 (루트에서 1회)
```bash
npm install
```

### 3. 데이터베이스 기동 (Docker Compose)
```bash
docker compose up -d        # PostgreSQL (localhost:5432, db: table_order)
```

### 4. 환경변수 설정
```bash
cp server/.env.example server/.env   # 필요 시 값 수정
```

### 5. 마이그레이션 / 시드
```bash
npm run migrate:latest --workspace=server
npm run seed:run --workspace=server
```

### 6. 개발 서버 실행
```bash
npm run dev:server   # API  (기본 http://localhost:3000)
npm run dev:client   # SPA  (Vite, 기본 http://localhost:5173)
```
- Customer 화면: `/`
- Admin 화면: `/admin`

## 빌드

```bash
npm run build:server   # tsc → server/dist
npm run build:client   # tsc + vite build → client/dist
```

## 배포 (Render)

루트의 `render.yaml` Blueprint 하나로 PostgreSQL + Server(Web Service) +
Client(Static Site)를 한 번에 배포합니다.

- SSE(실시간 주문 상태)를 사용하므로 server는 serverless가 아닌 **상시 실행
  Web Service**로 배포합니다.
- 단계별 절차, 환경변수, 마이그레이션 확인 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md) 참고.
