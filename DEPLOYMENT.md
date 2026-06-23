# 배포 가이드 (Render)

테이블오더 모노레포를 [Render](https://render.com)에 배포하는 방법을 설명합니다.
루트의 `render.yaml` Blueprint 한 개로 다음 3개 리소스를 한 번에 생성합니다.

| 리소스 | 타입 | 이름 | 설명 |
|---|---|---|---|
| PostgreSQL | `database` (free) | `table-order-db` | 공유 데이터베이스 |
| Server API | Web Service (`node`, 상시 실행) | `table-order-server` | Express + SSE, `/api/*` |
| Client SPA | Static Site (`static`) | `table-order-client` | React + Vite, Customer `/` · Admin `/admin` |

```
[브라우저] ──HTTPS──> table-order-client (Static Site, SPA)
     │                       │  VITE_API_URL (빌드 타임 주입)
     └──────HTTPS/SSE────────┴──> table-order-server (Web Service)
                                        │  DATABASE_URL (fromDatabase)
                                        └──> table-order-db (PostgreSQL)
```

---

## 1. 사전 준비

1. **GitHub 저장소 연결 (필수)**
   - Render Blueprint는 Git 저장소를 기준으로 동작합니다. 이 모노레포를 GitHub
     저장소로 push 하고, Render 워크스페이스에 GitHub 계정을 연결해야 합니다.
   - `render.yaml`은 저장소 **루트**에 위치해야 합니다. (현재 위치 정확)
   - Blueprint를 별도 `repo`로 지정하지 않으면 Render는 Blueprint가 들어 있는
     저장소를 그대로 사용합니다.

2. **Render 계정 / 워크스페이스** 준비.

3. **서버 측 사전 요구사항 (DATABASE_URL 지원 · 예정)**
   - Render PostgreSQL의 호스트/포트는 `fromDatabase`로 개별 주입할 수 없고
     `connectionString`(= `DATABASE_URL`)으로만 제공됩니다.
   - 따라서 `server/src/config/database.ts`와 `server/knexfile.ts`가
     `DATABASE_URL`을 파싱해 연결하도록 지원되어야 실제 DB 연결이 동작합니다.
     (현재는 `DB_HOST/DB_PORT/...` 개별 변수를 사용 — DATABASE_URL 지원은 예정 항목)
   - `env.ts`는 이미 `DATABASE_URL`을 인식하므로 서버 기동(검증)은 통과합니다.

---

## 2. Blueprint으로 배포 (권장)

1. Render Dashboard에서 **New + → Blueprint** 선택.
2. 이 모노레포가 있는 GitHub 저장소를 선택합니다.
3. Render가 루트의 `render.yaml`을 자동으로 감지하고 생성될 리소스 목록
   (`table-order-db`, `table-order-server`, `table-order-client`)을 보여줍니다.
4. **Apply**를 누르면 다음이 자동으로 수행됩니다.
   - PostgreSQL 인스턴스 생성
   - `JWT_SECRET` 자동 생성(`generateValue`)
   - `DATABASE_URL`을 DB의 `connectionString`으로 연결(`fromDatabase`)
   - Server 빌드 → `preDeployCommand`로 마이그레이션 + 시드 실행 → 기동
   - Client 빌드 → `client/dist` 정적 서빙
5. 배포가 끝나면 각 서비스의 공개 URL이 발급됩니다.
   - Server: `https://table-order-server.onrender.com`
   - Client: `https://table-order-client.onrender.com`

> **서비스명 중복 주의**: 워크스페이스에 동일 이름이 이미 있으면 Render가 URL에
> 접미사를 붙입니다. 이 경우 `render.yaml`의 `VITE_API_URL`(client)과
> `ALLOWED_ORIGINS`(server) 값을 실제 발급된 URL로 갱신한 뒤 다시 Apply 하세요.

### 자동 환경변수 연결 정리

| 변수 | 대상 | 연결 방식 |
|---|---|---|
| `DATABASE_URL` | server | `fromDatabase` (connectionString) — 자동 |
| `DB_USER/DB_PASSWORD/DB_NAME` | server | `fromDatabase` — 자동 |
| `JWT_SECRET` | server | `generateValue` — 자동 생성 |
| `VITE_API_URL` | client | server 공개 URL (예측값, 필요 시 수동 갱신) |
| `ALLOWED_ORIGINS` | server | client 공개 URL (예측값, 필요 시 수동 갱신) |

> `VITE_API_URL`/`ALLOWED_ORIGINS`는 **브라우저가 접근하는 공개 https URL**이
> 필요합니다. `fromService`가 제공하는 `host/port`는 Render **비공개 네트워크**
> 전용이라 브라우저 출처로 쓸 수 없어, 예측 가능한 `onrender.com` URL을 직접 지정합니다.

---

## 3. Render API로 배포 (대안)

Dashboard 대신 Render API로 Blueprint를 동기화할 수 있습니다. `REPO_URL`은
GitHub 저장소 URL, `RENDER_API_KEY`는 Account Settings에서 발급한 키입니다.

```bash
export RENDER_API_KEY="rnd_xxxxxxxxxxxxxxxxxxxx"
export REPO_URL="https://github.com/<org>/<repo>"

# 1) (최초 1회) 저장소를 Blueprint로 등록 - owner 확인
curl -s https://api.render.com/v1/owners \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Accept: application/json"

# 2) render.yaml 기반 Blueprint 생성 (owner_id, repo는 위 값으로 치환)
curl -s -X POST https://api.render.com/v1/blueprints \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
        "ownerId": "<owner-id>",
        "name": "table-order",
        "repo": "'"${REPO_URL}"'",
        "branch": "main"
      }'

# 3) Blueprint 동기화(배포 트리거)
curl -s -X POST https://api.render.com/v1/blueprints/<blueprint-id>/syncs \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json"
```

> API 스키마는 버전에 따라 달라질 수 있으니 <https://api-docs.render.com/> 를
> 함께 참고하세요. 가장 단순하고 안정적인 방법은 2번 절(Dashboard Blueprint)입니다.
> 이후 `git push`만 하면 `autoDeployTrigger: commit` 설정에 따라 자동 재배포됩니다.

---

## 4. 환경변수 목록

### Server (`table-order-server`)

| 변수 | 의미 | 출처 |
|---|---|---|
| `NODE_ENV` | 실행 환경 (`production`) | 고정값 |
| `PORT` | 서버 리슨 포트 | Render가 자동 주입 (앱은 `process.env.PORT` 사용) |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `fromDatabase` (connectionString) |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | 개별 DB 접속 정보 | `fromDatabase` |
| `JWT_SECRET` | JWT 서명 시크릿 | `generateValue` (자동 생성) |
| `JWT_ADMIN_EXPIRES_IN` | 관리자 토큰 만료 (`16h`) | 고정값 |
| `ALLOWED_ORIGINS` | CORS 허용 출처 (client URL) | 고정값(예측 URL) |

### Client (`table-order-client`)

| 변수 | 의미 | 출처 |
|---|---|---|
| `VITE_API_URL` | 백엔드 API 공개 주소 (빌드 타임 주입) | 고정값(예측 URL) |

> `VITE_*` 변수는 Vite 빌드 시점에 번들에 포함됩니다. 값이 바뀌면 client를
> **재빌드(재배포)** 해야 반영됩니다.

---

## 5. 배포 후 마이그레이션 / 시드 확인

마이그레이션과 시드는 server의 `preDeployCommand`에서 매 배포 직전에 실행됩니다.

```yaml
preDeployCommand: NODE_ENV=development npm run migrate:latest --workspace=server \
                  && NODE_ENV=development npm run seed:run --workspace=server
```

- `knexfile.ts`에는 `development`/`test` 환경 설정만 있으므로, 마이그레이션 CLI가
  올바른 설정을 찾도록 `NODE_ENV=development`로 override 합니다. (서비스 런타임은
  `NODE_ENV=production`으로 동작)

확인 방법:

1. **배포 로그**: server 서비스의 **Logs / Events** 탭에서 `preDeploy` 단계 로그를
   확인합니다. `Batch ... run: N migrations` / `Ran N seed files` 메시지가 보이면 성공.
2. **헬스체크**: `curl https://table-order-server.onrender.com/api/health` →
   `{"success":true,"data":{"status":"ok"}}` 응답 확인.
3. **DB 직접 확인**: DB 서비스의 **Connect** 정보로 `psql` 접속 후 `\dt`로 테이블 존재 확인.
4. 재실행이 필요하면 server 서비스 **Shell**에서 위 명령을 수동 실행할 수 있습니다.

---

## 6. SSE가 Render Web Service에서 동작하는 이유

테이블오더는 주문 상태 실시간 반영을 위해 **SSE(Server-Sent Events)**를 사용합니다
(`/api/events`). SSE는 서버가 응답 스트림을 **장시간 열어 둔 채** 이벤트를 계속
push 하는 방식입니다. 이 때문에 배포 형태 선택이 중요합니다.

- **Web Service (상시 실행) — 채택**
  - Render Web Service는 프로세스가 **항상 떠 있는** 장수명(long-lived) 서버입니다.
  - HTTP 연결을 오래 유지할 수 있어 SSE 스트림이 끊기지 않고 유지됩니다.
  - 한 프로세스가 여러 클라이언트의 SSE 연결과 인메모리 구독 상태를 그대로 보유합니다.

- **Serverless / FaaS — 부적합**
  - 함수는 요청-응답 후 곧 종료되고 실행 시간 제한이 있어, 연결을 계속 열어 두는
    SSE에 맞지 않습니다. 인메모리 구독 상태도 호출 간 유지되지 않습니다.

따라서 server는 `type: web`, `runtime: node`(상시 실행 Web Service)로 배포합니다.

### free plan 운영 시 주의

- Render **free** Web Service는 일정 시간 트래픽이 없으면 **휴면(sleep)**에 들어가고,
  다음 요청 때 콜드 스타트가 발생합니다. 휴면 시 열려 있던 SSE 연결은 끊깁니다.
  (클라이언트의 `EventSource`는 자동 재연결을 시도합니다.)
- free PostgreSQL은 생성 후 일정 기간(약 30일) 뒤 만료됩니다.
- 운영/데모 안정성이 필요하면 server를 `starter` 이상 유료 plan으로 올리는 것을 권장합니다
  (`render.yaml`의 `plan: free` → `plan: starter`).
