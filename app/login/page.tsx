import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "../../components/AuthCard";
import { signInAction } from "../auth/actions";
import { getCurrentSession } from "../../lib/supabase/server";
import { sanitizeRedirectPath } from "../../lib/auth-utils";
import { getAuthHiddenFields } from "../../lib/navigation-utils";

export const metadata = {
  title: "로그인 | ITEMMARKET"
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const session = await getCurrentSession();
  const nextPath = sanitizeRedirectPath(params?.next);

  if (session) {
    redirect(nextPath || "/market");
  }
  const showLocalAccounts = process.env.NODE_ENV === "development";

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>이메일 로그인으로 거래 글 작성, 댓글, 마이페이지 기능을 사용할 수 있습니다</span>
          <Link href="/signup">회원가입</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">SIGN IN</p>
          <h1>로그인</h1>
          <p>거래 내역과 회원 기능은 로그인한 사용자에게만 제공됩니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-layout">
          <AuthCard
            action={signInAction}
            description="이메일과 비밀번호로 로그인합니다."
            error={params?.error}
            fields={[
              { autoComplete: "email", label: "이메일", name: "email", placeholder: "you@example.com", type: "email" },
              { autoComplete: "current-password", label: "비밀번호", name: "password", placeholder: "비밀번호 입력", type: "password" }
            ]}
            footerLinks={[
              { href: "/signup", label: "회원가입" },
              { href: "/admin/login", label: "관리자 로그인" }
            ]}
            hiddenFields={getAuthHiddenFields({ mode: "member", nextPath })}
            message={params?.message}
            submitLabel="로그인"
            title="회원 로그인"
          />

          {showLocalAccounts ? (
            <aside className="panel side-info">
              <p className="eyebrow">LOCAL ONLY</p>
              <h3>개발용 계정</h3>
              <ul className="bullet-list">
                <li>seller1@itemmarket.local / seller1234!</li>
                <li>buyer1@itemmarket.local / buyer1234!</li>
                <li>admin@itemmarket.local / admin1234!</li>
              </ul>
            </aside>
          ) : null}
        </div>
      </section>
    </main>
  );
}
