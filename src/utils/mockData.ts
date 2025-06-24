import { Strategy } from '../types';

// Mock ticker data
export const mockTickerSearch = async (query: string): Promise<any[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const tickers = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 179.46 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 417.22 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.71 },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 181.98 },
    { symbol: 'META', name: 'Meta Platforms, Inc.', price: 478.20 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 237.01 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 942.89 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 199.35 },
    { symbol: 'V', name: 'Visa Inc.', price: 271.34 },
    { symbol: 'WMT', name: 'Walmart Inc.', price: 68.10 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.42 },
    { symbol: 'PG', name: 'Procter & Gamble Co.', price: 166.82 },
    { symbol: 'HD', name: 'The Home Depot, Inc.', price: 363.12 },
    { symbol: 'BAC', name: 'Bank of America Corporation', price: 39.78 },
    { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', price: 536.58 },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 114.91 },
    { symbol: 'PFE', name: 'Pfizer Inc.', price: 28.69 },
    { symbol: 'INTC', name: 'Intel Corporation', price: 33.25 },
    { symbol: 'CSCO', name: 'Cisco Systems, Inc.', price: 46.09 },
    { symbol: 'VZ', name: 'Verizon Communications Inc.', price: 42.56 }
  ];
  
  return tickers.filter(ticker => 
    ticker.symbol.toLowerCase().includes(query.toLowerCase()) || 
    ticker.name.toLowerCase().includes(query.toLowerCase())
  );
};

// Mock option chain data
export const mockOptionChain = (ticker: string, expirationDate: Date) => {
  // This would be a complex data structure representing an option chain
  // For this mock, we'll return a simplified structure
  return {
    calls: [
      { strike: 100, bid: 5.10, ask: 5.30, delta: 0.65, gamma: 0.02, theta: -0.05, vega: 0.10, iv: 0.30 },
      { strike: 105, bid: 3.20, ask: 3.40, delta: 0.55, gamma: 0.03, theta: -0.06, vega: 0.11, iv: 0.29 },
      { strike: 110, bid: 1.85, ask: 2.05, delta: 0.45, gamma: 0.03, theta: -0.07, vega: 0.12, iv: 0.28 },
      { strike: 115, bid: 0.95, ask: 1.15, delta: 0.35, gamma: 0.02, theta: -0.06, vega: 0.10, iv: 0.27 },
      { strike: 120, bid: 0.45, ask: 0.65, delta: 0.25, gamma: 0.02, theta: -0.05, vega: 0.09, iv: 0.26 }
    ],
    puts: [
      { strike: 100, bid: 1.40, ask: 1.60, delta: -0.35, gamma: 0.02, theta: -0.04, vega: 0.10, iv: 0.31 },
      { strike: 95, bid: 0.70, ask: 0.90, delta: -0.25, gamma: 0.02, theta: -0.03, vega: 0.09, iv: 0.30 },
      { strike: 90, bid: 0.30, ask: 0.50, delta: -0.15, gamma: 0.01, theta: -0.02, vega: 0.08, iv: 0.29 },
      { strike: 85, bid: 0.10, ask: 0.30, delta: -0.10, gamma: 0.01, theta: -0.01, vega: 0.07, iv: 0.28 },
      { strike: 80, bid: 0.05, ask: 0.15, delta: -0.05, gamma: 0.01, theta: -0.01, vega: 0.05, iv: 0.27 }
    ]
  };
};