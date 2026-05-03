import type { MarketPostFormValues } from "../lib/market-server";
import type { MarketGameOption, TradeType } from "../lib/types";

const categoryOptions = [
  { label: "게임머니", value: "game_money" },
  { label: "아이템", value: "item" },
  { label: "계정", value: "account" },
  { label: "기타", value: "etc" }
] as const;

interface MarketPostFormProps {
  action: (formData: FormData) => void | Promise<void>;
  buttonLabel: string;
  error?: string | null;
  games: MarketGameOption[];
  message?: string | null;
  title: string;
  tradeType: TradeType;
  values?: Partial<MarketPostFormValues> | null;
}

export function MarketPostForm({
  action,
  buttonLabel,
  error = null,
  games,
  message = null,
  title,
  tradeType,
  values = null
}: MarketPostFormProps) {
  return (
    <form action={action} className="panel form-panel">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="eyebrow">TRADE POST</p>
          <h2>{title}</h2>
        </div>
      </div>

      <input name="tradeType" type="hidden" value={tradeType} />

      {message ? (
        <div className="empty-state empty-state--compact">
          <strong>{message}</strong>
        </div>
      ) : null}

      {error ? (
        <div className="empty-state empty-state--compact">
          <strong>입력 내용을 확인해 주세요.</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="form-grid">
        <label className="field">
          <span>거래 카테고리</span>
          <select defaultValue={values?.category || "game_money"} name="category">
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>게임명</span>
          <select defaultValue={values?.gameId || ""} name="gameId">
            <option disabled value="">게임 선택</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>서버 / 월드</span>
          <input
            defaultValue={values?.serverName || ""}
            name="serverName"
            placeholder="예: 스카니아"
            type="text"
          />
        </label>

        <label className="field">
          <span>{tradeType === "sell" ? "판매 금액" : "희망 금액"}</span>
          <input
            defaultValue={values?.priceLabel || ""}
            name="priceLabel"
            placeholder="예: 120,000원 또는 협의"
            type="text"
          />
        </label>

        <label className="field field--full">
          <span>상품 제목</span>
          <input
            defaultValue={values?.title || ""}
            name="title"
            placeholder="예: 스카니아 메소 50억 즉시 거래"
            type="text"
          />
        </label>

        <label className="field field--full">
          <span>{tradeType === "sell" ? "수량 / 보유 정보" : "희망 수량 / 조건"}</span>
          <input
            defaultValue={values?.quantityDescription || ""}
            name="quantityDescription"
            placeholder={tradeType === "sell" ? "예: 120억 메소" : "예: 전설 카드 선택팩 1세트"}
            type="text"
          />
        </label>

        <label className="field field--full">
          <span>상세 설명</span>
          <textarea
            defaultValue={values?.content || ""}
            name="content"
            placeholder="거래 방식, 보유 수량, 전달 가능 시간 등을 입력합니다."
            rows={7}
          />
        </label>
      </div>

      <div className="checkbox-row">
        <label>
          <input defaultChecked type="checkbox" /> 안전거래 절차 안내를 확인했습니다.
        </label>
        <label>
          <input defaultChecked type="checkbox" /> 등록 정보와 거래 조건을 정확히 입력했습니다.
        </label>
      </div>

      <button className="button button--dark" type="submit">
        {buttonLabel}
      </button>
    </form>
  );
}
