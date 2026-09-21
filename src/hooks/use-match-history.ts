import { useCallback, useEffect, useState } from "react";

export interface MatchCondition {
  label: string;
  value: string;
  tolMin: string;
  tolMax: string;
}

export interface MatchedProduct {
  id: string;
  name: string;
  motorType: string;
  domain: string;
  power: string;
  speed: string;
  torque: string;
  efficiency: string;
  insulation: string;
}

export interface MatchRecord {
  id: string;
  createdAt: string;
  domain: string;
  motorType: string;
  conditions: MatchCondition[];
  product: MatchedProduct | null;
}

const KEY = "product-match-history";

function read(): MatchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MatchRecord[]) : [];
  } catch {
    return [];
  }
}

function write(records: MatchRecord[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(records));
    window.dispatchEvent(new Event("match-history-updated"));
  } catch {
    /* ignore */
  }
}

export function useMatchHistory() {
  const [records, setRecords] = useState<MatchRecord[]>([]);

  useEffect(() => {
    const sync = () => setRecords(read());
    sync();
    window.addEventListener("match-history-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("match-history-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addRecord = useCallback((record: Omit<MatchRecord, "id" | "createdAt">) => {
    const next: MatchRecord = {
      ...record,
      id: `m-${Date.now()}`,
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    };
    write([next, ...read()]);
    return next;
  }, []);

  const removeRecord = useCallback((id: string) => {
    write(read().filter((r) => r.id !== id));
  }, []);

  return { records, addRecord, removeRecord };
}
