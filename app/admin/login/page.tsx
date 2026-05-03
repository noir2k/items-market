import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "../../../components/AuthCard";
import { signInAction } from "../../auth/actions";
import { getCurrentProfile } from "../../../lib/supabase/server";
import { isAdminProfile, sanitizeRedirectPath } from "../../../lib/auth-utils";
import { getAuthHiddenFields } from "../../../lib/navigation-utils";

export const metadata = {
  title: "관리자 로그인 | ITEMMARKET"
};

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const { profile, user } = await getCurrentProfile();
  const nextPath = sanitizeRedirectPath(params?.next);

  if (user && isAdminProfile(profile)) {
    redirect(nextPath || "/admin");
  }
  const showLocalAccounts = process.env.NODE_ENV === "development";

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>관리자 권한이 있는 계정만 관리자 페이지로 진입할 수 있습니다</span>
          <Link href="/login">일반 로그인</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">ADMIN ACCESS</p>
          <h1>관리자 로그인</h1>
          <p>관리자 권한이 있는 계정만 운영 도구에 접근할 수 있습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-layout">
          <AuthCard
            action={signInAction}
            description="관리자 역할을 가진 계정으로만 로그인할 수 있습니다."
            error={params?.error}
            fields={[
              { autoComplete: "email", label: "관리자 이메일", name: "email", placeholder: "admin@example.com", type: "email" },
              { autoComplete: "current-password", label: "비밀번호", name: "password", placeholder: "비밀번호 입력", type: "password" }
            ]}
            footerLinks={[
              { href: "/login", label: "일반 회원 로그인" },
              { href: "/market", label: "거래소로 돌아가기" }
            ]}
            hiddenFields={getAuthHiddenFields({ mode: "admin", nextPath })}
            message={params?.message}
            submitLabel="관리자 로그인"
            title="관리자 전용 로그인"
          />

          {showLocalAccounts ? (
            <aside className="panel side-info">
              <p className="eyebrow">LOCAL ONLY</p>
              <h3>개발용 관리자 계정</h3>
              <ul className="bullet-list">
                <li>이메일: admin@itemmarket.local</li>
                <li>비밀번호: admin1234!</li>
              </ul>
            </aside>
          ) : null}
        </div>
      </section>
    </main>
  );
}
