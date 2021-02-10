export type History = {
  fromName: FromName;
  toName: ToName;
  price: number;
  description: string | null;
  time: number;
}

export type FromName = string;
export type ToName = string;
export type AccumulateItem = { fromName: FromName, toName: ToName, price: number };


export interface ShakkinouConnector {
  fetchHistories: () => Promise<History[]>;
  createHistory: (history: History) => Promise<boolean>;
}

// これ多分いらない
export interface Shakkinou {
  showHistories: (historySize: number) => Promise<History[]>;
  createHistory: (history: History) => Promise<boolean>;
  accumulate: () => Promise<AccumulateItem[]>;
}
