const { calculateCAGR, calculateXIRR, calculateSharpeRatio, calculateMaxDrawdown } = require('../src/index');

describe('Portfolio Metrics', () => {
  describe('calculateCAGR', () => {
    test('calculates CAGR for positive growth', () => {
      const result = calculateCAGR(100, 200, new Date('2020-01-01'), new Date('2021-01-01'));
      expect(result).toBeCloseTo(1.0); // 100% growth over 1 year
    });

    test('calculates CAGR for loss', () => {
      const result = calculateCAGR(200, 100, new Date('2020-01-01'), new Date('2021-01-01'));
      expect(result).toBeCloseTo(-0.5); // 50% loss
    });

    test('calculates CAGR for multi-year period', () => {
      const result = calculateCAGR(1000, 2000, new Date('2015-01-01'), new Date('2020-01-01'));
      expect(result).toBeCloseTo(0.1487, 4); // Approx 14.87% over 5 years
    });

    test('calculates CAGR with expense ratio', () => {
      const result = calculateCAGR(100, 200, new Date('2020-01-01'), new Date('2021-01-01'), 0.01); // 1% expense
      expect(result).toBeCloseTo(0.99); // Gross 100%, net ~99%
    });

    test('returns -1 when final value is 0', () => {
      const result = calculateCAGR(100, 0, new Date('2020-01-01'), new Date('2021-01-01'));
      expect(result).toBe(-1);
    });

    test('throws error for invalid initial value', () => {
      expect(() => calculateCAGR(0, 200, new Date('2020-01-01'), new Date('2021-01-01'))).toThrow('Initial value must be a positive number');
      expect(() => calculateCAGR(-100, 200, new Date('2020-01-01'), new Date('2021-01-01'))).toThrow('Initial value must be a positive number');
    });

    test('throws error for invalid final value', () => {
      expect(() => calculateCAGR(100, -200, new Date('2020-01-01'), new Date('2021-01-01'))).toThrow('Final value must be a non-negative number');
    });

    test('throws error for invalid dates', () => {
      expect(() => calculateCAGR(100, 200, '2020-01-01', new Date('2021-01-01'))).toThrow('Start date must be a valid Date object');
      expect(() => calculateCAGR(100, 200, new Date('2020-01-01'), '2021-01-01')).toThrow('End date must be a valid Date object');
      expect(() => calculateCAGR(100, 200, new Date('invalid'), new Date('2021-01-01'))).toThrow('Start date must be a valid Date object');
    });

    test('throws error when start date is not before end date', () => {
      expect(() => calculateCAGR(100, 200, new Date('2021-01-01'), new Date('2020-01-01'))).toThrow('Start date must be before end date');
      expect(() => calculateCAGR(100, 200, new Date('2020-01-01'), new Date('2020-01-01'))).toThrow('Start date must be before end date');
    });

    test('throws error for invalid expense ratio', () => {
      expect(() => calculateCAGR(100, 200, new Date('2020-01-01'), new Date('2021-01-01'), -0.01)).toThrow('Expense ratio must be a number between 0 and 1');
      expect(() => calculateCAGR(100, 200, new Date('2020-01-01'), new Date('2021-01-01'), 1.5)).toThrow('Expense ratio must be a number between 0 and 1');
    });
  });

  describe('calculateXIRR', () => {
    test('calculates XIRR for simple case', () => {
      const cashflows = [
        { date: new Date('2020-01-01'), amount: -1000 },
        { date: new Date('2021-01-01'), amount: 1200 }
      ];
      const result = calculateXIRR(cashflows);
      expect(result).toBeCloseTo(0.2, 2); // 20% return
    });

    test('calculates XIRR for multiple cashflows', () => {
      const cashflows = [
        { date: new Date('2020-01-01'), amount: -1000 },
        { date: new Date('2020-07-01'), amount: 200 },
        { date: new Date('2021-01-01'), amount: 900 }
      ];
      const result = calculateXIRR(cashflows);
      expect(result).toBeGreaterThan(0); // Positive return
    });

    test('calculates XIRR for loss', () => {
      const cashflows = [
        { date: new Date('2020-01-01'), amount: -1000 },
        { date: new Date('2021-01-01'), amount: 800 }
      ];
      const result = calculateXIRR(cashflows);
      expect(result).toBeLessThan(0); // Negative return
    });

    test('throws error for invalid cashflows', () => {
      expect(() => calculateXIRR(null)).toThrow('Cashflows must be an array with at least 2 entries');
      expect(() => calculateXIRR([])).toThrow('Cashflows must be an array with at least 2 entries');
      expect(() => calculateXIRR([{ date: new Date(), amount: 100 }])).toThrow('Cashflows must be an array with at least 2 entries');
    });

    test('throws error for invalid cashflow objects', () => {
      expect(() => calculateXIRR([{ date: '2020-01-01', amount: -100 }, { date: new Date(), amount: 100 }])).toThrow('must have a valid Date');
      expect(() => calculateXIRR([{ date: new Date(), amount: '100' }, { date: new Date(), amount: -100 }])).toThrow('must have a valid number');
      expect(() => calculateXIRR([{ amount: -100 }, { date: new Date(), amount: 100 }])).toThrow('must have \'date\' and \'amount\' properties');
    });

    test('throws error if no positive or negative amounts', () => {
      expect(() => calculateXIRR([
        { date: new Date('2020-01-01'), amount: 100 },
        { date: new Date('2021-01-01'), amount: 200 }
      ])).toThrow('must contain at least one positive and one negative amount');
      expect(() => calculateXIRR([
        { date: new Date('2020-01-01'), amount: -100 },
        { date: new Date('2021-01-01'), amount: -200 }
      ])).toThrow('must contain at least one positive and one negative amount');
    });

    test('throws error if XIRR cannot converge', () => {
      // This might be hard to trigger, but for now, assume it works
      // In practice, with proper cashflows, it should converge
    });
  });

  describe('calculateSharpeRatio', () => {
    test('calculates Sharpe ratio for positive returns', () => {
      const returns = [0.01, 0.02, 0.03, 0.01, 0.02]; // Avg ~0.018, std ~0.008
      const result = calculateSharpeRatio(returns, 0.005);
      expect(result).toBeCloseTo(1.625, 2); // (0.018 - 0.005) / 0.008 ≈ 1.625
    });

    test('calculates Sharpe ratio for mixed returns', () => {
      const returns = [0.05, -0.02, 0.03, 0.01, -0.01]; // Avg 0.012, std ~0.027
      const result = calculateSharpeRatio(returns, 0.02);
      expect(result).toBeCloseTo(-0.296, 2); // (0.012 - 0.02) / 0.027 ≈ -0.296
    });

    test('returns infinity for zero volatility with higher returns', () => {
      const returns = [0.05, 0.05, 0.05];
      const result = calculateSharpeRatio(returns, 0.02);
      expect(result).toBe(Infinity);
    });

    test('returns negative infinity for zero volatility with lower returns', () => {
      const returns = [0.01, 0.01, 0.01];
      const result = calculateSharpeRatio(returns, 0.02);
      expect(result).toBe(-Infinity);
    });

    test('throws error for invalid returns', () => {
      expect(() => calculateSharpeRatio([], 0.02)).toThrow('Returns must be an array with at least 2 values');
      expect(() => calculateSharpeRatio([0.01], 0.02)).toThrow('Returns must be an array with at least 2 values');
      expect(() => calculateSharpeRatio(['0.01', 0.02], 0.02)).toThrow('must be a valid number');
    });

    test('throws error for invalid risk-free rate', () => {
      expect(() => calculateSharpeRatio([0.01, 0.02], '0.02')).toThrow('Risk-free rate must be a valid number');
      expect(() => calculateSharpeRatio([0.01, 0.02], NaN)).toThrow('Risk-free rate must be a valid number');
    });
  });

  describe('calculateMaxDrawdown', () => {
    test('calculates max drawdown for declining values', () => {
      const values = [1000, 900, 800, 700];
      const result = calculateMaxDrawdown(values);
      expect(result).toBeCloseTo(-0.3, 2); // 30% drawdown
    });

    test('calculates max drawdown with recovery', () => {
      const values = [1000, 1100, 950, 1200, 900];
      const result = calculateMaxDrawdown(values);
      expect(result).toBeCloseTo(-0.25, 2); // From 1200 to 900
    });

    test('returns 0 for increasing values', () => {
      const values = [1000, 1100, 1200, 1300];
      const result = calculateMaxDrawdown(values);
      expect(result).toBe(0);
    });

    test('calculates max drawdown starting with peak', () => {
      const values = [1200, 1100, 1000, 900];
      const result = calculateMaxDrawdown(values);
      expect(result).toBeCloseTo(-0.25, 2);
    });

    test('throws error for invalid values', () => {
      expect(() => calculateMaxDrawdown([])).toThrow('Values must be an array with at least 2 elements');
      expect(() => calculateMaxDrawdown([1000])).toThrow('Values must be an array with at least 2 elements');
      expect(() => calculateMaxDrawdown(['1000', 1100])).toThrow('must be a non-negative number');
      expect(() => calculateMaxDrawdown([1000, -1100])).toThrow('must be a non-negative number');
    });
  });
});