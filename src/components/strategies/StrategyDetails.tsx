import React, { useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Strategy } from '../../types';
import { formatMoney, formatDate } from '../../utils/formatters';

interface StrategyDetailsProps {
  strategy: Strategy;
  currentPrice: number;
  predictedPrice: number;
  expirationDate: Date;
}

const StrategyDetails: React.FC<StrategyDetailsProps> = ({ 
  strategy, 
  currentPrice,
  predictedPrice,
  expirationDate
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Define price range
    const minPrice = currentPrice * 0.7;
    const maxPrice = currentPrice * 1.3;
    const step = (maxPrice - minPrice) / 100;

    // Calculate profits at different price points
    const points = [];
    for (let price = minPrice; price <= maxPrice; price += step) {
      const profit = calculateProfit(strategy, price);
      points.push({ price, profit });
    }

    // Find max profit/loss for scaling
    const maxProfit = Math.max(...points.map(p => p.profit), 0);
    const maxLoss = Math.min(...points.map(p => p.profit), 0);
    const range = Math.max(maxProfit, Math.abs(maxLoss));

    // Setup drawing
    const xScale = canvas.width / (maxPrice - minPrice);
    const yMid = canvas.height / 2;
    const yScale = (yMid * 0.9) / range;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = theme === 'dark' ? '#4B5563' : '#D1D5DB';
    ctx.lineWidth = 1;
    
    // X axis
    ctx.moveTo(0, yMid);
    ctx.lineTo(canvas.width, yMid);
    
    // Y axis
    const xZero = (currentPrice - minPrice) * xScale;
    ctx.moveTo(xZero, 0);
    ctx.lineTo(xZero, canvas.height);
    ctx.stroke();

    // Draw break-even lines
    strategy.breakEvenPoints.forEach(point => {
      const x = (point - minPrice) * xScale;
      ctx.beginPath();
      ctx.strokeStyle = theme === 'dark' ? '#9CA3AF' : '#9CA3AF';
      ctx.setLineDash([5, 3]);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw current price line
    const currentX = (currentPrice - minPrice) * xScale;
    ctx.beginPath();
    ctx.strokeStyle = theme === 'dark' ? '#60A5FA' : '#3B82F6';
    ctx.lineWidth = 2;
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, canvas.height);
    ctx.stroke();

    // Draw predicted price line
    const predictedX = (predictedPrice - minPrice) * xScale;
    ctx.beginPath();
    ctx.strokeStyle = theme === 'dark' ? '#34D399' : '#10B981';
    ctx.lineWidth = 2;
    ctx.moveTo(predictedX, 0);
    ctx.lineTo(predictedX, canvas.height);
    ctx.stroke();

    // Draw profit/loss curve
    ctx.beginPath();
    ctx.strokeStyle = theme === 'dark' ? '#F59E0B' : '#D97706';
    ctx.lineWidth = 3;
    
    let isFirstPoint = true;
    for (const { price, profit } of points) {
      const x = (price - minPrice) * xScale;
      const y = yMid - (profit * yScale);
      
      if (isFirstPoint) {
        ctx.moveTo(x, y);
        isFirstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(canvas.width, yMid);
    ctx.lineTo(0, yMid);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (theme === 'dark') {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
    } else {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
    }
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw price labels
    ctx.fillStyle = theme === 'dark' ? '#E5E7EB' : '#111827';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // Current price label
    ctx.fillText(`Current: $${currentPrice.toFixed(2)}`, currentX, canvas.height - 5);
    
    // Predicted price label
    ctx.fillText(`Target: $${predictedPrice.toFixed(2)}`, predictedX, 15);
    
    // Break-even labels
    strategy.breakEvenPoints.forEach(point => {
      const x = (point - minPrice) * xScale;
      ctx.fillText(`B/E: $${point.toFixed(2)}`, x, yMid - 10);
    });

  }, [strategy, currentPrice, predictedPrice, theme]);

  // Mock function to calculate profit at different stock prices
  const calculateProfit = (strategy: Strategy, stockPrice: number): number => {
    // This is a simplified calculation - in a real app, this would use option pricing models
    switch (strategy.type) {
      case 'Long Call':
        return Math.max(0, stockPrice - strategy.strikes[0]) * 100 - strategy.cost;
      case 'Long Put':
        return Math.max(0, strategy.strikes[0] - stockPrice) * 100 - strategy.cost;
      case 'Bull Call Spread':
        return Math.min(
          (strategy.strikes[1] - strategy.strikes[0]) * 100, 
          Math.max(0, stockPrice - strategy.strikes[0]) * 100
        ) - strategy.cost;
      case 'Bear Put Spread':
        return Math.min(
          (strategy.strikes[0] - strategy.strikes[1]) * 100,
          Math.max(0, strategy.strikes[0] - stockPrice) * 100
        ) - strategy.cost;
      case 'Iron Condor':
        if (stockPrice <= strategy.strikes[0]) {
          return (strategy.strikes[0] - strategy.strikes[1]) * 100 - strategy.cost;
        } else if (stockPrice >= strategy.strikes[3]) {
          return (strategy.strikes[2] - strategy.strikes[3]) * 100 - strategy.cost;
        } else if (stockPrice > strategy.strikes[1] && stockPrice < strategy.strikes[2]) {
          return -strategy.cost;
        } else if (stockPrice > strategy.strikes[0] && stockPrice <= strategy.strikes[1]) {
          return ((strategy.strikes[1] - stockPrice) / (strategy.strikes[1] - strategy.strikes[0])) * 
                 (strategy.strikes[0] - strategy.strikes[1]) * 100 - strategy.cost;
        } else {
          return ((stockPrice - strategy.strikes[2]) / (strategy.strikes[3] - strategy.strikes[2])) * 
                 (strategy.strikes[2] - strategy.strikes[3]) * 100 - strategy.cost;
        }
      default:
        return 0;
    }
  };

  const cardClass = theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`mt-6 border ${cardClass} rounded-lg shadow-md`}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{strategy.name}</h3>
        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {strategy.details}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-3">Strategy Details</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Max Profit:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{strategy.maxProfit}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Max Loss:</span>
                <span className="font-medium text-red-600 dark:text-red-400">{strategy.maxLoss}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Break-even:</span>
                <span className="font-medium">
                  {strategy.breakEvenPoints.map(point => `$${point.toFixed(2)}`).join(', ')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Probability of Profit:</span>
                <span className={`font-medium ${
                  strategy.profitProbability > 70
                    ? 'text-green-600 dark:text-green-400'
                    : strategy.profitProbability > 50
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {strategy.profitProbability}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Cost to Open:</span>
                <span className="font-medium">{formatMoney(strategy.cost)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Expiration:</span>
                <span className="font-medium">{formatDate(expirationDate)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Strategy Type:</span>
                <span className="font-medium">{strategy.type}</span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-md ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="flex items-start">
                <Info className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className="text-sm">
                  <p className="font-medium">Implementation:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {strategy.implementation.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium mb-3">Profit/Loss at Expiration</h4>
            <div className="h-[300px] w-full">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full"
              ></canvas>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Stock Price Range
              </span>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span>Target</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                  <span>P/L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyDetails;