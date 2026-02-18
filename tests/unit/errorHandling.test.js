// Unit tests for error handling in route handlers
const request = require('supertest');
const { app } = require('../../server');
const FileHandler = require('../../modules/fileHandler');

// Mock the FileHandler module
jest.mock('../../modules/fileHandler');

describe('Error Handling in Route Handlers', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET / (Dashboard) error handling', () => {
    test('handles file read errors gracefully', async () => {
      FileHandler.readEmployees.mockRejectedValue(new Error('File read error'));

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to load employee data');
    });

    test('displays error message from query parameter', async () => {
      FileHandler.readEmployees.mockResolvedValue([]);

      const response = await request(app).get('/?error=Employee%20not%20found');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Employee not found');
    });
  });

  describe('POST /add error handling', () => {
    test('handles file read errors gracefully', async () => {
      FileHandler.readEmployees.mockRejectedValue(new Error('File read error'));

      const response = await request(app)
        .post('/add')
        .type('form')
        .send({
          name: 'John Doe',
          department: 'Engineering',
          basicSalary: '5000'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to save employee data');
      expect(response.text).toContain('John Doe'); // Preserved input
    });

    test('handles file write errors gracefully', async () => {
      FileHandler.readEmployees.mockResolvedValue([]);
      FileHandler.writeEmployees.mockRejectedValue(new Error('File write error'));

      const response = await request(app)
        .post('/add')
        .type('form')
        .send({
          name: 'John Doe',
          department: 'Engineering',
          basicSalary: '5000'
        });

      expect(response.status).toBe(200);
      expect(response.text).toContain('Failed to save employee data');
      expect(response.text).toContain('John Doe'); // Preserved input
    });
  });

  describe('GET /edit/:id error handling', () => {
    test('handles file read errors gracefully', async () => {
      FileHandler.readEmployees.mockRejectedValue(new Error('File read error'));

      const response = await request(app).get('/edit/1234567890');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?error=Failed%20to%20load%20employee%20data');
    });

    test('handles non-existent employee ID gracefully', async () => {
      FileHandler.readEmployees.mockResolvedValue([
        { id: 1234567890, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ]);

      const response = await request(app).get('/edit/9999999999');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?error=Employee%20not%20found');
    });
  });

  describe('POST /edit/:id error handling', () => {
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

    test('handles non-existent employee ID gracefully', async () => {
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

  describe('POST /delete/:id error handling', () => {
    test('handles file read errors gracefully', async () => {
      FileHandler.readEmployees.mockRejectedValue(new Error('File read error'));

      const response = await request(app).post('/delete/1234567890');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?error=Failed%20to%20delete%20employee');
    });

    test('handles file write errors gracefully', async () => {
      const mockEmployees = [
        { id: 1234567890, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ];
      
      FileHandler.readEmployees.mockResolvedValue(mockEmployees);
      FileHandler.writeEmployees.mockRejectedValue(new Error('File write error'));

      const response = await request(app).post('/delete/1234567890');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?error=Failed%20to%20delete%20employee');
    });

    test('handles non-existent employee ID gracefully', async () => {
      const mockEmployees = [
        { id: 1234567890, name: 'John Doe', department: 'Engineering', basicSalary: 5000 }
      ];
      
      FileHandler.readEmployees.mockResolvedValue(mockEmployees);

      const response = await request(app).post('/delete/9999999999');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?error=Employee%20not%20found');
      expect(FileHandler.writeEmployees).not.toHaveBeenCalled();
    });
  });
});

describe('Server startup error handling', () => {
  test('handles EADDRINUSE error (port already in use)', () => {
    // Mock console.error to capture error messages
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Create a mock error event
    const mockError = new Error('Port in use');
    mockError.code = 'EADDRINUSE';

    // Get the server instance
    const server = app.listen(0); // Use port 0 to get any available port
    
    // Trigger the error event
    server.emit('error', mockError);

    // Verify error message was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('is already in use')
    );
    
    // Verify process.exit was called with error code
    expect(processExitSpy).toHaveBeenCalledWith(1);

    // Clean up
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    server.close();
  });

  test('handles generic server startup errors', () => {
    // Mock console.error to capture error messages
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    // Create a mock error event
    const mockError = new Error('Generic server error');

    // Get the server instance
    const server = app.listen(0); // Use port 0 to get any available port
    
    // Trigger the error event
    server.emit('error', mockError);

    // Verify error message was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Server startup error:', mockError);
    
    // Verify process.exit was called with error code
    expect(processExitSpy).toHaveBeenCalledWith(1);

    // Clean up
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    server.close();
  });
});
