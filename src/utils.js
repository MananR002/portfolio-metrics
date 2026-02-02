/**
 * Utility functions for portfolio metrics calculations
 */

/**
 * Validates that a value is a valid Date object
 * @param {any} date - The value to check
 * @param {string} label - Label for error message
 * @throws {Error} If invalid
 */
function validateDate(date, label) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error(`${label} must be a valid Date object`);
  }
}

/**
 * Validates that a value is a positive number
 * @param {any} value - The value to check
 * @param {string} label - Label for error message
 * @throws {Error} If invalid
 */
function validatePositiveNumber(value, label) {
  if (typeof value !== 'number' || value <= 0) {
    throw new Error(`${label} must be a positive number`);
  }
}

/**
 * Validates that a value is a non-negative number
 * @param {any} value - The value to check
 * @param {string} label - Label for error message
 * @throws {Error} If invalid
 */
function validateNonNegativeNumber(value, label) {
  if (typeof value !== 'number' || value < 0) {
    throw new Error(`${label} must be a non-negative number`);
  }
}

/**
 * Validates expense ratio
 * @param {any} expenseRatio - The value to check
 * @throws {Error} If invalid
 */
function validateExpenseRatio(expenseRatio) {
  if (typeof expenseRatio !== 'number' || expenseRatio < 0 || expenseRatio >= 1) {
    throw new Error('Expense ratio must be a number between 0 and 1 (e.g., 0.01 for 1%)');
  }
}

/**
 * Calculates the number of years between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of years
 */
function calculateYears(startDate, endDate) {
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  return (endDate - startDate) / msPerYear;
}

/**
 * Calculates the Net Present Value for XIRR
 * @param {number} r - Rate
 * @param {Array} cashflows - Sorted cashflows
 * @param {Date} refDate - Reference date
 * @returns {number} NPV
 */
function npv(r, cashflows, refDate) {
  let sum = 0;
  for (const cf of cashflows) {
    const t = (cf.date - refDate) / (365.25 * 24 * 60 * 60 * 1000);
    sum += cf.amount / Math.pow(1 + r, t);
  }
  return sum;
}

/**
 * Calculates the mean of an array of numbers
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} Mean
 */
function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculates the standard deviation of an array of numbers
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} Standard deviation
 */
function stdDev(arr) {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

module.exports = {
  validateDate,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateExpenseRatio,
  calculateYears,
  npv,
  mean,
  stdDev
};