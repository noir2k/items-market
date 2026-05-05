"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AdminNavItem {
  href: string;
  label: string;
}

interface AdminHeaderClientProps {
  isAuthenticated: boolean;
  navItems: AdminNavItem[];
  profileNickname: string | null;
  signOutAction: () => Promise<void>;
}

function isActive(pathname: string, href: string) {
  if (href === "/staff") {
    return pathname === "/staff";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminHeaderClient({
  isAuthenticated,
  navItems,
  profileNickname,
  signOutAction
}: AdminHeaderClientProps) {
  const pathname = usePathname();

  return (
    <header className="staff-header">
      <div className="container staff-header__inner">
        <Link className="staff-brand" href="/staff">
          <span aria-hidden="true" className="staff-brand__mark">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="staff-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0b1220" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="staff-gold" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b58a1f" />
                </linearGradient>
              </defs>
              <rect width="64" height="64" rx="14" fill="url(#staff-bg)" />
              <circle cx="32" cy="32" r="16" fill="none" stroke="url(#staff-gold)" strokeWidth="5" />
              <rect x="4" y="30.4" width="56" height="3.2" rx="1.2" fill="url(#staff-gold)" />
              <polygon points="55,25 63,32 55,39" fill="url(#staff-gold)" />
              <polygon points="1,29 5,32 1,35" fill="url(#staff-gold)" />
            </svg>
          </span>
          <span className="staff-brand__text">
            <strong>ITEM ODIN</strong>
            <small>STAFF CONSOLE</small>
          </span>
        </Link>

        {isAuthenticated ? (
          <>
            <nav className="staff-nav" aria-label="관리자 메뉴">
              {navItems.map((item) => (
                <Link
                  className={isActive(pathname, item.href) ? "is-active" : undefined}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="staff-header__actions">
              {profileNickname ? (
                <span className="staff-header__user" title="현재 로그인한 관리자">
                  {profileNickname}
                </span>
              ) : null}
              <Link className="text-link" href="/market">
                일반 거래소
              </Link>
              <form action={signOutAction}>
                <button className="button button--light" type="submit">
                  로그아웃
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="staff-header__actions">
            <Link className="text-link" href="/market">
              일반 거래소
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
