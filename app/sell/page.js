import Link from "next/link";
import { MockForm } from "../../components/MockForm";

export const metadata = {
  title: "판매등록 | ITEMMARKET"
};

const fields = [
  {
    label: "거래 카테고리",
    type: "select",
    options: ["게임머니", "아이템", "계정", "기타"]
  },
  {
    label: "게임명",
    type: "text",
    placeholder: "예: 메이플스토리"
  },
  {
    label: "서버 / 월드",
    type: "text",
    placeholder: "예: 스카니아"
  },
  {
    label: "판매 금액",
    type: "text",
    placeholder: "예: 120,000원"
  },
  {
    label: "상품 제목",
    type: "text",
    placeholder: "예: 스카니아 메소 50억 즉시 거래",
    full: true
  },
  {
    label: "상세 설명",
    type: "textarea",
    placeholder: "거래 방식, 보유 수량, 전달 가능 시간 등을 입력합니다.",
    full: true
  }
];

export default function SellPage() {
  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>판매 물품 정보를 입력하고 거래를 등록하세요</span>
          <Link href="/market">등록 후 노출 위치 보기</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">SELL FLOW</p>
          <h1>판매등록</h1>
          <p>카테고리, 서버, 가격, 상세 설명을 입력해 판매 물품을 등록할 수 있습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container form-layout">
          <MockForm
            buttonLabel="판매 물품 등록하기"
            fields={fields}
            title="판매 정보 입력"
            type="sell"
          />

          <aside className="panel side-info">
            <p className="eyebrow">CHECKLIST</p>
            <h3>등록 화면에서 보여줄 요소</h3>
            <ul className="bullet-list">
              <li>카테고리, 게임명, 서버, 가격, 설명 입력</li>
              <li>판매자 주의사항과 안전거래 안내</li>
              <li>등록 완료 후 리스트 페이지 진입 유도</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
