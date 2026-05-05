const LOCAL_SUPABASE_URL = "http://127.0.0.1:54321";

export function getLocalSupabaseConfig(env: Record<string, string | undefined> = process.env) {
  const supabaseUrl =
    env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || env.SUPABASE_URL_LOCAL || LOCAL_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "";
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE;

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Run `supabase status -o env` after the local stack starts and copy the key."
    );
  }

  return {
    anonKey,
    serviceRoleKey,
    supabaseUrl
  };
}

export function buildDemoMarketSeed() {
  return {
    users: [
      // ── 운영자 ──
      { email: "admin@itemmarket.local", nickname: "market_admin", password: "admin1234!", role: "admin" },

      // ── 1차 시드(2026-04~05): 일반 트레이더 ──
      { email: "seller1@itemmarket.local", nickname: "meso_master", password: "seller1234!", role: "member" },
      { email: "buyer1@itemmarket.local", nickname: "raid_buyer", password: "buyer1234!", role: "member" },
      { email: "trader1@itemmarket.local", nickname: "lineage_king", password: "trader1234!", role: "member" },
      { email: "trader2@itemmarket.local", nickname: "fc_pro", password: "trader1234!", role: "member" },
      { email: "trader3@itemmarket.local", nickname: "abyss_runner", password: "trader1234!", role: "member" },
      { email: "trader4@itemmarket.local", nickname: "genshin_collector", password: "trader1234!", role: "member" },
      { email: "trader5@itemmarket.local", nickname: "valor_ace", password: "trader1234!", role: "member" },

      // ── 2차 시드(2026-05-05): 카탈로그 28개 확장에 맞춰 장르별 active 트레이더 추가 ──
      { email: "kim.junho@itemmarket.local", nickname: "메소사냥꾼", password: "member1234!", role: "member" },
      { email: "lee.seoyeon@itemmarket.local", nickname: "리니지여신", password: "member1234!", role: "member" },
      { email: "park.donghyun@itemmarket.local", nickname: "로아골드킹", password: "member1234!", role: "member" },
      { email: "choi.minseo@itemmarket.local", nickname: "원석러버", password: "member1234!", role: "member" },
      { email: "jung.taehyung@itemmarket.local", nickname: "디아베테랑", password: "member1234!", role: "member" },
      { email: "han.yujin@itemmarket.local", nickname: "발로에이스", password: "member1234!", role: "member" },
      { email: "kang.seungwoo@itemmarket.local", nickname: "다이아갱", password: "member1234!", role: "member" },
      { email: "oh.jihoon@itemmarket.local", nickname: "검사막군주", password: "member1234!", role: "member" },
      { email: "yoon.haeun@itemmarket.local", nickname: "붕스타매니저", password: "member1234!", role: "member" },
      { email: "bae.minkyung@itemmarket.local", nickname: "오버그마", password: "member1234!", role: "member" }
    ],
    posts: [
      // ════════════════════════════════════════════════════════════════
      // PC MMORPG
      // ════════════════════════════════════════════════════════════════

      // ── 메이플스토리 ──
      {
        authorEmail: "seller1@itemmarket.local",
        category: "game_money",
        content:
          "스카니아 메소 120억 보유 중. 분할 거래 가능하고, 거래 시간은 평일 21시~24시 / 주말 풀타임. 안전거래로 5분 내 전달.",
        gameSlug: "maplestory",
        price: 298000,
        priceLabel: "298,000원",
        quantityDescription: "120억 메소",
        seedKey: "post-maple-sell-01",
        serverName: "스카니아",
        status: "open",
        title: "스카니아 메소 120억 분할 판매 (시세 최저)",
        tradeType: "sell",
        viewCount: 184
      },
      {
        authorEmail: "seller1@itemmarket.local",
        category: "item",
        content:
          "수르 220제 본주문서 12장 일괄 판매. 옵션은 무옵 미사용. 사진 첨부드릴 수 있고 즉시 거래 가능.",
        gameSlug: "maplestory",
        price: 180000,
        priceLabel: "180,000원",
        quantityDescription: "수르 220제 본주문서 12장",
        seedKey: "post-maple-sell-02",
        serverName: "엘리시움",
        status: "open",
        title: "엘리시움 수르 220제 본주문서 12장",
        tradeType: "sell",
        viewCount: 73
      },
      {
        authorEmail: "buyer1@itemmarket.local",
        category: "account",
        content:
          "278레벨 이상 / 무릉 30층 / 보스 위클리 가능 캐릭터 보유 계정 삽니다. 시세 협의.",
        gameSlug: "maplestory",
        price: null,
        priceLabel: "협의",
        quantityDescription: "278레벨 이상 부캐 포함 계정",
        seedKey: "post-maple-buy-01",
        serverName: "리부트",
        status: "open",
        title: "리부트 278+ 풀패스 계정 삽니다",
        tradeType: "buy",
        viewCount: 51
      },
      {
        authorEmail: "kim.junho@itemmarket.local",
        category: "game_money",
        content:
          "크로아 메소 50억 + 17성 무기 풀강 매물입니다. 거래소 시세 1억당 240원에 분할 거래 가능합니다.",
        gameSlug: "maplestory",
        price: 120000,
        priceLabel: "120,000원",
        quantityDescription: "50억 메소 + 17성 무기",
        seedKey: "post-maple-sell-03",
        serverName: "크로아",
        status: "open",
        title: "크로아 메소 50억 + 17성 무기 일괄",
        tradeType: "sell",
        viewCount: 96
      },

      // ── 로스트아크 ──
      {
        authorEmail: "buyer1@itemmarket.local",
        category: "item",
        content:
          "전설 카드 선택팩 1세트 매입합니다. 옵션 스크린샷 확인 후 바로 거래 희망. 안전거래만 진행.",
        gameSlug: "lostark",
        price: null,
        priceLabel: "협의",
        quantityDescription: "전설 카드 선택팩 1세트",
        seedKey: "post-lostark-buy-01",
        serverName: "카단",
        status: "open",
        title: "로스트아크 전설 카드 선택팩 삽니다",
        tradeType: "buy",
        viewCount: 96
      },
      {
        authorEmail: "trader3@itemmarket.local",
        category: "game_money",
        content:
          "로스트아크 골드 200,000 판매합니다. 카단 서버 / 시세 1G = 0.85원. 우편 거래 가능.",
        gameSlug: "lostark",
        price: 170000,
        priceLabel: "170,000원",
        quantityDescription: "200,000 골드",
        seedKey: "post-lostark-sell-01",
        serverName: "카단",
        status: "open",
        title: "카단 골드 20만 (시세 0.85원)",
        tradeType: "sell",
        viewCount: 142
      },
      {
        authorEmail: "trader3@itemmarket.local",
        category: "account",
        content:
          "1640+ 군단장 클리어 가능 계정 양도. 카직스/노블레스/낙랑 토벌대 모두 진행 가능. 보석 9-10레벨 풀세팅.",
        gameSlug: "lostark",
        price: 850000,
        priceLabel: "850,000원",
        quantityDescription: "1640+ 군단장 풀세팅 계정",
        seedKey: "post-lostark-sell-02",
        serverName: "실리안",
        status: "open",
        title: "실리안 1640+ 군단장 풀세팅 계정",
        tradeType: "sell",
        viewCount: 287
      },
      {
        authorEmail: "park.donghyun@itemmarket.local",
        category: "account",
        content:
          "카제로스 1620 영웅장비 풀세팅 / 5+5 각인 / 보석 9레벨 균등. 카드덱 페일과 비스타 6각.",
        gameSlug: "lostark",
        price: 480000,
        priceLabel: "480,000원",
        quantityDescription: "1620 영웅장비 풀세팅",
        seedKey: "post-lostark-sell-03",
        serverName: "카제로스",
        status: "open",
        title: "카제로스 1620 영웅장비 풀세팅",
        tradeType: "sell",
        viewCount: 168
      },

      // ── 던전앤파이터 ──
      {
        authorEmail: "trader3@itemmarket.local",
        category: "game_money",
        content:
          "던파 에델 골드 1억 판매합니다. 시세 1억 = 12,000원. 거래소 통한 안전거래.",
        gameSlug: "dnf",
        price: 12000,
        priceLabel: "12,000원",
        quantityDescription: "1억 골드",
        seedKey: "post-dnf-sell-01",
        serverName: "에델",
        status: "open",
        title: "에델 골드 1억 (시세 12,000원)",
        tradeType: "sell",
        viewCount: 88
      },
      {
        authorEmail: "kim.junho@itemmarket.local",
        category: "item",
        content:
          "시로코 풍신 110제 +12 무기 / 가공 옵션 좋음. 사진 첨부 가능, 즉시 거래.",
        gameSlug: "dnf",
        price: 280000,
        priceLabel: "280,000원",
        quantityDescription: "풍신 110제 +12 무기",
        seedKey: "post-dnf-sell-02",
        serverName: "시로코",
        status: "open",
        title: "시로코 풍신 110제 +12 무기 (가공 옵션 우수)",
        tradeType: "sell",
        viewCount: 134
      },

      // ── 아이온 ──
      {
        authorEmail: "trader3@itemmarket.local",
        category: "game_money",
        content:
          "아이온 클래식 키나 5천만 판매. 시세 1천만 = 4,500원. 거래장 통한 안전거래.",
        gameSlug: "aion",
        price: 22500,
        priceLabel: "22,500원",
        quantityDescription: "5천만 키나",
        seedKey: "post-aion-sell-01",
        serverName: "이리누스",
        status: "open",
        title: "이리누스 키나 5천만 (클래식)",
        tradeType: "sell",
        viewCount: 47
      },
      {
        authorEmail: "trader3@itemmarket.local",
        category: "account",
        content:
          "아이온 한국서버 65렙 신앙 100 / 신상 60 매물입니다. 본캐 + 부캐 1종 포함.",
        gameSlug: "aion",
        price: 180000,
        priceLabel: "180,000원",
        quantityDescription: "65렙 본캐 + 부캐",
        seedKey: "post-aion-sell-02",
        serverName: "한국",
        status: "open",
        title: "아이온 65렙 신앙100 본캐 + 부캐 양도",
        tradeType: "sell",
        viewCount: 62
      },

      // ── 검은사막 ──
      {
        authorEmail: "trader3@itemmarket.local",
        category: "game_money",
        content:
          "검은사막 PC 실버 5억 판매. 거래소 통한 등록 / 안전거래만. 시세 1억당 8,500원.",
        gameSlug: "bdo",
        price: 42000,
        priceLabel: "42,000원",
        quantityDescription: "실버 5억",
        seedKey: "post-bdo-sell-01",
        serverName: "글로벌",
        status: "open",
        title: "검은사막 실버 5억 (시세 8,500원/1억)",
        tradeType: "sell",
        viewCount: 56
      },
      {
        authorEmail: "oh.jihoon@itemmarket.local",
        category: "item",
        content:
          "검은사막 한국서버 PV 2700+ / 카란다 + 슈쿠레 헬멧 + 기카논 풀세팅. 가족장비 다수.",
        gameSlug: "bdo",
        price: 720000,
        priceLabel: "720,000원",
        quantityDescription: "PV 2700+ 풀세팅 계정",
        seedKey: "post-bdo-sell-02",
        serverName: "한국",
        status: "open",
        title: "검은사막 PV 2700+ 카란다/슈쿠레 풀세팅",
        tradeType: "sell",
        viewCount: 213
      },
      {
        authorEmail: "oh.jihoon@itemmarket.local",
        category: "etc",
        content:
          "검은사막 사냥 대리 진행합니다. 60렙 → 63렙 8시간 / 1주 단위. 안전 스폿 위주.",
        gameSlug: "bdo",
        price: 60000,
        priceLabel: "60,000원/주",
        quantityDescription: "사냥 대리 (1주)",
        seedKey: "post-bdo-sell-03",
        serverName: "한국",
        status: "open",
        title: "검은사막 사냥 대리 (60→63 / 1주)",
        tradeType: "sell",
        viewCount: 38
      },

      // ── 월드 오브 워크래프트 ──
      {
        authorEmail: "oh.jihoon@itemmarket.local",
        category: "game_money",
        content:
          "와우 클래식 골드 100K 판매. 호드 / 얼라이언스 모두 가능. 시세 1K = 1,200원.",
        gameSlug: "wow",
        price: 120000,
        priceLabel: "120,000원",
        quantityDescription: "100K 골드",
        seedKey: "post-wow-sell-01",
        serverName: "Classic-호라이즌",
        status: "open",
        title: "와우 클래식 골드 100K (시세 1,200원/1K)",
        tradeType: "sell",
        viewCount: 89
      },
      {
        authorEmail: "oh.jihoon@itemmarket.local",
        category: "account",
        content:
          "와우 리치왕 시즌 풀세팅 / 80렙 흑마 + 부캐 4종. 영웅 던전 모두 클리어 가능.",
        gameSlug: "wow",
        price: 380000,
        priceLabel: "380,000원",
        quantityDescription: "80렙 본캐 + 부캐 4종",
        seedKey: "post-wow-sell-02",
        serverName: "Classic-호라이즌",
        status: "open",
        title: "와우 리치왕 80렙 흑마 풀세팅 계정",
        tradeType: "sell",
        viewCount: 124
      },

      // ── 리니지1 (PC 원작) ──
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        category: "game_money",
        content:
          "리니지1 켄트서버 아데나 1억 판매. 길드 거래만 가능 / 안전거래 시 5분 내 전달.",
        gameSlug: "lineage1",
        price: 280000,
        priceLabel: "280,000원",
        quantityDescription: "아데나 1억",
        seedKey: "post-lineage1-sell-01",
        serverName: "켄트",
        status: "open",
        title: "리니지1 켄트 아데나 1억 (길드 거래)",
        tradeType: "sell",
        viewCount: 142
      },
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        category: "item",
        content:
          "리니지1 진명 데포로쥬 양도합니다. +9 강화 / 영주 진명 적용 / 잔여 일수 90일.",
        gameSlug: "lineage1",
        price: 1850000,
        priceLabel: "1,850,000원",
        quantityDescription: "진명 데포로쥬 +9",
        seedKey: "post-lineage1-sell-02",
        serverName: "기란",
        status: "open",
        title: "리니지1 진명 데포로쥬 +9 (90일)",
        tradeType: "sell",
        viewCount: 287
      },

      // ── 리니지 클래식 ──
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        category: "account",
        content:
          "리니지 클래식 영주 75렙 본캐 + 진명 데포 보유 계정 양도. 활성 길드 소속 / 시즌 보상 풀.",
        gameSlug: "lineage-classic",
        price: 1200000,
        priceLabel: "1,200,000원",
        quantityDescription: "75렙 본캐 + 진명 데포",
        seedKey: "post-lineage-classic-sell-01",
        serverName: "데포",
        status: "open",
        title: "리니지 클래식 75렙 진명 데포 양도",
        tradeType: "sell",
        viewCount: 198
      },

      // ── 리니지2 ──
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        category: "game_money",
        content:
          "리니지2 PC 신드라서버 아데나 5억 판매. 1억당 9,000원 시세 / 안전거래.",
        gameSlug: "lineage2",
        price: 45000,
        priceLabel: "45,000원",
        quantityDescription: "아데나 5억",
        seedKey: "post-lineage2-sell-01",
        serverName: "신드라",
        status: "open",
        title: "리니지2 신드라 아데나 5억 (9,000/1억)",
        tradeType: "sell",
        viewCount: 73
      },
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        category: "item",
        content:
          "리니지2 영웅등급 84+ 듀얼소드 + 영지 토벌대 매물. 부속 보석 풀강 포함.",
        gameSlug: "lineage2",
        price: 320000,
        priceLabel: "320,000원",
        quantityDescription: "영웅 84+ 듀얼소드",
        seedKey: "post-lineage2-sell-02",
        serverName: "신드라",
        status: "open",
        title: "리니지2 영웅 84+ 듀얼소드 풀강",
        tradeType: "sell",
        viewCount: 134
      },

      // ════════════════════════════════════════════════════════════════
      // 모바일 MMORPG
      // ════════════════════════════════════════════════════════════════

      // ── 리니지M ──
      {
        authorEmail: "trader1@itemmarket.local",
        category: "game_money",
        content:
          "리니지M 켄트서버 다이아 30만개 일괄 판매. 거래소 통한 안전거래만. 거래소 수수료는 50:50 부담 협의 가능.",
        gameSlug: "lineagem",
        price: 750000,
        priceLabel: "750,000원",
        quantityDescription: "30만 다이아",
        seedKey: "post-lineagem-sell-01",
        serverName: "켄트",
        status: "open",
        title: "켄트서버 다이아 30만개 (안전거래)",
        tradeType: "sell",
        viewCount: 312
      },
      {
        authorEmail: "trader1@itemmarket.local",
        category: "item",
        content:
          "오만의 탑 카오스 슬레이어 +9 강화 무기 매물입니다. 강화 보호 적용된 상태이며 영혼 결정 50개 포함.",
        gameSlug: "lineagem",
        price: 1200000,
        priceLabel: "1,200,000원",
        quantityDescription: "카오스 슬레이어 +9",
        seedKey: "post-lineagem-sell-02",
        serverName: "에덴",
        status: "open",
        title: "에덴 카오스 슬레이어 +9 (영혼결정 포함)",
        tradeType: "sell",
        viewCount: 245
      },

      // ── 리니지W ──
      {
        authorEmail: "trader1@itemmarket.local",
        category: "account",
        content:
          "리니지W 본캐 75레벨 + 부캐 60+ 2종 풀패키지 양도. 변신 카드 30+ / 룬 일부 보유.",
        gameSlug: "lineagew",
        price: 2400000,
        priceLabel: "2,400,000원",
        quantityDescription: "75레벨 본캐 + 부캐 2종",
        seedKey: "post-lineagew-sell-01",
        serverName: "글로벌-04",
        status: "open",
        title: "리니지W 75레벨 풀패키지 양도",
        tradeType: "sell",
        viewCount: 178
      },
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        category: "game_money",
        content:
          "리니지W 글로벌-08 다이아 5만개 판매. 시세 1만 = 18,000원. 안전거래만.",
        gameSlug: "lineagew",
        price: 90000,
        priceLabel: "90,000원",
        quantityDescription: "다이아 5만개",
        seedKey: "post-lineagew-sell-02",
        serverName: "글로벌-08",
        status: "open",
        title: "리니지W 글로벌-08 다이아 5만 (18,000/1만)",
        tradeType: "sell",
        viewCount: 91
      },

      // ── 리니지2M ──
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        category: "item",
        content:
          "리니지2M 글로벌서버 영혼결정 200개 + 다이아 8만개 일괄. 즉시 거래 가능.",
        gameSlug: "lineage2m",
        price: 220000,
        priceLabel: "220,000원",
        quantityDescription: "영혼결정 200개 + 다이아 8만",
        seedKey: "post-lineage2m-sell-01",
        serverName: "글로벌",
        status: "open",
        title: "리니지2M 영혼결정 200 + 다이아 8만",
        tradeType: "sell",
        viewCount: 116
      },

      // ── 오딘 ──
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        category: "game_money",
        content:
          "오딘 한국서버 다이아 10만개 + 룬 10만 판매. 분할 거래 가능, 시세 협의.",
        gameSlug: "odin",
        price: 280000,
        priceLabel: "280,000원",
        quantityDescription: "다이아 10만 + 룬 10만",
        seedKey: "post-odin-sell-01",
        serverName: "한국",
        status: "open",
        title: "오딘 다이아 10만 + 룬 10만 일괄",
        tradeType: "sell",
        viewCount: 87
      },

      // ════════════════════════════════════════════════════════════════
      // 모바일 RPG (오픈월드 / 가챠)
      // ════════════════════════════════════════════════════════════════

      // ── 원신 ──
      {
        authorEmail: "trader4@itemmarket.local",
        category: "account",
        content:
          "AR 60 / 5성 캐릭터 18체 / 5성 무기 12개 보유 계정. 나선의 12층 풀스타 클리어 가능.",
        gameSlug: "genshin",
        price: 580000,
        priceLabel: "580,000원",
        quantityDescription: "AR 60 / 5성 18체 계정",
        seedKey: "post-genshin-sell-01",
        serverName: "아시아",
        status: "open",
        title: "원신 AR 60 / 5성 18체 풀스타 계정",
        tradeType: "sell",
        viewCount: 304
      },
      {
        authorEmail: "trader4@itemmarket.local",
        category: "etc",
        content:
          "원석 60연차 보장 시드 계정 판매. AR 1-25 / 신규 픽업 60연차 보장. 첫번째 5성 보장.",
        gameSlug: "genshin",
        price: 35000,
        priceLabel: "35,000원",
        quantityDescription: "60연차 보장 시드",
        seedKey: "post-genshin-sell-02",
        serverName: "아시아",
        status: "open",
        title: "원신 60연차 보장 시드 (5성 보장)",
        tradeType: "sell",
        viewCount: 219
      },

      // ── 명조: 워더링 웨이브 ──
      {
        authorEmail: "choi.minseo@itemmarket.local",
        category: "account",
        content:
          "명조 글로벌서버 5성 6체 (창극신/카멜리아/베리나 등) + 5성 무기 4개 보유 계정. 데이터 인계 가능.",
        gameSlug: "wuwa",
        price: 320000,
        priceLabel: "320,000원",
        quantityDescription: "5성 6체 + 5성 무기 4",
        seedKey: "post-wuwa-sell-01",
        serverName: "글로벌",
        status: "open",
        title: "명조 글로벌 5성 6체 + 카멜리아 계정",
        tradeType: "sell",
        viewCount: 178
      },
      {
        authorEmail: "choi.minseo@itemmarket.local",
        category: "etc",
        content:
          "명조 60연차 보장 시드. 첫번째 5성 보장 + 한도 픽업 보장. UID 신규 / 데이터 인계 안내.",
        gameSlug: "wuwa",
        price: 38000,
        priceLabel: "38,000원",
        quantityDescription: "60연차 보장 시드",
        seedKey: "post-wuwa-sell-02",
        serverName: "글로벌",
        status: "open",
        title: "명조 60연차 보장 시드 (5성 보장)",
        tradeType: "sell",
        viewCount: 167
      },
      {
        authorEmail: "choi.minseo@itemmarket.local",
        category: "etc",
        content:
          "명조 신규 픽업 대리 진행. 10연차당 가격 / 한도 보장 시 5성 픽업 인증. 안전거래.",
        gameSlug: "wuwa",
        price: 12000,
        priceLabel: "12,000원/10연차",
        quantityDescription: "픽업 대리 (10연차)",
        seedKey: "post-wuwa-sell-03",
        serverName: "글로벌",
        status: "open",
        title: "명조 신규 픽업 대리 (10연차)",
        tradeType: "sell",
        viewCount: 92
      },

      // ── 명일방주: 엔드필드 ──
      {
        authorEmail: "choi.minseo@itemmarket.local",
        category: "etc",
        content:
          "명일방주 엔드필드 클로즈 베타 키 양도합니다. 글로벌 서버 / 진행 데이터 인계 안내 가능.",
        gameSlug: "endfield",
        price: 22000,
        priceLabel: "22,000원",
        quantityDescription: "베타 키 1장",
        seedKey: "post-endfield-sell-01",
        serverName: "글로벌",
        status: "open",
        title: "엔드필드 클로즈 베타 키 양도",
        tradeType: "sell",
        viewCount: 134
      },

      // ── 붕괴: 스타레일 ──
      {
        authorEmail: "yoon.haeun@itemmarket.local",
        category: "account",
        content:
          "붕스타 아시아서버 신영 5성 8체 (블랙스완 / 인장 / 동산귀 등) / 별궤도 풀강 / 망각의 정원 12층 풀스타.",
        gameSlug: "hsr",
        price: 540000,
        priceLabel: "540,000원",
        quantityDescription: "5성 8체 + 별궤도 풀강",
        seedKey: "post-hsr-sell-01",
        serverName: "아시아",
        status: "open",
        title: "붕스타 아시아 신영 8체 / 망각 12층 풀스타",
        tradeType: "sell",
        viewCount: 287
      },
      {
        authorEmail: "yoon.haeun@itemmarket.local",
        category: "etc",
        content:
          "붕스타 별영석 60연차 보장 시드. 첫번째 5성 보장 + 한도 픽업 보장. UID 신규.",
        gameSlug: "hsr",
        price: 42000,
        priceLabel: "42,000원",
        quantityDescription: "60연차 보장 시드",
        seedKey: "post-hsr-sell-02",
        serverName: "아시아",
        status: "open",
        title: "붕스타 별영석 60연차 보장 시드",
        tradeType: "sell",
        viewCount: 198
      },
      {
        authorEmail: "yoon.haeun@itemmarket.local",
        category: "etc",
        content:
          "붕스타 신규 픽업 대리. 10연차당 정액 / 풀돌 대리도 별도 견적. 안전거래.",
        gameSlug: "hsr",
        price: 14000,
        priceLabel: "14,000원/10연차",
        quantityDescription: "픽업 대리 (10연차)",
        seedKey: "post-hsr-sell-03",
        serverName: "아시아",
        status: "open",
        title: "붕스타 신규 픽업 대리 (10연차)",
        tradeType: "sell",
        viewCount: 113
      },

      // ── 명일방주 ──
      {
        authorEmail: "trader4@itemmarket.local",
        category: "account",
        content:
          "명일방주 로도스 등급 18 / 6성 오퍼레이터 30+ / 모듈 풀세팅 계정. 인계증 대량 보유.",
        gameSlug: "arknights",
        price: 220000,
        priceLabel: "220,000원",
        quantityDescription: "로도스 18 / 6성 30+",
        seedKey: "post-arknights-sell-01",
        serverName: "글로벌",
        status: "open",
        title: "명일방주 로도스 18 풀세팅 계정",
        tradeType: "sell",
        viewCount: 87
      },
      {
        authorEmail: "choi.minseo@itemmarket.local",
        category: "etc",
        content:
          "명일방주 6성 픽업 대리 진행합니다. 한도 보장 / 6성 인증 사진 제공.",
        gameSlug: "arknights",
        price: 18000,
        priceLabel: "18,000원/픽업",
        quantityDescription: "6성 픽업 대리",
        seedKey: "post-arknights-sell-02",
        serverName: "글로벌",
        status: "open",
        title: "명일방주 6성 픽업 대리",
        tradeType: "sell",
        viewCount: 74
      },

      // ── 승리의 여신: 니케 ──
      {
        authorEmail: "choi.minseo@itemmarket.local",
        category: "account",
        content:
          "니케 한국서버 SSR 30체 / 풀돌 캐릭 5체 / 챕터 35 클리어 / 정금 패스 잔여 60일.",
        gameSlug: "nikke",
        price: 280000,
        priceLabel: "280,000원",
        quantityDescription: "SSR 30체 / 풀돌 5체",
        seedKey: "post-nikke-sell-01",
        serverName: "한국",
        status: "open",
        title: "니케 한국 SSR 30체 / 풀돌 5체 / 정금 60일",
        tradeType: "sell",
        viewCount: 156
      },
      {
        authorEmail: "choi.minseo@itemmarket.local",
        category: "etc",
        content:
          "니케 정금 패스 양도. 잔여 60일 / 즉시 인계 가능. 시세 절반 가격에 진행.",
        gameSlug: "nikke",
        price: 25000,
        priceLabel: "25,000원",
        quantityDescription: "정금 패스 60일",
        seedKey: "post-nikke-sell-02",
        serverName: "한국",
        status: "open",
        title: "니케 정금 패스 60일 양도 (절반가)",
        tradeType: "sell",
        viewCount: 84
      },

      // ════════════════════════════════════════════════════════════════
      // 액션 RPG
      // ════════════════════════════════════════════════════════════════

      // ── Path of Exile ──
      {
        authorEmail: "jung.taehyung@itemmarket.local",
        category: "game_money",
        content:
          "POE 시즌 디바인 50개 판매. Standard 리그 / 1디바인 = 7,500원. 안전거래만 / 5분 내 전달.",
        gameSlug: "poe",
        price: 375000,
        priceLabel: "375,000원",
        quantityDescription: "디바인 오브 50개",
        seedKey: "post-poe-sell-01",
        serverName: "Standard",
        status: "open",
        title: "POE 디바인 50개 (1D = 7,500원)",
        tradeType: "sell",
        viewCount: 198
      },
      {
        authorEmail: "jung.taehyung@itemmarket.local",
        category: "item",
        content:
          "POE 미러 거래 매물 — 희귀 더블 매스 무기. 빌드 컨설팅 포함 / 안전거래만 진행.",
        gameSlug: "poe",
        price: 1450000,
        priceLabel: "1,450,000원",
        quantityDescription: "미러 더블 매스 무기",
        seedKey: "post-poe-sell-02",
        serverName: "Standard",
        status: "open",
        title: "POE 미러 더블 매스 무기 + 빌드 컨설팅",
        tradeType: "sell",
        viewCount: 287
      },

      // ── Path of Exile 2 ──
      {
        authorEmail: "jung.taehyung@itemmarket.local",
        category: "game_money",
        content:
          "POE2 시즌 디바인 30개 판매. Standard 리그 / 1디바인 = 9,200원. 거래 후기 200+ 보유.",
        gameSlug: "poe2",
        price: 276000,
        priceLabel: "276,000원",
        quantityDescription: "디바인 오브 30개",
        seedKey: "post-poe2-sell-01",
        serverName: "Standard",
        status: "open",
        title: "POE2 디바인 30개 (1D = 9,200원)",
        tradeType: "sell",
        viewCount: 156
      },

      // ── 디아블로 II ──
      {
        authorEmail: "jung.taehyung@itemmarket.local",
        category: "game_money",
        content:
          "디아블로 II Resurrected 라더 시즌 조던링 5개 판매. 미국 서버 / 즉시 거래.",
        gameSlug: "diablo2",
        price: 90000,
        priceLabel: "90,000원",
        quantityDescription: "조던링 5개",
        seedKey: "post-diablo2-sell-01",
        serverName: "Americas Ladder",
        status: "open",
        title: "디아블로2R 라더 조던링 5개",
        tradeType: "sell",
        viewCount: 123
      },
      {
        authorEmail: "jung.taehyung@itemmarket.local",
        category: "item",
        content:
          "디아블로2R 인피니티 룬워드 (베르 마알 베르 이스트). 4S 폴암 / 시즌 매물.",
        gameSlug: "diablo2",
        price: 220000,
        priceLabel: "220,000원",
        quantityDescription: "인피니티 폴암",
        seedKey: "post-diablo2-sell-02",
        serverName: "Americas Ladder",
        status: "open",
        title: "디아블로2R 인피니티 룬워드 (시즌)",
        tradeType: "sell",
        viewCount: 184
      },

      // ── 디아블로 III ──
      {
        authorEmail: "jung.taehyung@itemmarket.local",
        category: "account",
        content:
          "디아블로3 시즌 30 그마 풀세팅 야만전사. 균열 150단 클리어 / 핏빛 보석 80+. 즉시 거래 가능.",
        gameSlug: "diablo3",
        price: 140000,
        priceLabel: "140,000원",
        quantityDescription: "시즌30 그마 야만전사",
        seedKey: "post-diablo3-sell-01",
        serverName: "Americas",
        status: "open",
        title: "디아블로3 시즌30 그마 야만전사 풀세팅",
        tradeType: "sell",
        viewCount: 96
      },

      // ── 디아블로 IV ──
      {
        authorEmail: "trader3@itemmarket.local",
        category: "item",
        content:
          "시즌 5 / 야만전사 920+ 아이템파워 풀세팅. 정식 거래 / 안전거래만 진행.",
        gameSlug: "diablo4",
        price: 240000,
        priceLabel: "240,000원",
        quantityDescription: "야만전사 920+ 풀세팅",
        seedKey: "post-diablo-sell-01",
        serverName: "Americas",
        status: "open",
        title: "디아블로4 시즌5 야만전사 920+ 세트",
        tradeType: "sell",
        viewCount: 113
      },
      {
        authorEmail: "jung.taehyung@itemmarket.local",
        category: "account",
        content:
          "디아블로4 시즌6 마법사 940+ 풀세팅 / 영원 둥지 70층 클리어. 균열석 다수 보유.",
        gameSlug: "diablo4",
        price: 290000,
        priceLabel: "290,000원",
        quantityDescription: "시즌6 마법사 940+",
        seedKey: "post-diablo4-sell-02",
        serverName: "Asia",
        status: "open",
        title: "디아블로4 시즌6 마법사 940+ 풀세팅",
        tradeType: "sell",
        viewCount: 144
      },

      // ════════════════════════════════════════════════════════════════
      // 스포츠
      // ════════════════════════════════════════════════════════════════

      // ── FC Online ──
      {
        authorEmail: "admin@itemmarket.local",
        category: "account",
        content:
          "구단가치 1조 이상 / 23 TOTY 다수 보유 계정 매입합니다. 안전거래 우선.",
        gameSlug: "fc-online",
        price: 450000,
        priceLabel: "450,000원",
        quantityDescription: "구단가치 1조 이상 계정",
        seedKey: "post-fc-buy-01",
        serverName: "한국",
        status: "closed",
        title: "FC Online 팀컬러 완성 계정 삽니다",
        tradeType: "buy",
        viewCount: 129
      },
      {
        authorEmail: "trader2@itemmarket.local",
        category: "item",
        content:
          "23 TOTY 메시 풀강 + 24 챔스 호날두 9강 일괄 판매. 안전거래 위해 사진/영상 첨부 가능.",
        gameSlug: "fc-online",
        price: 320000,
        priceLabel: "320,000원",
        quantityDescription: "TOTY 메시 풀강 + 호날두 9강",
        seedKey: "post-fc-sell-01",
        serverName: "한국",
        status: "open",
        title: "FC Online TOTY 메시 풀강 + 호날두 9강",
        tradeType: "sell",
        viewCount: 198
      },
      {
        authorEmail: "trader2@itemmarket.local",
        category: "etc",
        content:
          "랭커 매니저 대리 진행합니다. 디비전 2 → 디비전 1 / 챔스 진출까지. 1주 단위 결제.",
        gameSlug: "fc-online",
        price: 90000,
        priceLabel: "90,000원/주",
        quantityDescription: "디비전 1 진입까지",
        seedKey: "post-fc-sell-02",
        serverName: "한국",
        status: "open",
        title: "FC Online 디비전 매니저 대리 (1주)",
        tradeType: "sell",
        viewCount: 64
      },
      {
        authorEmail: "trader2@itemmarket.local",
        category: "item",
        content:
          "24 챔스 음바페 풀강 + 23 EBS 호날두 8강. 일괄/분할 모두 가능합니다.",
        gameSlug: "fc-online",
        price: 280000,
        priceLabel: "280,000원",
        quantityDescription: "챔스 음바페 + EBS 호날두",
        seedKey: "post-fc-sell-03",
        serverName: "한국",
        status: "open",
        title: "24 챔스 음바페 풀강 + EBS 호날두 8강",
        tradeType: "sell",
        viewCount: 156
      },

      // ════════════════════════════════════════════════════════════════
      // FPS
      // ════════════════════════════════════════════════════════════════

      // ── 발로란트 ──
      {
        authorEmail: "trader5@itemmarket.local",
        category: "account",
        content:
          "발로란트 임모탈 2 계정 / 챔스 번들 + 프라임 2.0 + 글리치팝 보유. KDA 1.45 / WR 58%.",
        gameSlug: "valorant",
        price: 380000,
        priceLabel: "380,000원",
        quantityDescription: "임모탈 2 / 스킨 다수",
        seedKey: "post-valorant-sell-01",
        serverName: "KR",
        status: "open",
        title: "발로란트 임모탈2 / 챔스+프라임 보유 계정",
        tradeType: "sell",
        viewCount: 156
      },
      {
        authorEmail: "trader5@itemmarket.local",
        category: "etc",
        content:
          "발로란트 듀오 부스팅 진행합니다. 다이아 → 어센던트 / 어센던트 → 임모탈 가능. 1티어 1만원.",
        gameSlug: "valorant",
        price: 10000,
        priceLabel: "10,000원/티어",
        quantityDescription: "다이아 ~ 임모탈 부스팅",
        seedKey: "post-valorant-sell-02",
        serverName: "KR",
        status: "open",
        title: "발로란트 듀오 부스팅 (다이아~임모탈)",
        tradeType: "sell",
        viewCount: 98
      },
      {
        authorEmail: "han.yujin@itemmarket.local",
        category: "account",
        content:
          "발로란트 KR서버 레디언트 계정. 모든 챔스 번들 / 프라임 2.0 / 레큐엠 보유. WR 62%.",
        gameSlug: "valorant",
        price: 720000,
        priceLabel: "720,000원",
        quantityDescription: "레디언트 / 챔스+프라임+레큐엠",
        seedKey: "post-valorant-sell-03",
        serverName: "KR",
        status: "open",
        title: "발로란트 레디언트 / 챔스+프라임+레큐엠",
        tradeType: "sell",
        viewCount: 246
      },

      // ── 오버워치 2 ──
      {
        authorEmail: "trader5@itemmarket.local",
        category: "account",
        content:
          "오버워치 2 그마 계정 / 모든 영웅 마스터 1500점 이상 / 레전더리 스킨 다수 보유.",
        gameSlug: "overwatch",
        price: 280000,
        priceLabel: "280,000원",
        quantityDescription: "그마 / 마스터 1500+ 영웅",
        seedKey: "post-overwatch-sell-01",
        serverName: "Asia",
        status: "open",
        title: "오버워치2 그마 / 레전더리 다수 계정",
        tradeType: "sell",
        viewCount: 72
      },
      {
        authorEmail: "bae.minkyung@itemmarket.local",
        category: "etc",
        content:
          "오버워치 2 듀오 부스팅. 다이아 → 마스터 / 마스터 → 그마 가능. 안전 부스팅 / 1티어 단위.",
        gameSlug: "overwatch",
        price: 12000,
        priceLabel: "12,000원/티어",
        quantityDescription: "다이아 ~ 그마 부스팅",
        seedKey: "post-overwatch-sell-02",
        serverName: "Asia",
        status: "open",
        title: "오버워치2 듀오 부스팅 (다이아~그마)",
        tradeType: "sell",
        viewCount: 58
      },

      // ════════════════════════════════════════════════════════════════
      // MOBA
      // ════════════════════════════════════════════════════════════════

      // ── 리그 오브 레전드 ──
      {
        authorEmail: "kang.seungwoo@itemmarket.local",
        category: "account",
        content:
          "LoL KR서버 다이아 1 계정 / 스킨 60+ 보유 / 챔피언 90+. 본인 인증 시 양도 가능.",
        gameSlug: "lol",
        price: 220000,
        priceLabel: "220,000원",
        quantityDescription: "다이아 1 / 스킨 60+",
        seedKey: "post-lol-sell-01",
        serverName: "KR",
        status: "open",
        title: "LoL KR 다이아1 / 스킨 60+ 계정",
        tradeType: "sell",
        viewCount: 312
      },
      {
        authorEmail: "kang.seungwoo@itemmarket.local",
        category: "etc",
        content:
          "LoL 챌린저 듀오큐 부스팅. 다이아 → 마스터 1만원 / 마스터 → 그마 1.5만 / 1티어 단위.",
        gameSlug: "lol",
        price: 10000,
        priceLabel: "10,000원/티어",
        quantityDescription: "다이아 ~ 그마 부스팅",
        seedKey: "post-lol-sell-02",
        serverName: "KR",
        status: "open",
        title: "LoL 챌린저 듀오큐 부스팅 (다이아~그마)",
        tradeType: "sell",
        viewCount: 198
      },
      {
        authorEmail: "kang.seungwoo@itemmarket.local",
        category: "account",
        content:
          "LoL 한정 스킨 풀더링 계정 (Pulsefire Ezreal, K/DA 아리, Black Alistar 등). 본인 인증 양도.",
        gameSlug: "lol",
        price: 480000,
        priceLabel: "480,000원",
        quantityDescription: "한정 스킨 풀더링",
        seedKey: "post-lol-sell-03",
        serverName: "KR",
        status: "open",
        title: "LoL 한정 스킨 풀더링 계정 (Black Alistar 포함)",
        tradeType: "sell",
        viewCount: 287
      }
    ],
    comments: [
      // ── 1차 시드 댓글 ──
      {
        authorEmail: "buyer1@itemmarket.local",
        content: "60억만 먼저 거래 가능한지 문의드립니다.",
        postSeedKey: "post-maple-sell-01",
        seedKey: "comment-maple-01",
        type: "inquiry"
      },
      {
        authorEmail: "trader2@itemmarket.local",
        content: "저녁 22시 이후 거래 가능하신가요? 60억 단위로 진행하고 싶습니다.",
        postSeedKey: "post-maple-sell-01",
        seedKey: "comment-maple-02",
        type: "inquiry"
      },
      {
        authorEmail: "seller1@itemmarket.local",
        content: "전설 카드 선택팩 1세트 보유 중입니다. 댓글 확인 부탁드립니다.",
        postSeedKey: "post-lostark-buy-01",
        seedKey: "comment-lostark-01",
        type: "offer"
      },
      {
        authorEmail: "admin@itemmarket.local",
        content: "거래가 정상적으로 종료되어 관리자 확인 후 완료 처리되었습니다.",
        postSeedKey: "post-fc-buy-01",
        seedKey: "comment-fc-01",
        type: "system"
      },
      {
        authorEmail: "trader2@itemmarket.local",
        content: "TOTY 메시 5강이라도 분할 거래 가능한가요?",
        postSeedKey: "post-fc-sell-01",
        seedKey: "comment-fc-02",
        type: "inquiry"
      },
      {
        authorEmail: "trader1@itemmarket.local",
        content: "다이아 10만 단위로도 가능하면 연락 주세요.",
        postSeedKey: "post-lineagem-sell-01",
        seedKey: "comment-lineagem-01",
        type: "inquiry"
      },
      {
        authorEmail: "buyer1@itemmarket.local",
        content: "AR 60 5성 18체이면 향이호 풀돌 가능한가요? 캐릭터 리스트 확인 부탁.",
        postSeedKey: "post-genshin-sell-01",
        seedKey: "comment-genshin-01",
        type: "inquiry"
      },
      {
        authorEmail: "buyer1@itemmarket.local",
        content: "1640+ 클래스 구성 알 수 있을까요?",
        postSeedKey: "post-lostark-sell-02",
        seedKey: "comment-lostark-sell-01",
        type: "inquiry"
      },

      // ── 2차 시드 댓글 (활성화된 거래소 느낌) ──
      {
        authorEmail: "kim.junho@itemmarket.local",
        content: "30억 분할 가능하면 바로 진행하고 싶습니다. 시세 협의 부탁드려요.",
        postSeedKey: "post-maple-sell-01",
        seedKey: "comment-maple-03",
        type: "inquiry"
      },
      {
        authorEmail: "park.donghyun@itemmarket.local",
        content: "전설 카드 선택팩 가지고 있습니다. 이그하이 1세트 / 사진 보내드리겠습니다.",
        postSeedKey: "post-lostark-buy-01",
        seedKey: "comment-lostark-02",
        type: "offer"
      },
      {
        authorEmail: "buyer1@itemmarket.local",
        content: "1620 풀세팅이면 카직스/노블레스/낙랑 다 가능한가요?",
        postSeedKey: "post-lostark-sell-03",
        seedKey: "comment-lostark-03",
        type: "inquiry"
      },
      {
        authorEmail: "lee.seoyeon@itemmarket.local",
        content: "리니지M 다이아 30만개에 영혼결정 50개 추가 가능한가요?",
        postSeedKey: "post-lineagem-sell-01",
        seedKey: "comment-lineagem-02",
        type: "inquiry"
      },
      {
        authorEmail: "trader1@itemmarket.local",
        content: "데포로쥬 잔여 일수 90일 맞나요? 기간 갱신 가능한지 궁금합니다.",
        postSeedKey: "post-lineage1-sell-02",
        seedKey: "comment-lineage1-01",
        type: "inquiry"
      },
      {
        authorEmail: "choi.minseo@itemmarket.local",
        content: "엔드필드 베타 키 진행 가능합니다. DM 부탁드려요.",
        postSeedKey: "post-endfield-sell-01",
        seedKey: "comment-endfield-01",
        type: "offer"
      },
      {
        authorEmail: "yoon.haeun@itemmarket.local",
        content: "신영 8체 캐릭터 리스트 좀 알려주세요. 블랙스완 풀돌인지 확인하고 싶어요.",
        postSeedKey: "post-hsr-sell-01",
        seedKey: "comment-hsr-01",
        type: "inquiry"
      },
      {
        authorEmail: "trader4@itemmarket.local",
        content: "60연차 보장 시드 인계 안내 부탁드립니다. 입금 후 즉시 데이터 인계 가능한가요?",
        postSeedKey: "post-hsr-sell-02",
        seedKey: "comment-hsr-02",
        type: "inquiry"
      },
      {
        authorEmail: "buyer1@itemmarket.local",
        content: "명조 카멜리아 풀돌인지 확인 부탁드립니다. 5성 무기는 어떤 4종인가요?",
        postSeedKey: "post-wuwa-sell-01",
        seedKey: "comment-wuwa-01",
        type: "inquiry"
      },
      {
        authorEmail: "jung.taehyung@itemmarket.local",
        content: "POE2 디바인 30개 분할 가능합니다. 10개씩 3회 진행 어떠세요?",
        postSeedKey: "post-poe2-sell-01",
        seedKey: "comment-poe2-01",
        type: "offer"
      },
      {
        authorEmail: "buyer1@itemmarket.local",
        content: "디아블로4 시즌6 마법사 빌드 알려주실 수 있나요? 영원 둥지 70층은 빙결 빌드인지 궁금합니다.",
        postSeedKey: "post-diablo4-sell-02",
        seedKey: "comment-diablo4-01",
        type: "inquiry"
      },
      {
        authorEmail: "han.yujin@itemmarket.local",
        content: "발로란트 레디언트 계정 사진/영상 확인 가능할까요? 챔스 번들 검수 후 거래 희망.",
        postSeedKey: "post-valorant-sell-03",
        seedKey: "comment-valorant-01",
        type: "inquiry"
      },
      {
        authorEmail: "kang.seungwoo@itemmarket.local",
        content: "Black Alistar 보유 인증 가능합니다. 블루이스 추가도 옵션 가능 / DM 주세요.",
        postSeedKey: "post-lol-sell-03",
        seedKey: "comment-lol-01",
        type: "offer"
      },
      {
        authorEmail: "buyer1@itemmarket.local",
        content: "다이아1 계정 챔피언 풀 어떤가요? 미드/탑 챔폭 확인 부탁드립니다.",
        postSeedKey: "post-lol-sell-01",
        seedKey: "comment-lol-02",
        type: "inquiry"
      },
      {
        authorEmail: "oh.jihoon@itemmarket.local",
        content: "와우 클래식 골드 100K 호드 측 거래 가능합니다. 시세 1,150원에 진행 어떠세요?",
        postSeedKey: "post-wow-sell-01",
        seedKey: "comment-wow-01",
        type: "offer"
      },
      {
        authorEmail: "bae.minkyung@itemmarket.local",
        content: "오버워치 그마 계정 모든 영웅 마스터 1500인지 확인 부탁드립니다.",
        postSeedKey: "post-overwatch-sell-01",
        seedKey: "comment-overwatch-01",
        type: "inquiry"
      }
    ]
  };
}
