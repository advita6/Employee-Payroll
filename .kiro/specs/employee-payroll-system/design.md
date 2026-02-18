# Design Document: Employee Payroll System

## Overview

The Employee Payroll System is a server-side web application built with Node.js, Express, and EJS that manages employee records and calculates payroll. The architecture follows the MVC pattern with Express handling routing (Controller), EJS templates for views (View), and a JSON file-based data store with a custom FileHandler module (Model).

The system provides a simple CRUD interface for employee management with automatic payroll calculations. All data persists to a single JSON file, making it suitable for small to medium-sized organizations without requiring a database setup.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  (User Interface - EJS Rendered HTML + CSS)                 │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP Requests/Responses
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Server                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Route Handlers                           │  │
│  │  - GET /          (Dashboard)                        │  │
│  │  - GET /add       (Add Form)                         │  │
│  │  - POST /add      (Create Employee)                  │  │
│  │  - GET /edit/:id  (Edit Form)                        │  │
│  │  - POST /edit/:id (Update Employee)                  │  │
│  │  - POST /delete/:id (Delete Employee)                │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │           Business Logic Layer                        │  │
│  │  - Input Validation                                   │  │
│  │  - Payroll Calculations (Tax, Net Salary)            │  │
│  │  - Employee ID Generation                             │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │           FileHandler Module                          │  │
│  │  - readEmployees()                                    │  │
│  │  - writeEmployees(data)                               │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ fs.promises
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   employees.json                             │
│              (Persistent Data Store)                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Node.js (v14+ recommended)
- **Web Framework**: Express.js
- **Template Engine**: EJS
- **File I/O**: Node.js fs.promises API
- **Static Assets**: Express static middleware
- **Data Format**: JSON

### Design Patterns

1. **MVC Pattern**: Separation of concerns between routes (Controller), EJS templates (View), and FileHandler (Model)
2. **Module Pattern**: FileHandler encapsulates all file operations
3. **Middleware Pattern**: Express middleware for static file serving and body parsing
4. **Redirect-After-Post**: All POST operations redirect to prevent duplicate submissions

## Components and Interfaces

### 1. FileHandler Module (`modules/fileHandler.js`)

The FileHandler module provides an abstraction layer for all file operations, using fs.promises for asynchronous I/O.

**Interface:**

```javascript
// Read all employees from the data store
async function readEmployees(): Promise<Employee[]>

// Write all employees to the data store
async function writeEmployees(employees: Employee[]): Promise<void>
```

**Behavior:**

- `readEmployees()`: 
  - Reads employees.json and parses JSON
  - Returns empty array if file doesn't exist
  - Returns empty array and logs error if parsing fails
  - Never throws errors to calling code

- `writeEmployees(employees)`:
  - Writes array to employees.json with pretty formatting (2-space indent)
  - Creates file if it doesn't exist
  - Overwrites existing file completely
  - Throws error if write fails (caller must handle)

**Implementation Notes:**
- Use `fs.promises.readFile()` and `fs.promises.writeFile()`
- Use `JSON.parse()` and `JSON.stringify(data, null, 2)` for formatting
- Wrap readFile in try-catch to handle ENOENT gracefully

### 2. Express Server (`server.js`)

The main application file that configures Express, defines routes, and implements business logic.

**Configuration:**

```javascript
const express = require('express');
const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Port configuration
const PORT = process.env.PORT || 3000;
```

**Route Handlers:**

```javascript
// GET / - Dashboard
// Reads all employees, calculates payroll for each, renders index.ejs
async function handleDashboard(req, res)

// GET /add - Add Employee Form
// Renders add.ejs with empty form
function handleAddForm(req, res)

// POST /add - Create Employee
// Validates input, generates ID, saves employee, redirects to /
async function handleCreateEmployee(req, res)

// GET /edit/:id - Edit Employee Form
// Finds employee by ID, renders edit.ejs with employee data
async function handleEditForm(req, res)

// POST /edit/:id - Update Employee
// Validates input, updates employee, saves, redirects to /
async function handleUpdateEmployee(req, res)

// POST /delete/:id - Delete Employee
// Removes employee by ID, saves, redirects to /
async function handleDeleteEmployee(req, res)
```

**Business Logic Functions:**

```javascript
// Generate unique employee ID using timestamp
function generateEmployeeId(): number

// Calculate tax (12% of basic salary)
function calculateTax(basicSalary: number): number

// Calculate net salary (basic salary - tax)
function calculateNetSalary(basicSalary: number, tax: number): number

// Validate employee input
function validateEmployeeInput(name: string, department: string, basicSalary: number): 
  { valid: boolean, errors: string[] }

// Add payroll calculations to employee object
function enrichEmployeeWithPayroll(employee: Employee): EmployeeWithPayroll
```

### 3. EJS Views

**index.ejs (Dashboard)**
- Receives: `employees` array with payroll calculations
- Displays: Table with columns for ID, Name, Department, Basic Salary, Tax, Net Salary, Actions
- Actions: Edit and Delete buttons for each employee
- Includes: Link to add new employee

**add.ejs (Add Employee Form)**
- Receives: Optional `errors` array for validation feedback
- Displays: Form with fields for Name, Department, Basic Salary
- Includes: Submit button, Cancel link back to dashboard
- Form action: POST /add

**edit.ejs (Edit Employee Form)**
- Receives: `employee` object, optional `errors` array
- Displays: Form pre-populated with employee data
- Includes: Submit button, Cancel link back to dashboard
- Form action: POST /edit/:id

### 4. Static Assets

**public/style.css**
- Provides styling for all pages
- Includes: Table styling, form styling, button styling, layout
- Design: Clean, professional appearance suitable for business application

## Data Models

### Employee (Base Model)

```javascript
{
  id: number,           // Unique identifier (timestamp from Date.now())
  name: string,         // Employee name (non-empty, trimmed)
  department: string,   // Department name (non-empty, trimmed)
  basicSalary: number   // Monthly salary before tax (positive number)
}
```

**Constraints:**
- `id`: Must be unique, positive integer
- `name`: Non-empty string after trimming, no whitespace-only values
- `department`: Non-empty string after trimming, no whitespace-only values
- `basicSalary`: Positive number (> 0), can have decimal places

### EmployeeWithPayroll (Computed Model)

```javascript
{
  id: number,
  name: string,
  department: string,
  basicSalary: number,
  tax: number,          // Calculated as basicSalary * 0.12
  netSalary: number     // Calculated as basicSalary - tax
}
```

**Calculation Rules:**
- `tax = basicSalary * 0.12` (exactly 12%)
- `netSalary = basicSalary - tax`
- All monetary values should be formatted to 2 decimal places for display

### Data Store Format (employees.json)

```json
[
  {
    "id": 1704067200000,
    "name": "John Doe",
    "department": "Engineering",
    "basicSalary": 5000
  },
  {
    "id": 1704067201000,
    "name": "Jane Smith",
    "department": "Marketing",
    "basicSalary": 4500
  }
]
```

**Format Rules:**
- Root element is an array
- Each element is an Employee object
- Pretty-printed with 2-space indentation
- No payroll calculations stored (computed on read)

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Tax Calculation Accuracy

*For any* employee with a basic salary, the calculated tax must equal exactly 12% of the basic salary (tax = basicSalary * 0.12).

**Validates: Requirements 1.3, 8.1, 8.4**

### Property 2: Net Salary Calculation Accuracy

*For any* employee with a basic salary and calculated tax, the net salary must equal the basic salary minus the tax (netSalary = basicSalary - tax).

**Validates: Requirements 1.4, 8.2, 8.5**

### Property 3: Payroll Calculation Round Trip

*For any* positive basic salary value, calculating tax and net salary and then verifying that (netSalary + tax) equals the original basic salary should hold true.

**Validates: Requirements 1.3, 1.4, 8.1, 8.2**

### Property 4: Employee Record Display Completeness

*For any* employee record, when rendered for display, the output must contain all required fields: Employee_ID, Name, Department, Basic_Salary, Tax, and Net_Salary.

**Validates: Requirements 1.2**

### Property 5: Unique Employee ID Generation

*For any* sequence of employee creation operations, all generated employee IDs must be unique (no two employees should have the same ID).

**Validates: Requirements 2.2**

### Property 6: Required Field Validation

*For any* input where Name, Department, or both are empty strings, null values, or whitespace-only strings, the validation function must reject the input and return appropriate error messages.

**Validates: Requirements 2.3, 3.3, 7.1, 7.3**

### Property 7: Salary Validation

*For any* input where Basic_Salary is negative, zero, or non-numeric, the validation function must reject the input and return an appropriate error message.

**Validates: Requirements 2.4, 3.4, 7.2**

### Property 8: CRUD Operations Persist to Data Store

*For any* valid CRUD operation (Create, Update, or Delete), after the operation completes, reading from the data store must reflect the changes made by that operation.

**Validates: Requirements 2.5, 3.5, 4.2, 5.4**

### Property 9: Data Integrity During Operations

*For any* CRUD operation on a specific employee, all other employee records in the system must remain unchanged (no data corruption or unintended modifications).

**Validates: Requirements 2.6, 4.1**

### Property 10: Employee ID Preservation During Updates

*For any* employee update operation, the employee's ID before the update must equal the employee's ID after the update (IDs are immutable).

**Validates: Requirements 3.2**

### Property 11: Edit Form Pre-population

*For any* existing employee, when loading the edit form, the form fields must be pre-populated with that employee's current Name, Department, and Basic_Salary values.

**Validates: Requirements 3.1**

### Property 12: Deletion Removes Employee

*For any* employee that exists in the system, after a successful delete operation, that employee must not appear in the list of all employees.

**Validates: Requirements 4.1, 4.2**

### Property 13: File Persistence Round Trip

*For any* valid array of employee records, writing the array to the data store and then reading it back must produce an equivalent array (serialization/deserialization preserves data).

**Validates: Requirements 5.1, 5.2, 5.4**

### Property 14: Validation Error Feedback

*For any* validation failure, the system must display at least one error message to the user and preserve the user's input in the form for correction.

**Validates: Requirements 7.4, 7.5**

### Property 15: Monetary Value Formatting

*For any* monetary value (Basic_Salary, Tax, Net_Salary) displayed to the user, the value must be formatted with exactly 2 decimal places.

**Validates: Requirements 8.3**

## Error Handling

### Input Validation Errors

**Scenario**: User submits invalid employee data (empty name, negative salary, etc.)

**Handling Strategy**:
1. Validate all inputs before processing
2. Collect all validation errors into an array
3. If errors exist, re-render the form with:
   - Error messages displayed prominently
   - User's input preserved in form fields
   - No data modification occurs
4. Return HTTP 400 status with error page

**Implementation**:
```javascript
function validateEmployeeInput(name, department, basicSalary) {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('Name is required and cannot be empty');
  }
  
  if (!department || department.trim() === '') {
    errors.push('Department is required and cannot be empty');
  }
  
  const salary = parseFloat(basicSalary);
  if (isNaN(salary) || salary <= 0) {
    errors.push('Basic Salary must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}
```

### File System Errors

**Scenario**: Cannot read or write to employees.json

**Handling Strategy**:

**Read Errors**:
- If file doesn't exist (ENOENT): Return empty array, system continues normally
- If file is corrupted (JSON parse error): Log error, return empty array
- If permission denied: Log error, return empty array, alert user

**Write Errors**:
- If write fails: Log error, throw exception to caller
- Caller should catch and display error message to user
- Do not modify in-memory state if write fails

**Implementation**:
```javascript
async function readEmployees() {
  try {
    const data = await fs.readFile('employees.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist yet - normal for first run
      return [];
    }
    console.error('Error reading employees file:', error);
    return [];
  }
}

async function writeEmployees(employees) {
  try {
    await fs.writeFile('employees.json', JSON.stringify(employees, null, 2));
  } catch (error) {
    console.error('Error writing employees file:', error);
    throw new Error('Failed to save employee data');
  }
}
```

### Non-Existent Employee Errors

**Scenario**: User tries to edit or delete an employee that doesn't exist

**Handling Strategy**:
1. When loading edit form: Check if employee exists
   - If not found: Redirect to dashboard with error message
   - Use query parameter: `/?error=Employee not found`
2. When processing update/delete: Check if employee exists
   - If not found: Redirect to dashboard with error message
   - Do not modify data store

**Implementation**:
```javascript
// In edit route
const employee = employees.find(e => e.id === parseInt(req.params.id));
if (!employee) {
  return res.redirect('/?error=Employee not found');
}

// In delete route
const index = employees.findIndex(e => e.id === parseInt(req.params.id));
if (index === -1) {
  return res.redirect('/?error=Employee not found');
}
```

### Server Startup Errors

**Scenario**: Port already in use or other startup failures

**Handling Strategy**:
1. Catch server listen errors
2. Log descriptive error message
3. Exit process with error code
4. Suggest alternative port in error message

**Implementation**:
```javascript
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error('Server startup error:', error);
  }
  process.exit(1);
});
```

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for universal correctness properties. This ensures both concrete edge cases and general behavior are validated.

### Property-Based Testing

**Library**: fast-check (for Node.js/JavaScript)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: employee-payroll-system, Property N: [property description]`

**Property Test Coverage**:

Each correctness property listed above must have a corresponding property-based test:

1. **Property 1 (Tax Calculation)**: Generate random positive salaries, verify tax = salary * 0.12
2. **Property 2 (Net Salary)**: Generate random salaries, verify netSalary = salary - tax
3. **Property 3 (Round Trip)**: Generate random salaries, verify (netSalary + tax) = salary
4. **Property 4 (Display Completeness)**: Generate random employees, verify all fields present in rendered output
5. **Property 5 (Unique IDs)**: Generate multiple employees, verify all IDs are unique
6. **Property 6 (Required Fields)**: Generate invalid names/departments (empty, whitespace), verify rejection
7. **Property 7 (Salary Validation)**: Generate invalid salaries (negative, zero, non-numeric), verify rejection
8. **Property 8 (Persistence)**: Generate random CRUD operations, verify data store reflects changes
9. **Property 9 (Data Integrity)**: Generate random operations, verify other records unchanged
10. **Property 10 (ID Preservation)**: Generate random updates, verify IDs unchanged
11. **Property 11 (Form Pre-population)**: Generate random employees, verify edit form contains their data
12. **Property 12 (Deletion)**: Generate random employees, delete one, verify it's gone
13. **Property 13 (File Round Trip)**: Generate random employee arrays, verify write/read preserves data
14. **Property 14 (Error Feedback)**: Generate invalid inputs, verify error messages and input preservation
15. **Property 15 (Formatting)**: Generate random monetary values, verify 2 decimal places

**Example Property Test**:
```javascript
// Feature: employee-payroll-system, Property 1: Tax Calculation Accuracy
const fc = require('fast-check');

test('Tax is always 12% of basic salary', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0.01, max: 1000000 }), // Generate random positive salaries
      (basicSalary) => {
        const tax = calculateTax(basicSalary);
        const expected = basicSalary * 0.12;
        return Math.abs(tax - expected) < 0.001; // Allow for floating point precision
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

**Library**: Jest (for Node.js/JavaScript)

**Focus Areas**:

Unit tests complement property tests by focusing on:
- Specific edge cases (empty employee list, missing file)
- Integration points (Express routes, EJS rendering)
- Error conditions (file write failures, invalid IDs)
- Concrete examples that demonstrate correct behavior

**Unit Test Coverage**:

**FileHandler Module**:
- Reading from non-existent file returns empty array
- Reading corrupted JSON returns empty array
- Writing creates file with correct format
- Writing preserves all employee data

**Validation Functions**:
- Empty string name is rejected
- Whitespace-only name is rejected
- Negative salary is rejected
- Zero salary is rejected
- Valid input passes validation

**Payroll Calculations**:
- Tax calculation for specific salary values (e.g., 5000 → 600)
- Net salary calculation for specific values (e.g., 5000 - 600 = 4400)
- Formatting to 2 decimal places (e.g., 5000.5 → "5000.50")

**Route Handlers**:
- GET / returns 200 and renders dashboard
- POST /add with valid data creates employee and redirects
- POST /add with invalid data returns 400 and shows errors
- GET /edit/:id with valid ID renders edit form
- GET /edit/:id with invalid ID redirects with error
- POST /edit/:id updates employee and redirects
- POST /delete/:id removes employee and redirects

**Example Unit Test**:
```javascript
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
});
```

### Integration Testing

**Focus**: End-to-end workflows

**Test Scenarios**:
1. Complete employee lifecycle: Create → Read → Update → Delete
2. Multiple employees: Create several, verify all appear on dashboard
3. Validation flow: Submit invalid data, see errors, correct and resubmit
4. Persistence: Create employee, restart server, verify employee still exists
5. Concurrent operations: Multiple creates/updates, verify data integrity

**Tools**: Supertest (for HTTP testing) + Jest

**Example Integration Test**:
```javascript
describe('Employee CRUD workflow', () => {
  test('complete employee lifecycle', async () => {
    // Create employee
    const createRes = await request(app)
      .post('/add')
      .send({ name: 'John Doe', department: 'Engineering', basicSalary: 5000 });
    expect(createRes.status).toBe(302); // Redirect
    
    // Verify employee appears on dashboard
    const dashboardRes = await request(app).get('/');
    expect(dashboardRes.text).toContain('John Doe');
    expect(dashboardRes.text).toContain('Engineering');
    expect(dashboardRes.text).toContain('5000');
    
    // Update employee
    const employees = await readEmployees();
    const employee = employees.find(e => e.name === 'John Doe');
    const updateRes = await request(app)
      .post(`/edit/${employee.id}`)
      .send({ name: 'John Doe', department: 'Marketing', basicSalary: 5500 });
    expect(updateRes.status).toBe(302);
    
    // Verify update
    const updatedDashboard = await request(app).get('/');
    expect(updatedDashboard.text).toContain('Marketing');
    expect(updatedDashboard.text).toContain('5500');
    
    // Delete employee
    const deleteRes = await request(app).post(`/delete/${employee.id}`);
    expect(deleteRes.status).toBe(302);
    
    // Verify deletion
    const finalDashboard = await request(app).get('/');
    expect(finalDashboard.text).not.toContain('John Doe');
  });
});
```

### Test Organization

```
tests/
├── unit/
│   ├── fileHandler.test.js
│   ├── validation.test.js
│   ├── calculations.test.js
│   └── routes.test.js
├── property/
│   ├── payroll.property.test.js
│   ├── validation.property.test.js
│   ├── persistence.property.test.js
│   └── integrity.property.test.js
└── integration/
    └── employee-workflow.test.js
```

### Testing Balance

- **Property tests**: Verify universal correctness across many random inputs (100+ iterations each)
- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Integration tests**: Verify complete workflows and component interactions
- Together, these provide comprehensive coverage without excessive redundancy
- Avoid writing too many unit tests for cases already covered by property tests
