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
          <span className="brand__mark">IO</span>
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
