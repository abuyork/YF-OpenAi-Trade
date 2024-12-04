export interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketPreviousClose: number;
  regularMarketVolume: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  marketCap: number;
  trailingPE: number;
  priceToBook: number;
  dividendYield: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  historical: HistoricalDataPoint[];
}

export interface MarketData {
  quote: StockQuote;
  error?: boolean;
  message?: string;
}

export interface AnalysisResponse {
  analysis: string;
  error?: boolean;
  message?: string;
}

export interface APIError {
  error: boolean;
  message: string;
} 