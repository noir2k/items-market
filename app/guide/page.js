import Link from "next/link";

export const metadata = {
  title: "이용안내 | ITEMMARKET"
};

const steps = [
  {
    number: "01",
    title: "물품 검색",
    description: "게임명과 카테고리로 원하는 거래를 빠르게 탐색합니다."
  },
  {
    number: "02",
    title: "상세 확인",
    description: "서버, 가격, 전달 방식, 판매자 정보를 확인합니다."
  },
  {
    number: "03",
    title: "안전거래 진행",
    description: "거래 조건을 다시 확인한 뒤 안전거래 절차에 따라 진행합니다."
  },
  {
    number: "04",
    title: "완료 / 후기",
    description: "거래 완료 후 정산과 후기 등록까지 한 흐름으로 이어집니다."
  }
];

const faqs = [
  {
    question: "Q. 실제 결제나 회원 기능도 있나요?",
    answer: "A. 안전거래, 회원, 결제 기능은 서비스 정책에 맞춰 단계적으로 확장할 수 있습니다."
  },
  {
    question: "Q. 이후 백엔드 연결이 쉬운가요?",
    answer: "A. 거래 목록, 상세, 등록 폼이 분리되어 있어 API와 데이터 연결 구조로 확장하기 쉽습니다."
  },
  {
    question: "Q. 예제 사이트와 어떤 점이 비슷한가요?",
    answer: "A. 카테고리, 실시간 리스트, 안전거래 안내, 등록 중심의 정보 구조를 참고했습니다."
  }
];

export default function GuidePage() {
  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>거래 흐름, 보증, FAQ를 한 곳에서 확인하세요</span>
          <Link href="/market">거래소로 이동</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">SERVICE GUIDE</p>
          <h1>이용안내</h1>
          <p>거래 절차, 안전장치, 자주 묻는 질문을 한눈에 확인할 수 있는 안내 페이지입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--soft">
        <div className="container info-grid">
          <article className="panel">
            <p className="eyebrow">TRUST</p>
            <h2>안전거래 포인트</h2>
            <ul className="bullet-list">
              <li>거래 전 서버/캐릭터/수량을 재확인하는 단계 표시</li>
              <li>판매자 평점과 최근 거래 속도를 시각적으로 표시</li>
              <li>상세 화면에 보증/주의사항 박스를 배치해 신뢰감 강화</li>
            </ul>
          </article>

          <article className="panel">
            <p className="eyebrow">FAQ</p>
            <h2>자주 묻는 질문</h2>
            <div className="faq-list">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
