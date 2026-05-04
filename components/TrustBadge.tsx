import type { TrustBadgeKind } from "../lib/types";

interface TrustBadgeProps {
  kind: TrustBadgeKind;
  label: string;
}

export function TrustBadge({ kind, label }: TrustBadgeProps) {
  return <span className={`trust-badge trust-badge--${kind}`}>{label}</span>;
}
