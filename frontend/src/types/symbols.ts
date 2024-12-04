export interface Symbol {
  symbol: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  symbols: Symbol[];
}

export const marketCategories: Category[] = [
  {
    id: 'stocks',
    name: 'Stocks',
    symbols: [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'META', name: 'Meta Platforms Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.' }
    ]
  },
  {
    id: 'forex',
    name: 'Forex',
    symbols: [
      { symbol: 'EURUSD=X', name: 'EUR/USD' },
      { symbol: 'GBPUSD=X', name: 'GBP/USD' },
      { symbol: 'USDJPY=X', name: 'USD/JPY' },
      { symbol: 'AUDUSD=X', name: 'AUD/USD' },
      { symbol: 'USDCAD=X', name: 'USD/CAD' },
      { symbol: 'USDCHF=X', name: 'USD/CHF' }
    ]
  },
  {
    id: 'crypto',
    name: 'Crypto',
    symbols: [
      { symbol: 'BTC-USD', name: 'Bitcoin USD' },
      { symbol: 'ETH-USD', name: 'Ethereum USD' },
      { symbol: 'USDT-USD', name: 'Tether USD' },
      { symbol: 'BNB-USD', name: 'Binance Coin USD' },
      { symbol: 'XRP-USD', name: 'XRP USD' },
      { symbol: 'SOL-USD', name: 'Solana USD' }
    ]
  }
]; 