# Release Checklist — items-market

배포 직전에 한 번씩 훑어보는 체크리스트입니다.

## 1. 사전 검증

- [ ] `npm test` — 43개 테스트 모두 통과
- [ ] `npm run build` — production 빌드 에러 없음
- [ ] `npx tsc --noEmit` — strict 타입 에러 0건
- [ ] `npm run staging:check --env-file=.env.production` — `ok: true`

## 2. 환경 변수

배포 호스트(예: Vercel, Fly, AWS)에서 다음 키를 모두 설정.

| 키 | 용도 | 비고 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트/서버 supabase URL | 공개 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon JWT | 공개 |
| `NEXT_PUBLIC_SITE_URL` | 메일/링크 등에 쓰이는 사이트 root | 공개 |
| `SUPABASE_SERVICE_ROLE_KEY` | bootstrap/관리 스크립트 전용 | **서버 전용**, 절대 클라이언트 노출 금지 |

## 3. DB 마이그레이션

```powershell
supabase link --project-ref <staging-or-prod-ref>
supabase db push
```

적용 순서:
1. `20260427092912_init_market_schema.sql` — 초기 스키마 + RLS
2. `20260504000000_public_profile_read.sql` — anon 닉네임 읽기
3. `20260504000001_market_post_view_increment.sql` — 조회수 RPC

`supabase db push` 후 `supabase migration list`로 모두 `Applied`인지 확인.

## 4. 회귀 시나리오 (production URL 기준)

### 4.1 비로그인
- [ ] `/` 통계 카드 — 1,248 같은 하드코딩 흔적 없음
- [ ] `/market` 작성자 컬럼 — 닉네임 노출, "회원" 폴백 없음
- [ ] `/admin` → `/admin/login` 자동 리다이렉트
- [ ] `/sell` → `/login?next=%2Fsell` 자동 리다이렉트

### 4.2 일반회원 (seller1 등)
- [ ] 로그인 후 `/market` → `/sell` → 새 글 등록 → 상세 진입
- [ ] 상세 페이지에서 댓글 등록
- [ ] 자기 글에서 거래완료 처리 → 상태 라벨 "거래완료"
- [ ] `/mypage` 권한 "일반회원" / 상태 "활성" 한글 표시
- [ ] HeroSearchCard 키워드 → `/market?q=<keyword>&tradeType=sell` 이동, 결과 필터링

### 4.3 관리자 (admin)
- [ ] `/admin` 접근, 회원/게시글/통계 카드 노출
- [ ] 본인 행에 "본인 계정" 라벨, 정지 버튼 미노출
- [ ] 다른 회원 정지 → 해제 토글 동작
- [ ] 회원 선택 → CSV Export 다운로드(Content-Type `text/csv; charset=utf-8`, BOM 포함)
- [ ] 게시글 거래완료/삭제 처리 정상

### 4.4 헬스
- [ ] `/api/health` → `{ ok: true, checks: { env: true, database: true } }`
- [ ] `/api/health` 응답시간 < 500ms (staging 기준)

## 5. 모니터링 / 운영

- [ ] Supabase 대시보드: postgres slow query / RLS deny 모니터
- [ ] `NEXT_TELEMETRY_DISABLED=1` 또는 명시적 opt-in 결정
- [ ] 배포 후 1시간 동안 5xx / 4xx 로그 추이 확인
- [ ] 백업 정책: Supabase point-in-time recovery 활성화 여부

## 6. 출시 후 24시간

- [ ] Supabase Auth 가입 추이 / 비정상 증가 모니터
- [ ] `/api/health` 외부 모니터(예: UptimeRobot) 연결
- [ ] 운영자 슬랙/이메일에 데모 계정 안내가 production로 새지 않았는지 확인 — production 빌드는 `process.env.NODE_ENV === "development"` 가드로 자동 숨김 처리됨
