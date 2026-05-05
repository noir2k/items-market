"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavItem } from "../lib/navigation-utils";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderClient({
  isAuthenticated,
  navItems,
  profileNickname,
  signOutAction
}: {
  isAuthenticated: boolean;
  navItems: NavItem[];
  profileNickname: string | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={`site-header${isOpen ? " is-open" : ""}`}>
      <div className="container site-header__inner">
        <Link className="brand" href="/" onClick={() => setIsOpen(false)}>
          <span aria-hidden="true" className="brand__mark">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="brand-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0b1220" />
                </linearGradient>
                <linearGradient id="brand-gold" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b58a1f" />
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="14" fill="url(#brand-bg)" />
              <circle cx="32" cy="32" r="16" fill="none" stroke="url(#brand-gold)" strokeWidth="5" />
              <rect x="4" y="30.4" width="56" height="3.2" rx="1.2" fill="url(#brand-gold)" />
              <polygon points="55,25 63,32 55,39" fill="url(#brand-gold)" />
              <polygon points="1,29 5,32 1,35" fill="url(#brand-gold)" />
            </svg>
          </span>
          <span className="brand__text">
            <strong>ITEM ODIN</strong>
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
          {isAuthenticated ? (
            <>
              <Link className="text-link" href="/mypage" onClick={() => setIsOpen(false)}>
                {profileNickname || "내 계정"}
              </Link>
              <form action={signOutAction}>
                <button className="button button--dark" type="submit">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className="text-link" href="/login" onClick={() => setIsOpen(false)}>
                로그인
              </Link>
              <Link className="button button--dark" href="/signup" onClick={() => setIsOpen(false)}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
