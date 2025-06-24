import React, { useState } from 'react';
import StrategyCard from './StrategyCard';
import StrategyDetails from './StrategyDetails';
import { Strategy } from '../../types';

interface StrategyListProps {
  strategies: Strategy[];
  currentPrice: number;
  predictedPrice: number;
  expirationDate: Date;
}

const StrategyList: React.FC<StrategyListProps> = ({ 
  strategies, 
  currentPrice,
  predictedPrice,
  expirationDate 
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  if (strategies.length === 0) {
    return <div>No strategies found based on your criteria.</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            isSelected={selectedStrategy?.id === strategy.id}
            onClick={() => setSelectedStrategy(strategy)}
          />
        ))}
      </div>

      {selectedStrategy && (
        <StrategyDetails 
          strategy={selectedStrategy} 
          currentPrice={currentPrice}
          predictedPrice={predictedPrice}
          expirationDate={expirationDate}
        />
      )}
    </div>
  );
};

export default StrategyList;