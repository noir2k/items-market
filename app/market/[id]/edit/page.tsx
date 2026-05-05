import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateMarketPostAction } from "../../actions";
import { isAdminProfile } from "../../../../lib/auth-utils";
import { getMarketPostFormValues, listMarketGameOptions } from "../../../../lib/market-server";
import { canManageMarketPost } from "../../../../lib/market-utils";
import { getCurrentProfile } from "../../../../lib/supabase/server";
import { MarketPostForm } from "../../../../components/MarketPostForm";

export const metadata = {
  title: "거래 글 수정 | ITEM ODIN"
};

export default async function EditMarketPostPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const [post, games, viewer] = await Promise.all([
    getMarketPostFormValues(id),
    listMarketGameOptions(),
    getCurrentProfile()
  ]);

  if (!post) {
    notFound();
  }

  if (!viewer.user || !viewer.profile) {
    redirect(`/login?next=${encodeURIComponent(`/market/${id}/edit`)}`);
  }

  const canManage = canManageMarketPost({
    authorId: post.authorId,
    isAdmin: isAdminProfile(viewer.profile),
    viewerId: viewer.user.id
  });

  if (!canManage) {
    redirect(`/market/${id}?error=${encodeURIComponent("게시글 수정 권한이 없습니다.")}`);
  }

  return (
    <main>
      <section className="topbar">
        <div className="container topbar__inner">
          <span>등록된 거래 글 정보를 수정할 수 있습니다</span>
          <Link href={`/market/${id}`}>상세로 돌아가기</Link>
        </div>
      </section>

      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">EDIT FLOW</p>
          <h1>거래 글 수정</h1>
          <p>제목, 수량, 설명, 금액 정보를 갱신하고 다시 거래소에 반영합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container form-layout">
          <MarketPostForm
            action={updateMarketPostAction.bind(null, id)}
            buttonLabel="수정 내용 저장하기"
            error={resolvedSearchParams.error}
            games={games}
            message={resolvedSearchParams.message}
            title="등록 정보 수정"
            tradeType={post.tradeType}
            values={post}
          />

          <aside className="panel side-info">
            <p className="eyebrow">EDIT GUIDE</p>
            <h3>수정 시 확인 사항</h3>
            <ul className="bullet-list">
              <li>게임 / 서버 / 수량 / 조건이 현재 거래 상태와 일치하는지 확인해 주세요.</li>
              <li>거래완료 처리 전까지는 언제든 수정 가능합니다.</li>
              <li>권한은 글쓴이 본인 또는 관리자에게만 열립니다.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
