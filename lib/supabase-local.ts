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
      { email: "admin@itemmarket.local", nickname: "market_admin", password: "admin1234!", role: "admin" },
      { email: "seller1@itemmarket.local", nickname: "meso_master", password: "seller1234!", role: "member" },
      { email: "buyer1@itemmarket.local", nickname: "raid_buyer", password: "buyer1234!", role: "member" },
      { email: "trader1@itemmarket.local", nickname: "lineage_king", password: "trader1234!", role: "member" },
      { email: "trader2@itemmarket.local", nickname: "fc_pro", password: "trader1234!", role: "member" },
      { email: "trader3@itemmarket.local", nickname: "abyss_runner", password: "trader1234!", role: "member" },
      { email: "trader4@itemmarket.local", nickname: "genshin_collector", password: "trader1234!", role: "member" },
      { email: "trader5@itemmarket.local", nickname: "valor_ace", password: "trader1234!", role: "member" }
    ],
    posts: [
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

      // ── 오버워치 ──
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
      }
    ],
    comments: [
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
      }
    ]
  };
}
