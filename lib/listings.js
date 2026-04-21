const listings = [
  {
    id: "maple-meso-01",
    category: "게임머니",
    game: "메이플스토리",
    server: "스카니아",
    title: "스카니아 메소 50억 즉시 거래",
    price: "120,000원",
    seller: "rapid_one",
    rating: "98.7%",
    delivery: "5분 내 전달",
    stock: "50억 메소",
    summary: "거래 경험이 많은 판매자, 빠른 응답, 저녁 시간대 즉시 전달 가능",
    badges: ["안전거래", "빠른전달"]
  },
  {
    id: "lineage-dia-02",
    category: "게임머니",
    game: "리니지M",
    server: "켄라우헬",
    title: "다이아 20,000개 묶음 판매",
    price: "310,000원",
    seller: "dia_master",
    rating: "99.1%",
    delivery: "10분 내 전달",
    stock: "20,000 다이아",
    summary: "대량 거래 대응 가능, 거래 전 서버와 닉네임 재확인 진행",
    badges: ["프리미엄", "대량거래"]
  },
  {
    id: "fc-acc-03",
    category: "계정",
    game: "FC Online",
    server: "한국",
    title: "고강 선수팩 보유 계정 양도",
    price: "480,000원",
    seller: "pitchcontrol",
    rating: "97.9%",
    delivery: "예약 거래 가능",
    stock: "구단가치 1.2조",
    summary: "팀 컬러 완성, 이벤트 보상 다수 보유, 육성 상태가 정리된 계정",
    badges: ["계정거래", "인기"]
  },
  {
    id: "lostark-item-04",
    category: "아이템",
    game: "로스트아크",
    server: "카단",
    title: "전설 카드 선택팩 / 재화 패키지",
    price: "89,000원",
    seller: "cardroom",
    rating: "99.4%",
    delivery: "문의 후 즉시",
    stock: "패키지 3세트",
    summary: "소액 거래에 적합한 구성으로 빠른 전달이 가능한 상품",
    badges: ["아이템", "소액"]
  },
  {
    id: "dnf-gold-05",
    category: "게임머니",
    game: "던전앤파이터",
    server: "카인",
    title: "골드 30억 안전거래",
    price: "154,000원",
    seller: "safevault",
    rating: "98.4%",
    delivery: "15분 내 전달",
    stock: "30억 골드",
    summary: "판매 이력이 안정적이고 빠른 응답이 장점인 골드 거래",
    badges: ["안전거래", "인기"]
  },
  {
    id: "wow-account-06",
    category: "계정",
    game: "월드 오브 워크래프트",
    server: "아즈샤라",
    title: "확장팩 준비 완료 계정 양도",
    price: "260,000원",
    seller: "raidready",
    rating: "96.8%",
    delivery: "상담 후 전달",
    stock: "만렙 캐릭터 4개",
    summary: "컬렉션, 탈것, 업적 구성이 잘 정리된 계정형 상품",
    badges: ["계정거래", "컬렉션"]
  }
];

export function getListings() {
  return listings;
}

export function getFeaturedListings() {
  return listings.slice(0, 3);
}

export function getListingById(id) {
  return listings.find((item) => item.id === id);
}

export function getListingIds() {
  return listings.map((item) => item.id);
}
