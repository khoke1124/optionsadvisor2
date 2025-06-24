import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { mockTickerSearch } from '../../utils/mockData';

interface Ticker {
  symbol: string;
  name: string;
  price: number;
}

interface TickerSearchProps {
  onSelect: (ticker: string, price: number) => void;
}

const TickerSearch: React.FC<TickerSearchProps> = ({ onSelect }) => {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Ticker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTickers = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        const data = await mockTickerSearch(query);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (error) {
        console.error('Error searching tickers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchTickers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (ticker: Ticker) => {
    onSelect(ticker.symbol, ticker.price);
    setQuery(ticker.symbol);
    setIsOpen(false);
  };

  const inputClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  const dropdownClass = theme === 'dark'
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a stock ticker (e.g., AAPL, MSFT)"
          className={`pl-10 pr-4 py-2 w-full rounded-md border ${inputClass} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-5 w-5 border-2 rounded-full border-t-transparent border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg border ${dropdownClass} overflow-hidden`}>
          <ul className="max-h-60 overflow-y-auto py-1">
            {results.map((ticker) => (
              <li 
                key={ticker.symbol}
                onClick={() => handleSelect(ticker)}
                className={`px-4 py-2 cursor-pointer flex justify-between items-center ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <div>
                  <span className="font-medium">{ticker.symbol}</span>
                  <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {ticker.name}
                  </span>
                </div>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                  ${ticker.price.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TickerSearch;