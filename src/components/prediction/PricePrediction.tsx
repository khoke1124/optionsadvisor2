import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface PricePredictionProps {
  currentPrice: number;
  onPredictionChange: (price: number | null) => void;
}

const PricePrediction: React.FC<PricePredictionProps> = ({ 
  currentPrice, 
  onPredictionChange 
}) => {
  const { theme } = useTheme();
  const [predictedPrice, setPredictedPrice] = useState<string>('');
  const [percentChange, setPercentChange] = useState<string>('');
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (predictedPrice) {
      const predicted = parseFloat(predictedPrice);
      if (!isNaN(predicted) && predicted > 0) {
        const percent = ((predicted - currentPrice) / currentPrice) * 100;
        setPercentChange(percent.toFixed(2));
        setDirection(percent >= 0 ? 'up' : 'down');
        onPredictionChange(predicted);
      } else {
        setPercentChange('');
        setDirection(null);
        onPredictionChange(null);
      }
    } else {
      setPercentChange('');
      setDirection(null);
      onPredictionChange(null);
    }
  }, [predictedPrice, currentPrice, onPredictionChange]);

  const handlePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentValue = e.target.value;
    if (percentValue === '') {
      setPercentChange('');
      setPredictedPrice('');
      setDirection(null);
      onPredictionChange(null);
      return;
    }

    const percent = parseFloat(percentValue);
    if (!isNaN(percent)) {
      setPercentChange(percentValue);
      const newPrice = currentPrice * (1 + percent / 100);
      setPredictedPrice(newPrice.toFixed(2));
      setDirection(percent >= 0 ? 'up' : 'down');
      onPredictionChange(newPrice);
    }
  };

  const inputClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Current Price</label>
        <div className={`px-4 py-2 rounded-md border ${inputClass}`}>
          ${currentPrice.toFixed(2)}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="predictedPrice" className="block text-sm font-medium mb-1">
          Predicted Price
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>$</span>
          </div>
          <input
            id="predictedPrice"
            type="number"
            value={predictedPrice}
            onChange={(e) => setPredictedPrice(e.target.value)}
            step="0.01"
            min="0.01"
            placeholder="Enter predicted price"
            className={`pl-7 pr-4 py-2 w-full rounded-md border ${inputClass} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="percentChange" className="block text-sm font-medium mb-1">
          Percentage Change
        </label>
        <div className="relative">
          <input
            id="percentChange"
            type="number"
            value={percentChange}
            onChange={handlePercentChange}
            step="0.01"
            placeholder="Enter % change"
            className={`pl-4 pr-10 py-2 w-full rounded-md border ${inputClass} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>%</span>
          </div>
        </div>
      </div>

      {direction && (
        <div className={`flex items-center mt-4 ${
          direction === 'up' 
            ? 'text-green-500' 
            : 'text-red-500'
        }`}>
          {direction === 'up' ? (
            <TrendingUp className="h-5 w-5 mr-1" />
          ) : (
            <TrendingDown className="h-5 w-5 mr-1" />
          )}
          <span>
            {direction === 'up' ? 'Bullish' : 'Bearish'} prediction: 
            {direction === 'up' ? '+' : ''}{percentChange}%
          </span>
        </div>
      )}
    </div>
  );
};

export default PricePrediction;