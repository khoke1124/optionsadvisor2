import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import StrategyAdvisor from './components/StrategyAdvisor';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <StrategyAdvisor />
      </Layout>
    </ThemeProvider>
  );
}

export default App;