// Unit tests for payroll calculation functions
const {
  generateEmployeeId,
  calculateTax,
  calculateNetSalary,
  enrichEmployeeWithPayroll
} = require('../../server');

describe('Payroll Calculation Functions', () => {
  describe('generateEmployeeId', () => {
    test('generates a numeric ID', () => {
      const id = generateEmployeeId();
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    test('generates unique IDs when called with delay', async () => {
      const id1 = generateEmployeeId();
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));
      const id2 = generateEmployeeId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('calculateTax', () => {
    test('calculates 12% tax for salary of 5000', () => {
      expect(calculateTax(5000)).toBe(600);
    });

    test('calculates 12% tax for salary of 4500', () => {
      expect(calculateTax(4500)).toBe(540);
    });

    test('handles decimal salaries correctly', () => {
      expect(calculateTax(5000.50)).toBeCloseTo(600.06, 2);
    });

    test('returns 0 for salary of 0', () => {
      expect(calculateTax(0)).toBe(0);
    });
  });

  describe('calculateNetSalary', () => {
    test('calculates net salary correctly', () => {
      expect(calculateNetSalary(5000, 600)).toBe(4400);
    });

    test('calculates net salary for 4500 basic and 540 tax', () => {
      expect(calculateNetSalary(4500, 540)).toBe(3960);
    });

    test('handles decimal values correctly', () => {
      expect(calculateNetSalary(5000.50, 600.06)).toBeCloseTo(4400.44, 2);
    });
  });

  describe('enrichEmployeeWithPayroll', () => {
    test('adds tax and netSalary fields to employee', () => {
      const employee = {
        id: 1234567890,
        name: 'John Doe',
        department: 'Engineering',
        basicSalary: 5000
      };

      const enriched = enrichEmployeeWithPayroll(employee);

      expect(enriched).toHaveProperty('tax');
      expect(enriched).toHaveProperty('netSalary');
      expect(enriched.tax).toBe(600);
      expect(enriched.netSalary).toBe(4400);
    });

    test('preserves original employee fields', () => {
      const employee = {
        id: 1234567890,
        name: 'Jane Smith',
        department: 'Marketing',
        basicSalary: 4500
      };

      const enriched = enrichEmployeeWithPayroll(employee);

      expect(enriched.id).toBe(employee.id);
      expect(enriched.name).toBe(employee.name);
      expect(enriched.department).toBe(employee.department);
      expect(enriched.basicSalary).toBe(employee.basicSalary);
    });

    test('calculates payroll correctly for various salaries', () => {
      const testCases = [
        { salary: 3000, expectedTax: 360, expectedNet: 2640 },
        { salary: 7500, expectedTax: 900, expectedNet: 6600 },
        { salary: 10000, expectedTax: 1200, expectedNet: 8800 }
      ];

      testCases.forEach(({ salary, expectedTax, expectedNet }) => {
        const employee = {
          id: Date.now(),
          name: 'Test Employee',
          department: 'Test',
          basicSalary: salary
        };

        const enriched = enrichEmployeeWithPayroll(employee);
        expect(enriched.tax).toBe(expectedTax);
        expect(enriched.netSalary).toBe(expectedNet);
      });
    });
  });
});
