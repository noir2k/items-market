# items-market

게임 아이템 / 게임머니 / 계정 거래 마켓 (Next.js 16 App Router + Supabase).

## 빠른 시작

```powershell
# 1) 로컬 Supabase 기동
supabase start

# 2) `.env.local` 생성 후 supabase status -o env 결과를 채워 넣음
Copy-Item .env.local.example .env.local
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 3) 시드 데이터 부트스트랩 (.env.local 자동 로드)
npm run supabase:bootstrap

# 4) 개발 서버 (Turbopack)
npm run dev
```

브라우저로 <http://localhost:3000> 접속.

## 주요 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Next.js dev (Turbopack) |
| `npm run build` | production 빌드 |
| `npm start` | production 서버 |
| `npm test` | Vitest 단위 테스트 (43 tests) |
| `npm run supabase:bootstrap` | 로컬 supabase에 데모 회원/게시글 시드 |
| `npm run supabase:reset` | `market_posts` / `market_comments` 비우기 |
| `npm run staging:check` | env + DB 헬스체크 (`/api/health`와 동일 로직) |

## 데모 계정 (로컬 전용)

> production 빌드에서는 `NODE_ENV` 가드로 안내 블록이 숨겨집니다.

| 이메일 | 비밀번호 | 권한 |
| --- | --- | --- |
| `admin@itemmarket.local` | `admin1234!` | admin |
| `seller1@itemmarket.local` | `seller1234!` | member |
| `buyer1@itemmarket.local` | `buyer1234!` | member |

## 디렉토리

```
app/        # Next.js App Router (페이지, 라우트, server actions)
components/ # React 컴포넌트 (서버/클라이언트 혼재)
lib/        # 도메인 로직, Supabase wrapper, server helpers
supabase/   # 마이그레이션, seed.sql, supabase config
scripts/    # bootstrap / staging-check / reset 운영 스크립트
tests/      # Vitest 단위 테스트
docs/       # plan / 체크리스트 / runbook
```

## 핵심 기능

- **회원/관리자 인증** — Supabase Auth + RLS 기반 (공개 닉네임 + 보호된 PII)
- **거래소(`/market`)** — 게임/카테고리/상태/검색어/서버 5축 필터
- **개별 게임 보드(`/market/game/[slug]`)** — slug 기반 라우트 + 동일 필터 재사용
- **상세/등록/수정** — 글쓴이·관리자 권한 분리, 거래완료/삭제 확인 흐름
- **댓글** — `inquiry`/`offer`/`system` 타입, 로그인 회원만 작성
- **관리자 대시보드** — 회원 정지/해제, 게시글 일괄 관리, 회원별 월단위 CSV export(UTF-8 BOM)
- **헬스체크 API(`/api/health`)** — env + DB 검사

## 보안 / RLS 정책 요약

- `profiles` — 누구나 SELECT 가능(닉네임/role/id 컬럼만), 본인 또는 admin만 UPDATE
- `market_posts` / `market_comments` — 모두 SELECT 가능, active 회원만 INSERT, 글쓴이·관리자만 UPDATE/DELETE
- `is_admin()` security-definer 함수로 RLS와 server action에서 일관된 권한 판정
- middleware (`proxy.ts`) matcher는 보호 라우트(`/admin`, `/mypage`, `/sell`, `/buy`, `/market/[id]/edit`)만 매치하여 공개 페이지 latency 최소화

## 배포

`docs/release-checklist.md` 참조 — 사전 검증, 환경 변수, 마이그레이션 순서, 회귀 시나리오 명시.

## 개발 메모

- TypeScript `strict: true` 활성, `tsc --noEmit` 통과 필수
- Next.js / React 버전은 `^16.2.4` / `^19.0.0`로 핀
- typedRoutes는 의도적으로 OFF (`next.config.ts` 주석 참조)
- `proxy.ts`가 Next.js 16의 신규 미들웨어 명칭 (구 `middleware.ts` 대체)
