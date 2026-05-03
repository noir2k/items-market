import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <div className="container">
        <div className="panel not-found__panel">
          <p className="eyebrow">404</p>
          <h1>요청한 거래를 찾을 수 없습니다.</h1>
          <p className="muted">삭제되었거나 존재하지 않는 경로입니다.</p>
          <div className="hero__actions">
            <Link className="button button--dark" href="/market">
              거래소로 이동
            </Link>
            <Link className="button button--light" href="/">
              홈으로 이동
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
