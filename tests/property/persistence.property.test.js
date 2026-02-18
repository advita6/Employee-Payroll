const fc = require('fast-check');
const fs = require('fs').promises;
const path = require('path');
const { readEmployees, writeEmployees } = require('../../modules/fileHandler');

const TEST_FILE = path.join(__dirname, '../../employees.json');

// Arbitrary for generating employee objects
const employeeArbitrary = fc.record({
  id: fc.integer({ min: 1, max: Number.MAX_SAFE_INTEGER }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  department: fc.string({ minLength: 1, maxLength: 100 }),
  basicSalary: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true })
});

describe('FileHandler Property-Based Tests', () => {
  // Clean up test file after each test
  afterEach(async () => {
    try {
      await fs.unlink(TEST_FILE);
    } catch (error) {
      // File might not exist, that's okay
    }
  });

  /**
   * Property 13: File Persistence Round Trip
   * **Validates: Requirements 5.1, 5.2, 5.4**
   * 
   * For any valid array of employee records, writing the array to the data store
   * and then reading it back must produce an equivalent array
   */
  test('Property 13: File persistence round trip preserves data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(employeeArbitrary, { minLength: 0, maxLength: 50 }),
        async (employees) => {
          // Write employees to file
          await writeEmployees(employees);
          
          // Read them back
          const result = await readEmployees();
          
          // Should be equivalent
          expect(result).toEqual(employees);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Empty array handling
   * **Validates: Requirements 5.3, 5.6**
   * 
   * Writing and reading an empty array should work correctly
   */
  test('Property: Empty array round trip', async () => {
    await writeEmployees([]);
    const result = await readEmployees();
    expect(result).toEqual([]);
  });

  /**
   * Additional property: Data integrity with multiple operations
   * **Validates: Requirements 5.4**
   * 
   * Multiple write operations should maintain data integrity
   */
  test('Property: Multiple write operations maintain integrity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.array(employeeArbitrary, { maxLength: 10 }), { minLength: 2, maxLength: 5 }),
        async (employeeArrays) => {
          let lastWritten = [];
          
          // Perform multiple writes
          for (const employees of employeeArrays) {
            await writeEmployees(employees);
            lastWritten = employees;
          }
          
          // Read should return the last written data
          const result = await readEmployees();
          expect(result).toEqual(lastWritten);
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
