import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ExpirationSelectorProps {
  onDateChange: (date: Date | null) => void;
}

const ExpirationSelector: React.FC<ExpirationSelectorProps> = ({ onDateChange }) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('30');

  // Generate future expiration dates (typically every 3rd Friday of the month)
  const getExpirationDates = (): { value: string; label: string }[] => {
    const dates = [];
    const now = new Date();
    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();
    
    // Get next 6 option expiration dates (roughly 3rd Friday of each month)
    for (let i = 0; i < 6; i++) {
      const firstDay = new Date(currentYear, currentMonth, 1);
      let dayOfWeek = firstDay.getDay();
      
      // Calculate the third Friday
      let thirdFriday = 15 + ((5 - dayOfWeek + 7) % 7);
      if (thirdFriday < 15) thirdFriday += 7;
      
      const expirationDate = new Date(currentYear, currentMonth, thirdFriday);
      
      // Only add dates in the future
      if (expirationDate > now) {
        const dateValue = expirationDate.toISOString().split('T')[0];
        const dateLabel = expirationDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        dates.push({ value: dateValue, label: dateLabel });
      }
      
      // Move to next month
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }
    
    return dates;
  };

  const expirationDates = getExpirationDates();

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
    if (e.target.value) {
      onDateChange(new Date(e.target.value));
    } else {
      onDateChange(null);
    }
  };

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const days = parseInt(e.target.value);
    setTimeframe(e.target.value);
    
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      setSelectedDate(date.toISOString().split('T')[0]);
      onDateChange(date);
    }
  };

  const selectClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="timeframe" className="block text-sm font-medium mb-1">
          Time Horizon
        </label>
        <select
          id="timeframe"
          value={timeframe}
          onChange={handleTimeframeChange}
          className={`w-full py-2 px-3 rounded-md border ${selectClass} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        >
          <option value="7">1 Week</option>
          <option value="14">2 Weeks</option>
          <option value="30">1 Month</option>
          <option value="60">2 Months</option>
          <option value="90">3 Months</option>
          <option value="180">6 Months</option>
          <option value="custom">Custom (Option Expiration)</option>
        </select>
      </div>

      {timeframe === 'custom' && (
        <div className="mb-4">
          <label htmlFor="expirationDate" className="block text-sm font-medium mb-1">
            Option Expiration Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <select
              id="expirationDate"
              value={selectedDate}
              onChange={handleDateChange}
              className={`pl-10 pr-4 py-2 w-full rounded-md border ${selectClass} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Select expiration date</option>
              {expirationDates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Selected date: {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Days until expiration: {Math.round((new Date(selectedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpirationSelector;