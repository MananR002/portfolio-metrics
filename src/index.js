const {
  validateDate,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateExpenseRatio,
  calculateYears,
  npv,
  mean,
  stdDev
} = require('./utils');

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * @param {number} initialValue - Initial investment value (must be > 0)
 * @param {number} finalValue - Final investment value (must be >= 0)
 * @param {Date} startDate - Start date of the investment period
 * @param {Date} endDate - End date of the investment period (must be after startDate)
 * @param {number} [expenseRatio] - Optional annual expense ratio as decimal (e.g., 0.01 for 1%)
 * @returns {number} CAGR as a decimal (e.g., 0.10 for 10%)
 * @throws {Error} If inputs are invalid
 */
function calculateCAGR(initialValue, finalValue, startDate, endDate, expenseRatio) {
  // Input validations
  validatePositiveNumber(initialValue, 'Initial value');
  validateNonNegativeNumber(finalValue, 'Final value');
  validateDate(startDate, 'Start date');
  validateDate(endDate, 'End date');
  if (startDate >= endDate) {
    throw new Error('Start date must be before end date');
  }
  if (expenseRatio !== undefined) {
    validateExpenseRatio(expenseRatio);
  }

  // Calculate number of years
  const years = calculateYears(startDate, endDate);

  // Handle edge case where final value is 0
  if (finalValue === 0) {
    return -1; // 100% loss
  }

  // Calculate CAGR
  let cagr = Math.pow(finalValue / initialValue, 1 / years) - 1;

  // Adjust for expense ratio if provided
  if (expenseRatio !== undefined) {
    cagr = (1 + cagr) * (1 - expenseRatio) - 1;
  }

  return cagr;
}

/**
 * Calculate Extended Internal Rate of Return (XIRR)
 * @param {Array<{date: Date, amount: number}>} cashflows - Array of cashflow objects with date and amount
 * @returns {number} XIRR as a decimal (e.g., 0.10 for 10%)
 * @throws {Error} If inputs are invalid or XIRR cannot be calculated
 */
function calculateXIRR(cashflows) {
  // Input validations
  if (!Array.isArray(cashflows) || cashflows.length < 2) {
    throw new Error('Cashflows must be an array with at least 2 entries');
  }

  const validCashflows = [];
  let hasPositive = false;
  let hasNegative = false;

  for (let i = 0; i < cashflows.length; i++) {
    const cf = cashflows[i];
    if (!cf || typeof cf !== 'object' || !cf.date || !cf.amount) {
      throw new Error(`Cashflow at index ${i} must have 'date' and 'amount' properties`);
    }
    if (!(cf.date instanceof Date) || isNaN(cf.date.getTime())) {
      throw new Error(`Cashflow at index ${i} must have a valid Date for 'date'`);
    }
    if (typeof cf.amount !== 'number' || isNaN(cf.amount)) {
      throw new Error(`Cashflow at index ${i} must have a valid number for 'amount'`);
    }
    validCashflows.push({ date: cf.date, amount: cf.amount });
    if (cf.amount > 0) hasPositive = true;
    if (cf.amount < 0) hasNegative = true;
  }

  if (!hasPositive || !hasNegative) {
    throw new Error('Cashflows must contain at least one positive and one negative amount');
  }

  // Sort cashflows by date
  validCashflows.sort((a, b) => a.date - b.date);

  // Reference date is the earliest date
  const refDate = validCashflows[0].date;

  // Bisection method to find IRR
  let low = -0.999;
  let high = 100000.0; // Increased for extreme returns
  const tolerance = 1e-6;
  const maxIterations = 100;

  // Check if solution exists in range
  const npvLow = npv(low, validCashflows, refDate);
  const npvHigh = npv(high, validCashflows, refDate);
  if (npvLow * npvHigh > 0) {
    throw new Error('Cannot calculate XIRR: No solution found in the search range');
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    const mid = (low + high) / 2;
    const midNpv = npv(mid, validCashflows, refDate);

    if (Math.abs(midNpv) < tolerance) {
      return mid;
    }

    // Adjust bounds based on NPV sign
    if (midNpv > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Check final result
  const finalR = (low + high) / 2;
  if (Math.abs(npv(finalR, validCashflows, refDate)) > 1e-4) {
    throw new Error('Cannot calculate XIRR: NPV does not converge to zero');
  }

  return finalR;
}

/**
 * Calculate Sharpe Ratio (risk-adjusted return)
 * @param {Array<number>} returns - Array of periodic returns as decimals (e.g., [0.01, 0.02])
 * @param {number} riskFreeRate - Risk-free rate as decimal (e.g., 0.02 for 2%)
 * @returns {number} Sharpe Ratio
 * @throws {Error} If inputs are invalid
 */
function calculateSharpeRatio(returns, riskFreeRate) {
  // Input validations
  if (!Array.isArray(returns) || returns.length < 2) {
    throw new Error('Returns must be an array with at least 2 values');
  }
  for (let i = 0; i < returns.length; i++) {
    if (typeof returns[i] !== 'number' || isNaN(returns[i])) {
      throw new Error(`Return at index ${i} must be a valid number`);
    }
  }
  if (typeof riskFreeRate !== 'number' || isNaN(riskFreeRate)) {
    throw new Error('Risk-free rate must be a valid number');
  }

  // Calculate Sharpe Ratio
  const avgReturn = mean(returns);
  const volatility = stdDev(returns);

  if (volatility < 1e-10) {
    return avgReturn > riskFreeRate ? Infinity : (avgReturn < riskFreeRate ? -Infinity : 0);
  }

  return (avgReturn - riskFreeRate) / volatility;
}

/**
 * Calculate Maximum Drawdown (maximum peak-to-trough decline)
 * @param {Array<number>} values - Array of portfolio values over time (e.g., [1000, 1100, 950])
 * @returns {number} Max Drawdown as a decimal (e.g., -0.25 for 25% drawdown)
 * @throws {Error} If inputs are invalid
 */
function calculateMaxDrawdown(values) {
  // Input validations
  if (!Array.isArray(values) || values.length < 2) {
    throw new Error('Values must be an array with at least 2 elements');
  }
  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] !== 'number' || isNaN(values[i]) || values[i] < 0) {
      throw new Error(`Value at index ${i} must be a non-negative number`);
    }
  }

  // Calculate Max Drawdown
  let maxSoFar = values[0];
  let maxDrawdown = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] > maxSoFar) {
      maxSoFar = values[i];
    } else {
      const drawdown = (values[i] - maxSoFar) / maxSoFar;
      if (drawdown < maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  return maxDrawdown;
}

module.exports = {
  calculateCAGR,
  calculateXIRR,
  calculateSharpeRatio,
  calculateMaxDrawdown
};