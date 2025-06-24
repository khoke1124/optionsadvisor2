export interface Strategy {
  id: string;
  name: string;
  type: string;
  description: string;
  details: string;
  risk: 'Low' | 'Medium' | 'High';
  profitProbability: number;
  maxProfit: string;
  maxLoss: string;
  breakEvenPoints: number[];
  cost: number;
  strikes: number[];
  tags: string[];
  implementation: string[];
}

export interface Option {
  strike: number;
  bid: number;
  ask: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  iv: number;
}

export interface OptionChain {
  calls: Option[];
  puts: Option[];
}