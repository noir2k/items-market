import Link from "next/link";
import { MockForm } from "../../components/MockForm";

export const metadata = {
  title: "구매등록 | ITEMMARKET"
};

const fields = [
  {
    label: "희망 카테고리",
    type: "select",
    options: ["게임머니", "아이템", "계정", "기타"]
  },
  {
    label: "게임명",
    type: "text",
    placeholder: "예: 리니지M"
  },
  {
    label: "서버 / 월드",
    type: "text",
    placeholder: "예: 켄라우헬"
  },
  {
    label: "희망 금액",
    type: "text",
    placeholder: "예: 300,000원"
  },
  {
    label: "제목",
    type: "text",
    placeholder: "예: 켄라우헬 다이아 대량 구매 희망",
    full: true
  },
  {
    label: "상세 조건",
    type: "textarea",
    placeholder: "필요 수량, 희망 시간대, 거래 우선 조건 등을 입력합니다.",
    full: true
  }
];

export default function BuyPage() {
  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>희망 조건을 등록하고 원하는 거래를 요청하세요</span>
          <Link href="/guide">거래 절차 확인</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">BUY FLOW</p>
          <h1>구매등록</h1>
          <p>희망 가격과 거래 조건을 등록해 판매자와 빠르게 연결될 수 있습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container form-layout">
          <MockForm
            buttonLabel="구매 요청 등록하기"
            fields={fields}
            title="구매 조건 입력"
            type="buy"
          />

          <aside className="panel side-info">
            <p className="eyebrow">GUIDE</p>
            <h3>구매 요청 등록 안내</h3>
            <ul className="bullet-list">
              <li>희망 게임, 서버, 금액, 거래 조건을 정확히 입력해 주세요.</li>
              <li>거래 전 서버명과 수량, 전달 시간을 다시 확인해 주세요.</li>
              <li>등록 후 거래소와 이용안내에서 진행 절차를 확인할 수 있습니다.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
