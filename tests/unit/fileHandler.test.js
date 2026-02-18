const fs = require('fs').promises;
const path = require('path');
const { readEmployees, writeEmployees } = require('../../modules/fileHandler');

const TEST_FILE = path.join(__dirname, '../../employees.json');

describe('FileHandler Module', () => {
  // Clean up test file after each test
  afterEach(async () => {
    try {
      await fs.unlink(TEST_FILE);
    } catch (error) {
      // File might not exist, that's okay
    }
  });

  describe('readEmployees', () => {
    test('returns empty array when file does not exist', async () => {
      const result = await readEmployees();
      expect(result).toEqual([]);
    });

    test('returns parsed employee data when file exists', async () => {
      const testData = [
        { id: 1, name: 'John Doe', department: 'Engineering', basicSalary: 5000 },
        { id: 2, name: 'Jane Smith', department: 'Marketing', basicSalary: 4500 }
      ];
      await fs.writeFile(TEST_FILE, JSON.stringify(testData));

      const result = await readEmployees();
      expect(result).toEqual(testData);
    });

    test('returns empty array when JSON is corrupted', async () => {
      await fs.writeFile(TEST_FILE, 'invalid json {{{');

      const result = await readEmployees();
      expect(result).toEqual([]);
    });

    test('returns empty array for empty JSON file', async () => {
      await fs.writeFile(TEST_FILE, '');

      const result = await readEmployees();
      expect(result).toEqual([]);
    });
  });

  describe('writeEmployees', () => {
    test('creates file with correct JSON format', async () => {
      const testData = [
        { id: 1, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ];

      await writeEmployees(testData);

      const fileContent = await fs.readFile(TEST_FILE, 'utf8');
      const parsed = JSON.parse(fileContent);
      expect(parsed).toEqual(testData);
    });

    test('formats JSON with 2-space indentation', async () => {
      const testData = [
        { id: 1, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ];

      await writeEmployees(testData);

      const fileContent = await fs.readFile(TEST_FILE, 'utf8');
      const expected = JSON.stringify(testData, null, 2);
      expect(fileContent).toBe(expected);
    });

    test('overwrites existing file completely', async () => {
      const initialData = [
        { id: 1, name: 'John Doe', department: 'Engineering', basicSalary: 5000 },
        { id: 2, name: 'Jane Smith', department: 'Marketing', basicSalary: 4500 }
      ];
      await writeEmployees(initialData);

      const newData = [
        { id: 3, name: 'Bob Johnson', department: 'Sales', basicSalary: 4000 }
      ];
      await writeEmployees(newData);

      const result = await readEmployees();
      expect(result).toEqual(newData);
      expect(result).toHaveLength(1);
    });

    test('writes empty array successfully', async () => {
      await writeEmployees([]);

      const result = await readEmployees();
      expect(result).toEqual([]);
    });
  });
});
