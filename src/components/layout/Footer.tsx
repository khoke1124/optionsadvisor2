import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <footer className={`py-4 px-6 ${
      theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
    }`}>
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} OptionsAdvisor. Disclaimer: This is for educational purposes only. Not financial advice.</p>
      </div>
    </footer>
  );
};

export default Footer;