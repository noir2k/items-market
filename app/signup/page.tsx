import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "../../components/AuthCard";
import { signUpAction } from "../auth/actions";
import { getCurrentSession } from "../../lib/supabase/server";

export const metadata = {
  title: "회원가입 | ITEMMARKET"
};

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const session = await getCurrentSession();

  if (session) {
    redirect("/market");
  }

  const params = await searchParams;

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>이메일 회원가입 후 거래소 글쓰기와 댓글 문의 기능을 사용할 수 있습니다</span>
          <Link href="/login">로그인</Link>
        </div>
      </section>

      <section className="page-hero page-hero--compact">
        <div className="container">
          <p className="eyebrow">SIGN UP</p>
          <h1>회원가입</h1>
          <p>닉네임은 프로필에 저장되며 이후 거래 글 작성자명과 마이페이지 기준 데이터로 사용됩니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container auth-layout">
          <AuthCard
            action={signUpAction}
            description="새 계정을 만들고 일반 회원으로 가입합니다."
            error={params?.error}
            fields={[
              { autoComplete: "nickname", label: "닉네임", name: "nickname", placeholder: "예: meso_master", type: "text" },
              { autoComplete: "email", label: "이메일", name: "email", placeholder: "you@example.com", type: "email" },
              { autoComplete: "new-password", label: "비밀번호", name: "password", placeholder: "8자 이상 비밀번호", type: "password" }
            ]}
            footerLinks={[
              { href: "/login", label: "이미 계정이 있나요?" },
              { href: "/guide", label: "이용안내 보기" }
            ]}
            message={params?.message}
            submitLabel="회원가입"
            title="일반 회원가입"
          />

          <aside className="panel side-info">
            <p className="eyebrow">ACCOUNT POLICY</p>
            <h3>가입 안내</h3>
            <ul className="bullet-list">
              <li>가입 후 거래 글 작성과 댓글 등록이 가능합니다.</li>
              <li>닉네임은 거래 글과 마이페이지에 표시됩니다.</li>
              <li>운영 정책을 위반한 계정은 이용이 제한될 수 있습니다.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
