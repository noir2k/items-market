import { cookies } from "next/headers";
import { revertImpersonationAction } from "../app/staff/actions";
import { getCurrentProfile } from "../lib/supabase/server";

const IMPERSONATION_COOKIE = "staff-impersonating-from";

/**
 * 관리자가 일반 회원 계정으로 가장 로그인했을 때 모든 페이지 상단에 노출되는 배너.
 * `staff-impersonating-from` cookie + 현재 로그인한 user를 같이 검사해, cookie만 있고
 * 세션이 없는 stale 상태를 방지한다. 클릭 시 원래 admin 세션으로 복귀.
 */
export async function ImpersonationBanner() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get(IMPERSONATION_COOKIE)?.value;

  if (!adminId) {
    return null;
  }

  const { profile, user } = await getCurrentProfile();

  // cookie만 남아있고 세션이 사라진 경우 — 배너를 띄우지 말고 정리는 다음 요청에 맡김.
  if (!user || !profile) {
    return null;
  }

  // admin 본인이 보고 있다면 가장 상태가 아님 (예외 케이스)
  if (user.id === adminId) {
    return null;
  }

  return (
    <div className="impersonation-banner" role="status">
      <div className="container impersonation-banner__inner">
        <div className="impersonation-banner__text">
          <strong>가장 로그인 진입 중</strong>
          <span>
            관리자 권한으로 <b>{profile.nickname || profile.email}</b> 계정에 진입하여 일반 사용자 화면을 보고
            있습니다. 작성/거래 활동은 실제 회원 계정으로 기록되니 주의하세요.
          </span>
        </div>
        <form action={revertImpersonationAction}>
          <button className="button button--light" type="submit">
            관리자 세션으로 복귀
          </button>
        </form>
      </div>
    </div>
  );
}
