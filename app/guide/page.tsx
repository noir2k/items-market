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
    title: "댓글 문의",
    description: "로그인 후 상세 페이지에서 거래 조건을 댓글로 문의합니다."
  },
  {
    number: "04",
    title: "거래완료",
    description: "거래가 끝나면 글쓴이 또는 관리자가 게시글을 거래완료 상태로 닫습니다."
  }
];

const faqs = [
  {
    question: "Q. 로그인 없이 거래 글을 등록할 수 있나요?",
    answer: "A. 아니요. 판매등록, 구매등록, 댓글 작성, 마이페이지는 로그인한 회원만 사용할 수 있습니다."
  },
  {
    question: "Q. 거래가 끝난 글은 어떻게 처리하나요?",
    answer: "A. 글쓴이 또는 관리자가 상세 페이지에서 거래완료 처리할 수 있으며, 완료된 글은 추가 댓글 등록이 제한됩니다."
  },
  {
    question: "Q. 게시글 삭제는 바로 실행되나요?",
    answer: "A. 아니요. 실수 삭제를 줄이기 위해 삭제 확인 체크 후에만 게시글 삭제가 처리됩니다."
  }
];

export default function GuidePage() {
  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>거래 흐름, 주의사항, FAQ를 한 곳에서 확인하세요</span>
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
              <li>상세 화면에서 게임, 서버, 수량, 금액, 작성자를 다시 확인할 수 있습니다.</li>
              <li>거래 문의는 게시글 댓글로 남겨 거래 조건을 기록할 수 있습니다.</li>
              <li>글쓴이와 관리자는 거래가 끝난 게시글을 거래완료 상태로 닫을 수 있습니다.</li>
              <li>게시글 삭제는 삭제 확인 체크를 거친 뒤 처리됩니다.</li>
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
