import { Strategy } from '../types';

interface StrategyInput {
  ticker: string;
  currentPrice: number;
  predictedPrice: number;
  expirationDate: Date;
}

export const calculateStrategies = (input: StrategyInput): Strategy[] => {
  const { currentPrice, predictedPrice, expirationDate } = input;
  const daysToExpiration = Math.round((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const priceMovement = predictedPrice - currentPrice;
  const percentChange = (priceMovement / currentPrice) * 100;
  const isIncrease = priceMovement > 0;
  const absPercentChange = Math.abs(percentChange);
  
  const strategies: Strategy[] = [];

  // Calculate volatility (simplified)
  const estimatedVolatility = absPercentChange / Math.sqrt(daysToExpiration / 365) * 100;
  
  // Long Call (bullish)
  if (isIncrease) {
    const callStrike = Math.round(currentPrice);
    const callPremium = estimateOptionPremium(
      currentPrice, 
      callStrike, 
      daysToExpiration / 365, 
      estimatedVolatility / 100, 
      0.05, // risk-free rate
      true  // isCall
    );
    
    const callCost = callPremium * 100;
    const breakEven = callStrike + callPremium;
    const maxProfit = percentChange > 15 ? 'Unlimited' : `$${((predictedPrice - breakEven) * 100).toFixed(2)}`;
    const probabilityOfProfit = calculateProbability(currentPrice, predictedPrice, estimatedVolatility, daysToExpiration, 'above', callStrike);
    
    strategies.push({
      id: 'long-call',
      name: 'Long Call',
      type: 'Long Call',
      description: 'Buy call options to profit from a price increase with limited risk.',
      details: 'A long call gives you the right to buy shares at the strike price. It is a leveraged way to benefit from rising prices with defined risk.',
      risk: 'Low',
      profitProbability: Math.round(probabilityOfProfit * 100),
      maxProfit: maxProfit,
      maxLoss: `$${callCost.toFixed(2)}`,
      breakEvenPoints: [breakEven],
      cost: callCost,
      strikes: [callStrike],
      tags: ['Bullish', 'Defined Risk', 'Leverage'],
      implementation: [
        `Buy ${input.ticker} $${callStrike} call for $${callPremium.toFixed(2)}`,
        `Break-even: $${breakEven.toFixed(2)}`,
        `Max loss: $${callCost.toFixed(2)} (premium paid)`
      ]
    });
  }
  
  // Long Put (bearish)
  if (!isIncrease) {
    const putStrike = Math.round(currentPrice);
    const putPremium = estimateOptionPremium(
      currentPrice, 
      putStrike, 
      daysToExpiration / 365, 
      estimatedVolatility / 100, 
      0.05, // risk-free rate
      false // isCall
    );
    
    const putCost = putPremium * 100;
    const breakEven = putStrike - putPremium;
    const maxProfit = percentChange < -15 ? `$${((putStrike - 0) * 100 - putCost).toFixed(2)}` : `$${((breakEven - predictedPrice) * 100).toFixed(2)}`;
    const probabilityOfProfit = calculateProbability(currentPrice, predictedPrice, estimatedVolatility, daysToExpiration, 'below', putStrike);
    
    strategies.push({
      id: 'long-put',
      name: 'Long Put',
      type: 'Long Put',
      description: 'Buy put options to profit from a price decrease with limited risk.',
      details: 'A long put gives you the right to sell shares at the strike price. It is a leveraged way to benefit from falling prices with defined risk.',
      risk: 'Low',
      profitProbability: Math.round(probabilityOfProfit * 100),
      maxProfit: maxProfit,
      maxLoss: `$${putCost.toFixed(2)}`,
      breakEvenPoints: [breakEven],
      cost: putCost,
      strikes: [putStrike],
      tags: ['Bearish', 'Defined Risk', 'Leverage'],
      implementation: [
        `Buy ${input.ticker} $${putStrike} put for $${putPremium.toFixed(2)}`,
        `Break-even: $${breakEven.toFixed(2)}`,
        `Max loss: $${putCost.toFixed(2)} (premium paid)`
      ]
    });
  }
  
  // Bull Call Spread (moderately bullish)
  if (isIncrease && percentChange < 15) {
    const lowerStrike = Math.round(currentPrice);
    const upperStrike = Math.round(currentPrice * (1 + percentChange / 100));
    
    const lowerCallPremium = estimateOptionPremium(currentPrice, lowerStrike, daysToExpiration / 365, estimatedVolatility / 100, 0.05, true);
    const upperCallPremium = estimateOptionPremium(currentPrice, upperStrike, daysToExpiration / 365, estimatedVolatility / 100, 0.05, true);
    
    const netCost = (lowerCallPremium - upperCallPremium) * 100;
    const maxPotentialProfit = (upperStrike - lowerStrike) * 100 - netCost;
    const breakEven = lowerStrike + (lowerCallPremium - upperCallPremium);
    const probabilityOfProfit = calculateProbability(currentPrice, predictedPrice, estimatedVolatility, daysToExpiration, 'above', breakEven);
    
    strategies.push({
      id: 'bull-call-spread',
      name: 'Bull Call Spread',
      type: 'Bull Call Spread',
      description: 'Buy a lower strike call and sell a higher strike call to profit from a moderate price increase.',
      details: 'This strategy caps your potential profit but reduces the cost compared to a long call. Ideal for moderately bullish outlooks.',
      risk: 'Low',
      profitProbability: Math.round(probabilityOfProfit * 100),
      maxProfit: `$${maxPotentialProfit.toFixed(2)}`,
      maxLoss: `$${netCost.toFixed(2)}`,
      breakEvenPoints: [breakEven],
      cost: netCost,
      strikes: [lowerStrike, upperStrike],
      tags: ['Bullish', 'Defined Risk', 'Defined Profit'],
      implementation: [
        `Buy ${input.ticker} $${lowerStrike} call for $${lowerCallPremium.toFixed(2)}`,
        `Sell ${input.ticker} $${upperStrike} call for $${upperCallPremium.toFixed(2)}`,
        `Net cost: $${netCost.toFixed(2)}`,
        `Max profit: $${maxPotentialProfit.toFixed(2)} at $${upperStrike} or above`
      ]
    });
  }
  
  // Bear Put Spread (moderately bearish)
  if (!isIncrease && percentChange > -15) {
    const upperStrike = Math.round(currentPrice);
    const lowerStrike = Math.round(currentPrice * (1 + percentChange / 100));
    
    const upperPutPremium = estimateOptionPremium(currentPrice, upperStrike, daysToExpiration / 365, estimatedVolatility / 100, 0.05, false);
    const lowerPutPremium = estimateOptionPremium(currentPrice, lowerStrike, daysToExpiration / 365, estimatedVolatility / 100, 0.05, false);
    
    const netCost = (upperPutPremium - lowerPutPremium) * 100;
    const maxPotentialProfit = (upperStrike - lowerStrike) * 100 - netCost;
    const breakEven = upperStrike - (upperPutPremium - lowerPutPremium);
    const probabilityOfProfit = calculateProbability(currentPrice, predictedPrice, estimatedVolatility, daysToExpiration, 'below', breakEven);
    
    strategies.push({
      id: 'bear-put-spread',
      name: 'Bear Put Spread',
      type: 'Bear Put Spread',
      description: 'Buy a higher strike put and sell a lower strike put to profit from a moderate price decrease.',
      details: 'This strategy caps your potential profit but reduces the cost compared to a long put. Ideal for moderately bearish outlooks.',
      risk: 'Low',
      profitProbability: Math.round(probabilityOfProfit * 100),
      maxProfit: `$${maxPotentialProfit.toFixed(2)}`,
      maxLoss: `$${netCost.toFixed(2)}`,
      breakEvenPoints: [breakEven],
      cost: netCost,
      strikes: [upperStrike, lowerStrike],
      tags: ['Bearish', 'Defined Risk', 'Defined Profit'],
      implementation: [
        `Buy ${input.ticker} $${upperStrike} put for $${upperPutPremium.toFixed(2)}`,
        `Sell ${input.ticker} $${lowerStrike} put for $${lowerPutPremium.toFixed(2)}`,
        `Net cost: $${netCost.toFixed(2)}`,
        `Max profit: $${maxPotentialProfit.toFixed(2)} at $${lowerStrike} or below`
      ]
    });
  }
  
  // Iron Condor (neutral, expecting low volatility)
  if (Math.abs(percentChange) < 10) {
    const lowerPutStrike = Math.round(currentPrice * 0.9);
    const upperPutStrike = Math.round(currentPrice * 0.95);
    const lowerCallStrike = Math.round(currentPrice * 1.05);
    const upperCallStrike = Math.round(currentPrice * 1.1);
    
    const soldPutPremium = estimateOptionPremium(currentPrice, upperPutStrike, daysToExpiration / 365, estimatedVolatility / 100, 0.05, false);
    const boughtPutPremium = estimateOptionPremium(currentPrice, lowerPutStrike, daysToExpiration / 365, estimatedVolatility / 100, 0.05, false);
    const soldCallPremium = estimateOptionPremium(currentPrice, lowerCallStrike, daysToExpiration / 365, estimatedVolatility / 100, 0.05, true);
    const boughtCallPremium = estimateOptionPremium(currentPrice, upperCallStrike, daysToExpiration / 365, estimatedVolatility / 100, 0.05, true);
    
    const netCredit = (soldPutPremium - boughtPutPremium + soldCallPremium - boughtCallPremium) * 100;
    const maxRisk = ((upperPutStrike - lowerPutStrike) * 100) - netCredit; // Same for call side
    
    const lowerBreakEven = upperPutStrike - netCredit / 100;
    const upperBreakEven = lowerCallStrike + netCredit / 100;
    const probabilityOfProfit = 0.68; // Simplified - normally calculated based on price staying between breakeven points
    
    strategies.push({
      id: 'iron-condor',
      name: 'Iron Condor',
      type: 'Iron Condor',
      description: 'Sell a put spread and a call spread to profit from a sideways price movement.',
      details: 'This strategy profits when the stock stays within a range. It collects premium upfront and has defined risk if the stock moves significantly.',
      risk: 'Medium',
      profitProbability: Math.round(probabilityOfProfit * 100),
      maxProfit: `$${netCredit.toFixed(2)}`,
      maxLoss: `$${maxRisk.toFixed(2)}`,
      breakEvenPoints: [lowerBreakEven, upperBreakEven],
      cost: -netCredit, // Negative cost because it's a credit
      strikes: [lowerPutStrike, upperPutStrike, lowerCallStrike, upperCallStrike],
      tags: ['Neutral', 'Income', 'Defined Risk'],
      implementation: [
        `Sell ${input.ticker} $${upperPutStrike} put for $${soldPutPremium.toFixed(2)}`,
        `Buy ${input.ticker} $${lowerPutStrike} put for $${boughtPutPremium.toFixed(2)}`,
        `Sell ${input.ticker} $${lowerCallStrike} call for $${soldCallPremium.toFixed(2)}`,
        `Buy ${input.ticker} $${upperCallStrike} call for $${boughtCallPremium.toFixed(2)}`,
        `Net credit: $${netCredit.toFixed(2)}`,
        `Profit range: $${upperPutStrike} to $${lowerCallStrike}`
      ]
    });
  }

  return strategies;
};

// Simplified Black-Scholes model for option premium estimation
function estimateOptionPremium(
  stockPrice: number,
  strikePrice: number,
  timeToExpiration: number,
  volatility: number,
  riskFreeRate: number,
  isCall: boolean
): number {
  // This is a simplified version of the Black-Scholes model
  const d1 = (Math.log(stockPrice / strikePrice) + (riskFreeRate + volatility * volatility / 2) * timeToExpiration) / (volatility * Math.sqrt(timeToExpiration));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiration);
  
  if (isCall) {
    return stockPrice * normalCDF(d1) - strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(d2);
  } else {
    return strikePrice * Math.exp(-riskFreeRate * timeToExpiration) * normalCDF(-d2) - stockPrice * normalCDF(-d1);
  }
}

// Cumulative distribution function for a standard normal distribution
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) {
    prob = 1 - prob;
  }
  return prob;
}

// Simplified probability calculation
function calculateProbability(
  currentPrice: number,
  targetPrice: number,
  volatility: number,
  daysToExpiration: number,
  direction: 'above' | 'below',
  strikePrice: number
): number {
  const annualizedTime = daysToExpiration / 365;
  const stdDev = volatility * Math.sqrt(annualizedTime);
  const logReturn = Math.log(strikePrice / currentPrice);
  const z = logReturn / stdDev;
  
  if (direction === 'above') {
    return 1 - normalCDF(z);
  } else {
    return normalCDF(z);
  }
}