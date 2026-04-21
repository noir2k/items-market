import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <strong>ITEMMARKET</strong>
          <p>게임 아이템 · 게임머니 · 계정 거래 마켓</p>
        </div>
        <div className="footer-links">
          <Link href="/">홈</Link>
          <Link href="/market">거래소</Link>
          <Link href="/sell">판매등록</Link>
          <Link href="/buy">구매등록</Link>
          <Link href="/guide">이용안내</Link>
        </div>
      </div>
    </footer>
  );
}
