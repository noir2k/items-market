"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

interface SearchDebounceInputProps {
  defaultValue?: string;
  paramName: string;
  placeholder?: string;
  /** 검색어 변경 시 함께 초기화할 query param들 (예: 페이지 번호) */
  resetParams?: string[];
  delayMs?: number;
}

/**
 * Live 검색 input — 사용자가 타이핑을 멈추고 N ms 후 URL search param을 자동 갱신.
 * 폼 submit 동작은 그대로 두므로 폼 안에 그대로 배치 가능. selects 등 다른 필드는
 * 명시적 버튼 클릭으로 갱신, 검색 input만 debounce 자동 갱신.
 */
export function SearchDebounceInput({
  defaultValue = "",
  paramName,
  placeholder,
  resetParams = ["page"],
  delayMs = 300
}: SearchDebounceInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFirstRef = useRef(true);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  useEffect(() => {
    if (skipFirstRef.current) {
      skipFirstRef.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams?.toString() || "");
      const trimmed = value.trim();

      if (trimmed) {
        next.set(paramName, trimmed);
      } else {
        next.delete(paramName);
      }
      for (const key of resetParams) {
        next.delete(key);
      }

      const qs = next.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // searchParams는 의도적으로 deps 제외 — URL 변경 시 재실행하면 무한루프
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, paramName, delayMs, router]);

  return (
    <input
      autoComplete="off"
      name={paramName}
      onChange={handleChange}
      placeholder={placeholder}
      type="search"
      value={value}
    />
  );
}
