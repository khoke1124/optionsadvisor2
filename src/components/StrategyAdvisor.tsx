import React, { useState } from 'react';
import TickerSearch from './ticker/TickerSearch';
import PricePrediction from './prediction/PricePrediction';
import ExpirationSelector from './prediction/ExpirationSelector';
import StrategyList from './strategies/StrategyList';
import { useTheme } from '../context/ThemeContext';
import { Strategy } from '../types';
import { calculateStrategies } from '../utils/strategyCalculator';

const StrategyAdvisor: React.FC = () => {
  const { theme } = useTheme();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  const handleTickerSelect = (ticker: string, price: number) => {
    setSelectedTicker(ticker);
    setCurrentPrice(price);
  };

  const handlePredictionSubmit = () => {
    if (selectedTicker && currentPrice && predictedPrice && expirationDate) {
      const calculatedStrategies = calculateStrategies({
        ticker: selectedTicker,
        currentPrice,
        predictedPrice,
        expirationDate
      });
      setStrategies(calculatedStrategies);
    }
  };

  const cardClass = theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className="space-y-6">
      <section className={`p-6 rounded-lg shadow-md border ${cardClass}`}>
        <h2 className="text-xl font-semibold mb-4">Select Stock</h2>
        <TickerSearch onSelect={handleTickerSelect} />
      </section>

      {selectedTicker && currentPrice && (
        <>
          <section className={`p-6 rounded-lg shadow-md border ${cardClass}`}>
            <h2 className="text-xl font-semibold mb-4">Predict Future Price</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <PricePrediction 
                currentPrice={currentPrice} 
                onPredictionChange={setPredictedPrice} 
              />
              <ExpirationSelector onDateChange={setExpirationDate} />
            </div>
            <div className="mt-6">
              <button
                onClick={handlePredictionSubmit}
                disabled={!predictedPrice || !expirationDate}
                className={`px-4 py-2 rounded-md ${
                  !predictedPrice || !expirationDate
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Get Strategy Recommendations
              </button>
            </div>
          </section>

          {strategies.length > 0 && (
            <section className={`p-6 rounded-lg shadow-md border ${cardClass}`}>
              <h2 className="text-xl font-semibold mb-4">Recommended Strategies</h2>
              <StrategyList 
                strategies={strategies} 
                currentPrice={currentPrice}
                predictedPrice={predictedPrice}
                expirationDate={expirationDate}
              />
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default StrategyAdvisor;