export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketPreviousClose: number;
  regularMarketDayLow: number;
  regularMarketDayHigh: number;
  regularMarketVolume: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  marketCap: number;
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