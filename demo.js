#!/usr/bin/env node

/**
 * Demo script for portfolio-metrics library
 * Run with: node demo.js
 *
 * This demonstrates all available metrics with sample data.
 */

const {
  calculateCAGR,
  calculateXIRR,
  calculateSharpeRatio,
  calculateMaxDrawdown
} = require('./src/index');

console.log('🚀 Portfolio Metrics Library Demo\n');

// 1. CAGR Example
console.log('📈 CAGR (Compound Annual Growth Rate)');
console.log('Example: Investment grows from $1,000 to $2,000 in 5 years');
try {
  const cagr = calculateCAGR(1000, 2000, new Date('2015-01-01'), new Date('2020-01-01'));
  console.log(`Gross CAGR: ${(cagr * 100).toFixed(2)}%`);

  const netCagr = calculateCAGR(1000, 2000, new Date('2015-01-01'), new Date('2020-01-01'), 0.01);
  console.log(`Net CAGR (1% expense ratio): ${(netCagr * 100).toFixed(2)}%\n`);
} catch (error) {
  console.error('Error:', error.message);
}

// 2. XIRR Example
console.log('💰 XIRR (Extended Internal Rate of Return)');
console.log('Example: Initial investment with additional deposit and final value');
try {
  const cashflows = [
    { date: new Date('2020-01-01'), amount: -1000 },
    { date: new Date('2020-07-01'), amount: -500 },
    { date: new Date('2021-01-01'), amount: 1800 }
  ];
  const xirr = calculateXIRR(cashflows);
  console.log(`XIRR: ${(xirr * 100).toFixed(2)}%\n`);
} catch (error) {
  console.error('Error:', error.message);
}

// 3. Sharpe Ratio Example
console.log('⚖️  Sharpe Ratio (Risk-Adjusted Return)');
console.log('Example: Monthly returns with risk-free rate');
try {
  const returns = [0.01, 0.02, 0.03, 0.01, 0.02];
  const sharpe = calculateSharpeRatio(returns, 0.005);
  console.log(`Sharpe Ratio: ${sharpe.toFixed(2)} (good > 1, poor < 0)`);

  const volatileReturns = [0.05, -0.02, 0.03, 0.01, -0.01];
  const sharpeVolatile = calculateSharpeRatio(volatileReturns, 0.02);
  console.log(`Sharpe Ratio (volatile): ${sharpeVolatile.toFixed(2)}\n`);
} catch (error) {
  console.error('Error:', error.message);
}

// 4. Max Drawdown Example
console.log('📉 Max Drawdown (Downside Risk)');
console.log('Example: Portfolio values over time');
try {
  const values = [1000, 1100, 950, 1200, 900, 1100];
  const mdd = calculateMaxDrawdown(values);
  console.log(`Max Drawdown: ${(mdd * 100).toFixed(2)}% (largest peak-to-trough decline)`);

  const stableValues = [1000, 1050, 1100, 1150, 1200];
  const mddStable = calculateMaxDrawdown(stableValues);
  console.log(`Max Drawdown (stable): ${(mddStable * 100).toFixed(2)}%\n`);
} catch (error) {
  console.error('Error:', error.message);
}

console.log('✅ Demo completed! Check the results above.');
console.log('📚 For more details, see README.md');
console.log('🔗 GitHub: [Add your repo URL here]');
console.log('📦 npm: npm install portfolio-metrics');