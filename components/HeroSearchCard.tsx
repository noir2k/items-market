"use client";

import Link from "next/link";
import { useState } from "react";

const chips = ["메이플스토리", "리니지M", "던전앤파이터", "FC Online"];
const searchModes = {
  sell: {
    title: "팝니다",
    heading: "판매 물품을 검색해보세요",
    cta: "판매 물품 보기",
    rankings: [
      "메이플스토리 월드 메소",
      "리니지M 다이아",
      "FC Online 계정",
      "로스트아크 골드",
      "던전앤파이터 골드"
    ]
  },
  buy: {
    title: "삽니다",
    heading: "구매 요청을 검색해보세요",
    cta: "구매 요청 보기",
    rankings: [
      "메이플스토리 메소 구매",
      "리니지M 다이아 구매",
      "FC Online 팀 계정 구매",
      "로스트아크 골드 구매",
      "던전앤파이터 골드 구매"
    ]
  }
};

export function HeroSearchCard() {
  const [mode, setMode] = useState("sell");
  const currentMode = searchModes[mode];

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
      <form className="search-form">
        <label className="field">
          <span>게임 검색</span>
          <input placeholder="예: 메이플스토리, 리니지M, FC Online" type="text" />
        </label>
        <label className="field">
          <span>카테고리</span>
          <select defaultValue="전체">
            <option>전체</option>
            <option>게임머니</option>
            <option>아이템</option>
            <option>계정</option>
            <option>기타</option>
          </select>
        </label>
        <label className="field">
          <span>서버 / 월드</span>
          <input placeholder="예: 스카니아, 아케인" type="text" />
        </label>
        <Link className="button button--dark button--full" href={mode === "sell" ? "/market" : "/buy"}>
          {currentMode.cta}
        </Link>
      </form>

      <div className="search-panel__section">
        <strong>인기 게임</strong>
        <div className="chip-row">
          {chips.map((chip) => (
            <span className="chip" key={chip}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="search-panel__section">
        <strong>{currentMode.title} 인기 검색</strong>
        <ol className="ranking-list">
          {currentMode.rankings.map((item) => (
            <li key={item}>
              <Link href={mode === "sell" ? "/market" : "/buy"}>{item}</Link>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
