import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Strategy } from '../../types';

interface StrategyCardProps {
  strategy: Strategy;
  isSelected: boolean;
  onClick: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, isSelected, onClick }) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (isSelected) {
      return theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-50';
    }
    return theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  };

  const getBorderColor = () => {
    if (isSelected) {
      return theme === 'dark' ? 'border-blue-500' : 'border-blue-500';
    }
    return theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  };

  return (
    <div 
      className={`rounded-lg border ${getBorderColor()} ${getBackgroundColor()} transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{strategy.name}</h3>
          <span 
            className={`text-xs px-2 py-1 rounded-full ${
              strategy.risk === 'Low' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : strategy.risk === 'Medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {strategy.risk} Risk
          </span>
        </div>
        
        <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {strategy.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {strategy.tags.map((tag, index) => (
            <span 
              key={index}
              className={`text-xs px-2 py-0.5 rounded-full ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Profit Probability: 
              <span className={`ml-1 ${
                strategy.profitProbability > 70
                  ? 'text-green-500'
                  : strategy.profitProbability > 50
                  ? 'text-yellow-500'
                  : 'text-red-500'
              }`}>
                {strategy.profitProbability}%
              </span>
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Max Profit: {strategy.maxProfit}
            </div>
          </div>
          
          <div className="text-blue-600 dark:text-blue-400 flex items-center">
            <span className="text-sm">Details</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyCard;