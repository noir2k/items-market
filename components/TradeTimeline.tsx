import type { TradeTimelineState } from "../lib/market-utils";

interface TradeTimelineProps {
  state: TradeTimelineState;
}

function formatTimestampLabel(timestamp: string | undefined, now: Date = new Date()): string | null {
  if (!timestamp) {
    return null;
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "방금";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { day: "numeric", month: "numeric", year: "numeric" }).format(date);
}

export function TradeTimeline({ state }: TradeTimelineProps) {
  const now = new Date();
  return (
    <ol className="trade-timeline">
      {state.steps.map((step) => {
        const timeLabel = formatTimestampLabel(step.timestamp, now);
        return (
          <li key={step.key} className={`trade-timeline__step trade-timeline__step--${step.status}`}>
            <span className="trade-timeline__dot" aria-hidden="true" />
            <span className="trade-timeline__label">{step.label}</span>
            {timeLabel ? <span className="trade-timeline__time">{timeLabel}</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
