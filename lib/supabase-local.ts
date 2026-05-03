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
    comments: [
      {
        authorEmail: "buyer1@itemmarket.local",
        content: "60억만 먼저 거래 가능한지 문의드립니다.",
        postSeedKey: "post-maple-sell-01",
        seedKey: "comment-maple-01",
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
      }
    ],
    posts: [
      {
        authorEmail: "seller1@itemmarket.local",
        category: "game_money",
        content:
          "메소 120억 보유 중이며 분할 거래 가능합니다. 스카니아 서버 캐릭터 확인 후 5분 내 전달합니다.",
        gameSlug: "maplestory",
        price: 298000,
        priceLabel: "298,000원",
        quantityDescription: "120억 메소",
        seedKey: "post-maple-sell-01",
        serverName: "스카니아",
        status: "open",
        title: "스카니아 메소 120억 분할 판매",
        tradeType: "sell",
        viewCount: 184
      },
      {
        authorEmail: "buyer1@itemmarket.local",
        category: "item",
        content:
          "옵션 스크린샷 확인 후 바로 거래 희망합니다. 안전거래만 진행하며 댓글 제안 부탁드립니다.",
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
        authorEmail: "admin@itemmarket.local",
        category: "account",
        content:
          "시드용 거래완료 예시 게시글입니다. 관리자가 거래 종료 처리한 흐름을 점검할 때 사용합니다.",
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
      }
    ],
    users: [
      {
        email: "admin@itemmarket.local",
        nickname: "market_admin",
        password: "admin1234!",
        role: "admin"
      },
      {
        email: "seller1@itemmarket.local",
        nickname: "meso_master",
        password: "seller1234!",
        role: "member"
      },
      {
        email: "buyer1@itemmarket.local",
        nickname: "raid_buyer",
        password: "buyer1234!",
        role: "member"
      }
    ]
  };
}
