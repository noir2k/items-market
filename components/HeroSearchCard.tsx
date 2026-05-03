"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type SearchMode = "sell" | "buy";

const searchModes: Record<SearchMode, { cta: string; heading: string; title: string }> = {
  buy: { cta: "구매 요청 보기", heading: "구매 요청을 검색해보세요", title: "삽니다" },
  sell: { cta: "판매 물품 보기", heading: "판매 물품을 검색해보세요", title: "팝니다" }
};

const categoryOptions = [
  { code: "all", label: "전체" },
  { code: "game_money", label: "게임머니" },
  { code: "item", label: "아이템" },
  { code: "account", label: "계정" },
  { code: "etc", label: "기타" }
] as const;

export function HeroSearchCard() {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("sell");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]["code"]>("all");
  const [server, setServer] = useState("");
  const currentMode = searchModes[mode];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }

    if (category !== "all") {
      params.set("category", category);
    }

    if (server.trim()) {
      params.set("server", server.trim());
    }

    params.set("tradeType", mode);

    const query = params.toString();
    router.push(query ? `/market?${query}` : "/market");
  }

  return (
    <aside className="search-panel">
      <div className="tabs">
        <button
          aria-pressed={mode === "sell"}
          className={`tab${mode === "sell" ? " tab--active" : ""}`}
          onClick={() => setMode("sell")}
          type="button"
        >
          팝니다
        </button>
        <button
          aria-pressed={mode === "buy"}
          className={`tab${mode === "buy" ? " tab--active" : ""}`}
          onClick={() => setMode("buy")}
          type="button"
        >
          삽니다
        </button>
      </div>

      <h2>{currentMode.heading}</h2>
      <form className="search-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>제목 / 게임 키워드</span>
          <input
            name="q"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="예: 메이플스토리, 메소, 카드"
            type="text"
            value={keyword}
          />
        </label>
        <label className="field">
          <span>카테고리</span>
          <select
            name="category"
            onChange={(event) => setCategory(event.target.value as (typeof categoryOptions)[number]["code"])}
            value={category}
          >
            {categoryOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>서버 / 월드</span>
          <input
            name="server"
            onChange={(event) => setServer(event.target.value)}
            placeholder="예: 스카니아, 카단"
            type="text"
            value={server}
          />
        </label>
        <button className="button button--dark button--full" type="submit">
          {currentMode.cta}
        </button>
      </form>
    </aside>
  );
}
