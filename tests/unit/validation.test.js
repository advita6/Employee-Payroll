// Unit tests for validation functions
const { validateEmployeeInput } = require('../../server');

describe('validateEmployeeInput', () => {
  describe('name validation', () => {
    test('rejects empty string name', () => {
      const result = validateEmployeeInput('', 'Engineering', 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name is required and cannot be empty');
    });

    test('rejects whitespace-only name', () => {
      const result = validateEmployeeInput('   ', 'Engineering', 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name is required and cannot be empty');
    });

    test('rejects null name', () => {
      const result = validateEmployeeInput(null, 'Engineering', 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name is required and cannot be empty');
    });

    test('rejects undefined name', () => {
      const result = validateEmployeeInput(undefined, 'Engineering', 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name is required and cannot be empty');
    });
  });

  describe('department validation', () => {
    test('rejects empty string department', () => {
      const result = validateEmployeeInput('John Doe', '', 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Department is required and cannot be empty');
    });

    test('rejects whitespace-only department', () => {
      const result = validateEmployeeInput('John Doe', '   ', 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Department is required and cannot be empty');
    });

    test('rejects null department', () => {
      const result = validateEmployeeInput('John Doe', null, 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Department is required and cannot be empty');
    });

    test('rejects undefined department', () => {
      const result = validateEmployeeInput('John Doe', undefined, 5000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Department is required and cannot be empty');
    });
  });

  describe('basicSalary validation', () => {
    test('rejects negative salary', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', -1000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Basic Salary must be a positive number');
    });

    test('rejects zero salary', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', 0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Basic Salary must be a positive number');
    });

    test('rejects non-numeric salary', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', 'abc');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Basic Salary must be a positive number');
    });

    test('rejects null salary', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Basic Salary must be a positive number');
    });

    test('rejects undefined salary', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Basic Salary must be a positive number');
    });

    test('accepts positive numeric salary', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', 5000);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('accepts positive numeric salary as string', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', '5000');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('accepts decimal salary', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', 5000.50);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('multiple validation errors', () => {
    test('returns all errors when multiple fields are invalid', () => {
      const result = validateEmployeeInput('', '', -100);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Name is required and cannot be empty');
      expect(result.errors).toContain('Department is required and cannot be empty');
      expect(result.errors).toContain('Basic Salary must be a positive number');
    });
  });

  describe('valid input', () => {
    test('passes validation with all valid inputs', () => {
      const result = validateEmployeeInput('John Doe', 'Engineering', 5000);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('passes validation with trimmed whitespace', () => {
      const result = validateEmployeeInput('  John Doe  ', '  Engineering  ', 5000);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
