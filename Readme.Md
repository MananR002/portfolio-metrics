# Portfolio Metrics

A lightweight Node.js library for calculating key portfolio performance metrics. Evaluate returns, risk, and downside potential to make informed investment decisions.

## Features

- **CAGR**: Annualized growth rate for simple investments
- **XIRR**: Internal rate of return for irregular cashflows
- **Sharpe Ratio**: Risk-adjusted return measure
- **Max Drawdown**: Maximum loss from peak to trough

## Installation

```bash
npm install portfolio-metrics
```

## Metrics Guide

### CAGR (Compound Annual Growth Rate)
**What it measures**: The steady annual growth rate that would turn your initial investment into the final amount over the holding period.

**When to use**: For lump-sum investments or comparing annualized returns across different time periods.

**Formula**: `((finalValue / initialValue)^(1 / years)) - 1`

**Example**:
```javascript
const { calculateCAGR } = require('portfolio-metrics');

// Investment grows from $1,000 to $2,000 in 5 years
const cagr = calculateCAGR(1000, 2000, new Date('2015-01-01'), new Date('2020-01-01'));
// Result: 0.1487 (14.87% annual growth)

// With 1% annual expense ratio
const netCagr = calculateCAGR(1000, 2000, new Date('2015-01-01'), new Date('2020-01-01'), 0.01);
// Result: 0.1388 (13.88% net growth)
```
**Notes**: Assumes no intermediate cashflows. Expense ratio adjusts for fees.

### XIRR (Extended Internal Rate of Return)
**What it measures**: The annualized rate that makes the net present value of all cashflows equal to zero.

**When to use**: For investments with multiple deposits/withdrawals at irregular intervals (e.g., mutual funds with SIPs).

**Formula**: Solves for r in: `Σ(amount / (1+r)^t) = 0` where t is years from first cashflow.

**Example**:
```javascript
const { calculateXIRR } = require('portfolio-metrics');

// Initial investment + annual contributions + final value
const cashflows = [
  { date: new Date('2020-01-01'), amount: -1000 }, // Investment
  { date: new Date('2020-07-01'), amount: -500 },  // Additional deposit
  { date: new Date('2021-01-01'), amount: 1800 }   // Sale proceeds
];
const xirr = calculateXIRR(cashflows);
// Result: 0.251 (25.1% annual return)
```
**Notes**: Requires at least one positive and one negative cashflow. Dates must be chronological.

### Sharpe Ratio
**What it measures**: Risk-adjusted return, showing excess return per unit of volatility.

**When to use**: Comparing portfolios with different risk levels. Higher ratio = better risk-adjusted performance.

**Formula**: `(average_return - risk_free_rate) / volatility`

**Example**:
```javascript
const { calculateSharpeRatio } = require('portfolio-metrics');

// Monthly returns: [1%, 2%, 3%, 1%, 2%]
// Risk-free rate: 0.5% per month
const returns = [0.01, 0.02, 0.03, 0.01, 0.02];
const sharpe = calculateSharpeRatio(returns, 0.005);
// Result: 1.55 (good risk-adjusted return)

// Volatile returns: [5%, -2%, 3%, 1%, -1%]
const volatileReturns = [0.05, -0.02, 0.03, 0.01, -0.01];
const sharpeVolatile = calculateSharpeRatio(volatileReturns, 0.02);
// Result: -0.28 (poor risk-adjusted return due to volatility)
```
**Notes**: Requires at least 2 returns. Handles zero volatility (returns Infinity/-Infinity/0).

### Max Drawdown
**What it measures**: The largest percentage decline from a peak value, indicating downside risk.

**When to use**: Assessing potential losses and recovery time. Lower (more negative) values = higher risk.

**Formula**: `min((current - peak) / peak)` over the period.

**Example**:
```javascript
const { calculateMaxDrawdown } = require('portfolio-metrics');

// Portfolio values over time
const values = [1000, 1100, 950, 1200, 900, 1100];
// Peaks: 1000 → 1100 → 1200
// Drawdowns: (950-1100)/1100 = -13.6%, (900-1200)/1200 = -25%
const mdd = calculateMaxDrawdown(values);
// Result: -0.25 (25% maximum loss from peak)

// Stable growth
const stableValues = [1000, 1050, 1100, 1150, 1200];
const mddStable = calculateMaxDrawdown(stableValues);
// Result: 0 (no drawdowns)
```
**Notes**: Values should be in chronological order. Returns 0 for consistently increasing portfolios.

## API Reference

### calculateCAGR(initialValue, finalValue, startDate, endDate, [expenseRatio])
- **initialValue**: `number` - Starting investment amount (> 0)
- **finalValue**: `number` - Ending investment amount (≥ 0)
- **startDate**: `Date` - Investment start date
- **endDate**: `Date` - Investment end date
- **expenseRatio**: `number` (optional) - Annual fee as decimal (0-1)
- **Returns**: `number` - CAGR as decimal
- **Throws**: Error for invalid inputs

### calculateXIRR(cashflows)
- **cashflows**: `Array<{date: Date, amount: number}>` - Cashflow array (≥2 items)
- **Returns**: `number` - XIRR as decimal
- **Throws**: Error for invalid cashflows or non-convergence

### calculateSharpeRatio(returns, riskFreeRate)
- **returns**: `Array<number>` - Periodic returns as decimals (≥2 items)
- **riskFreeRate**: `number` - Risk-free rate as decimal
- **Returns**: `number` - Sharpe ratio
- **Throws**: Error for invalid inputs

### calculateMaxDrawdown(values)
- **values**: `Array<number>` - Portfolio values over time (≥2 items, all ≥0)
- **Returns**: `number` - Max drawdown as decimal (≤0)
- **Throws**: Error for invalid values

## Development

### Running Tests
```bash
npm test
```

### Project Structure
- `src/index.js` - Main functions
- `src/utils.js` - Helper utilities
- `test/` - Comprehensive test suite

## Contributing
Contributions welcome! Please include tests for new features.

## License
MIT
