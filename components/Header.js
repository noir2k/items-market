"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/market", label: "거래소" },
  { href: "/sell", label: "판매등록" },
  { href: "/buy", label: "구매등록" },
  { href: "/guide", label: "이용안내" }
];

function isActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={`site-header${isOpen ? " is-open" : ""}`}>
      <div className="container site-header__inner">
        <Link className="brand" href="/" onClick={() => setIsOpen(false)}>
          <span className="brand__mark">IM</span>
          <span className="brand__text">
            <strong>ITEMMARKET</strong>
            <small>game trade market</small>
          </span>
        </Link>

        <button
          aria-label="메뉴 열기"
          className="menu-toggle"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          메뉴
        </button>

        <nav className="site-nav">
          {navItems.map((item) => (
            <Link
              className={isActive(pathname, item.href) ? "is-active" : undefined}
              href={item.href}
              key={item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="text-link" href="/market" onClick={() => setIsOpen(false)}>
            실시간 시세
          </Link>
          <Link className="button button--dark" href="/sell" onClick={() => setIsOpen(false)}>
            물품 등록
          </Link>
        </div>
      </div>
    </header>
  );
}
