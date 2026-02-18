// Unit tests for route handlers
const request = require('supertest');
const { app } = require('../../server');
const FileHandler = require('../../modules/fileHandler');

// Mock the FileHandler module
jest.mock('../../modules/fileHandler');

describe('POST /edit/:id route', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('with valid input', () => {
    test('updates employee and redirects to dashboard', async () => {
      // Setup: Mock existing employees
      const mockEmployees = [
        { id: 1234567890, name: 'John Doe', department: 'Engineering', basicSalary: 5000 },
        { id: 1234567891, name: 'Jane Smith', department: 'Marketing', basicSalary: 4500 }
      ];
      
      FileHandler.readEmployees.mockResolvedValue(mockEmployees);
      FileHandler.writeEmployees.mockResolvedValue();

      // Execute: Submit edit form with valid data
      const response = await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: 'John Updated',
          department: 'Sales',
          basicSalary: '5500'
        });

      // Verify: Should redirect to dashboard
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');

      // Verify: Should have called writeEmployees with updated data
      expect(FileHandler.writeEmployees).toHaveBeenCalledTimes(1);
      const updatedEmployees = FileHandler.writeEmployees.mock.calls[0][0];
      
      // Check that the employee was updated
      const updatedEmployee = updatedEmployees.find(e => e.id === 1234567890);
      expect(updatedEmployee).toEqual({
        id: 1234567890,
        name: 'John Updated',
        department: 'Sales',
        basicSalary: 5500
      });

      // Check that other employees were not modified
      const otherEmployee = updatedEmployees.find(e => e.id === 1234567891);
      expect(otherEmployee).toEqual(mockEmployees[1]);
    });

    test('trims whitespace from name and department', async () => {
      const mockEmployees = [
        { id: 1234567890, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ];
      
      FileHandler.readEmployees.mockResolvedValue(mockEmployees);
      FileHandler.writeEmployees.mockResolvedValue();

      await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: '  John Updated  ',
          department: '  Sales  ',
          basicSalary: '5500'
        });

      const updatedEmployees = FileHandler.writeEmployees.mock.calls[0][0];
      const updatedEmployee = updatedEmployees[0];
      
      expect(updatedEmployee.name).toBe('John Updated');
      expect(updatedEmployee.department).toBe('Sales');
    });

    test('preserves employee ID during update', async () => {
      const mockEmployees = [
        { id: 1234567890, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ];
      
      FileHandler.readEmployees.mockResolvedValue(mockEmployees);
      FileHandler.writeEmployees.mockResolvedValue();

      await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: 'John Updated',
          department: 'Sales',
          basicSalary: '5500'
        });

      const updatedEmployees = FileHandler.writeEmployees.mock.calls[0][0];
      expect(updatedEmployees[0].id).toBe(1234567890);
    });
  });

  describe('with invalid input', () => {
    test('re-renders edit form with errors when name is empty', async () => {
      const response = await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: '',
          department: 'Engineering',
          basicSalary: '5000'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Name is required and cannot be empty');
      expect(response.text).toContain('Engineering'); // Preserved input
      expect(response.text).toContain('5000'); // Preserved input
    });

    test('re-renders edit form with errors when department is empty', async () => {
      const response = await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: 'John Doe',
          department: '',
          basicSalary: '5000'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Department is required and cannot be empty');
      expect(response.text).toContain('John Doe'); // Preserved input
    });

    test('re-renders edit form with errors when salary is negative', async () => {
      const response = await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: 'John Doe',
          department: 'Engineering',
          basicSalary: '-1000'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Basic Salary must be a positive number');
    });

    test('re-renders edit form with multiple errors', async () => {
      const response = await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: '',
          department: '',
          basicSalary: '-1000'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Name is required and cannot be empty');
      expect(response.text).toContain('Department is required and cannot be empty');
      expect(response.text).toContain('Basic Salary must be a positive number');
    });

    test('does not call writeEmployees when validation fails', async () => {
      FileHandler.writeEmployees.mockResolvedValue();

      await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: '',
          department: 'Engineering',
          basicSalary: '5000'
        });

      expect(FileHandler.writeEmployees).not.toHaveBeenCalled();
    });
  });

  describe('when employee not found', () => {
    test('redirects to dashboard with error message', async () => {
      const mockEmployees = [
        { id: 1234567890, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ];
      
      FileHandler.readEmployees.mockResolvedValue(mockEmployees);

      const response = await request(app)
        .post('/edit/9999999999')
        .type('form')
        .send({
          name: 'John Updated',
          department: 'Sales',
          basicSalary: '5500'
        });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?error=Employee%20not%20found');
      expect(FileHandler.writeEmployees).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('handles file read errors gracefully', async () => {
      FileHandler.readEmployees.mockRejectedValue(new Error('File read error'));

      const response = await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: 'John Updated',
          department: 'Sales',
          basicSalary: '5500'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to update employee data');
    });

    test('handles file write errors gracefully', async () => {
      const mockEmployees = [
        { id: 1234567890, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ];
      
      FileHandler.readEmployees.mockResolvedValue(mockEmployees);
      FileHandler.writeEmployees.mockRejectedValue(new Error('File write error'));

      const response = await request(app)
        .post('/edit/1234567890')
        .type('form')
        .send({
          name: 'John Updated',
          department: 'Sales',
          basicSalary: '5500'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to update employee data');
    });
  });
});
