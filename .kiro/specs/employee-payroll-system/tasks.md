# Implementation Plan: Employee Payroll System

## Overview

This implementation plan breaks down the Employee Payroll System into incremental coding tasks. Each task builds on previous work, starting with core infrastructure, then data handling, business logic, views, and finally integration. The approach ensures that functionality is validated early through tests and that no code is left orphaned.

## Tasks

- [x] 1. Initialize project structure and dependencies
  - Create project directory structure (modules/, public/, views/)
  - Initialize npm project with `npm init`
  - Install dependencies: express, ejs
  - Install dev dependencies: jest, supertest, fast-check
  - Create empty employees.json file
  - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 5.1_

- [ ] 2. Implement FileHandler module
  - [x] 2.1 Create modules/fileHandler.js with readEmployees and writeEmployees functions
    - Implement readEmployees() using fs.promises.readFile
    - Handle ENOENT error (file doesn't exist) by returning empty array
    - Handle JSON parse errors by logging and returning empty array
    - Implement writeEmployees(employees) using fs.promises.writeFile
    - Format JSON with 2-space indentation using JSON.stringify(data, null, 2)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 2.2 Write unit tests for FileHandler
    - Test reading non-existent file returns empty array
    - Test reading valid file returns parsed employees
    - Test writing creates properly formatted JSON file
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ]* 2.3 Write property test for file persistence round trip
    - **Property 13: File Persistence Round Trip**
    - **Validates: Requirements 5.1, 5.2, 5.4**
    - Generate random employee arrays, verify write then read produces equivalent data

- [ ] 3. Implement business logic functions
  - [x] 3.1 Create calculation functions in server.js
    - Implement generateEmployeeId() using Date.now()
    - Implement calculateTax(basicSalary) returning basicSalary * 0.12
    - Implement calculateNetSalary(basicSalary, tax) returning basicSalary - tax
    - Implement enrichEmployeeWithPayroll(employee) adding tax and netSalary fields
    - _Requirements: 2.2, 1.3, 1.4, 8.1, 8.2_
  
  - [ ]* 3.2 Write property tests for payroll calculations
    - **Property 1: Tax Calculation Accuracy**
    - **Validates: Requirements 1.3, 8.1, 8.4**
    - Generate random positive salaries, verify tax = salary * 0.12
  
  - [ ]* 3.3 Write property test for net salary calculation
    - **Property 2: Net Salary Calculation Accuracy**
    - **Validates: Requirements 1.4, 8.2, 8.5**
    - Generate random salaries, verify netSalary = salary - tax
  
  - [ ]* 3.4 Write property test for payroll round trip
    - **Property 3: Payroll Calculation Round Trip**
    - **Validates: Requirements 1.3, 1.4, 8.1, 8.2**
    - Generate random salaries, verify (netSalary + tax) equals original salary
  
  - [ ]* 3.5 Write unit tests for specific calculation examples
    - Test calculateTax(5000) returns 600
    - Test calculateTax(4500) returns 540
    - Test calculateNetSalary(5000, 600) returns 4400
    - _Requirements: 1.3, 1.4, 8.1, 8.2_

- [ ] 4. Implement validation functions
  - [x] 4.1 Create validateEmployeeInput function in server.js
    - Check name is not empty, null, or whitespace-only
    - Check department is not empty, null, or whitespace-only
    - Check basicSalary is numeric and positive (> 0)
    - Return object with { valid: boolean, errors: string[] }
    - _Requirements: 7.1, 7.2, 7.3, 2.3, 2.4, 3.3, 3.4_
  
  - [ ]* 4.2 Write property test for required field validation
    - **Property 6: Required Field Validation**
    - **Validates: Requirements 2.3, 3.3, 7.1, 7.3**
    - Generate empty/whitespace strings for name and department, verify rejection
  
  - [ ]* 4.3 Write property test for salary validation
    - **Property 7: Salary Validation**
    - **Validates: Requirements 2.4, 3.4, 7.2**
    - Generate negative, zero, and non-numeric values, verify rejection
  
  - [ ]* 4.4 Write unit tests for validation edge cases
    - Test empty string name is rejected
    - Test whitespace-only name is rejected
    - Test negative salary is rejected
    - Test zero salary is rejected
    - Test valid input passes validation
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 5. Set up Express server and middleware
  - [x] 5.1 Configure Express application in server.js
    - Require express, create app instance
    - Set view engine to 'ejs'
    - Configure express.static('public') for CSS files
    - Configure express.urlencoded({ extended: true }) for form parsing
    - Set PORT from environment or default to 3000
    - _Requirements: 6.2, 6.3, 6.4, 6.7_
  
  - [ ]* 5.2 Write unit test for server startup
    - Test server listens on configured port
    - Test static files are served from public folder
    - _Requirements: 6.4, 6.7_

- [ ] 6. Implement dashboard route and view
  - [x] 6.1 Create GET / route handler
    - Read all employees using FileHandler.readEmployees()
    - Enrich each employee with payroll calculations using enrichEmployeeWithPayroll()
    - Render index.ejs with employees array
    - Handle errors by rendering with empty array
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 6.2 Create views/index.ejs template
    - Create HTML table with headers: ID, Name, Department, Basic Salary, Tax, Net Salary, Actions
    - Loop through employees array and display each in a table row
    - Format monetary values to 2 decimal places using toFixed(2)
    - Add Edit and Delete buttons for each employee
    - Add link to /add for creating new employees
    - Handle empty employee list gracefully
    - _Requirements: 1.1, 1.2, 1.5, 8.3_
  
  - [ ]* 6.3 Write property test for display completeness
    - **Property 4: Employee Record Display Completeness**
    - **Validates: Requirements 1.2**
    - Generate random employees, verify rendered output contains all required fields
  
  - [ ]* 6.4 Write property test for monetary formatting
    - **Property 15: Monetary Value Formatting**
    - **Validates: Requirements 8.3**
    - Generate random monetary values, verify 2 decimal places in output
  
  - [ ]* 6.5 Write unit test for dashboard route
    - Test GET / returns 200 status
    - Test dashboard displays employee data
    - Test empty employee list shows empty table
    - _Requirements: 1.1, 1.5_

- [ ] 7. Checkpoint - Verify dashboard functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement employee creation (add) functionality
  - [x] 8.1 Create GET /add route handler
    - Render add.ejs with empty form
    - _Requirements: 2.1_
  
  - [x] 8.2 Create POST /add route handler
    - Extract name, department, basicSalary from request body
    - Validate input using validateEmployeeInput()
    - If validation fails, re-render add.ejs with errors and preserved input
    - If valid, generate new employee ID using generateEmployeeId()
    - Create employee object with id, name (trimmed), department (trimmed), basicSalary (parsed as float)
    - Read existing employees, append new employee, write back to file
    - Redirect to / on success
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 7.4, 7.5_
  
  - [x] 8.3 Create views/add.ejs template
    - Create form with fields for Name, Department, Basic Salary
    - Set form action to POST /add
    - Display validation errors if present
    - Preserve user input in form fields if validation failed
    - Add Submit button and Cancel link back to /
    - _Requirements: 2.1, 7.4, 7.5_
  
  - [ ]* 8.4 Write property test for unique ID generation
    - **Property 5: Unique Employee ID Generation**
    - **Validates: Requirements 2.2**
    - Generate multiple employees, verify all IDs are unique
  
  - [ ]* 8.5 Write property test for CRUD persistence
    - **Property 8: CRUD Operations Persist to Data Store**
    - **Validates: Requirements 2.5, 3.5, 4.2, 5.4**
    - Generate random CRUD operations, verify data store reflects changes
  
  - [ ]* 8.6 Write property test for data integrity
    - **Property 9: Data Integrity During Operations**
    - **Validates: Requirements 2.6, 4.1**
    - Generate random operations, verify other records remain unchanged
  
  - [ ]* 8.7 Write property test for validation error feedback
    - **Property 14: Validation Error Feedback**
    - **Validates: Requirements 7.4, 7.5**
    - Generate invalid inputs, verify error messages and input preservation
  
  - [ ]* 8.8 Write unit tests for add functionality
    - Test POST /add with valid data creates employee and redirects
    - Test POST /add with invalid data returns errors
    - Test POST /add with empty name shows error
    - Test POST /add with negative salary shows error
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 9. Implement employee update (edit) functionality
  - [x] 9.1 Create GET /edit/:id route handler
    - Read all employees using FileHandler.readEmployees()
    - Find employee by ID from route parameter
    - If not found, redirect to / with error message
    - If found, render edit.ejs with employee data
    - _Requirements: 3.1_
  
  - [x] 9.2 Create POST /edit/:id route handler
    - Extract name, department, basicSalary from request body
    - Validate input using validateEmployeeInput()
    - If validation fails, re-render edit.ejs with errors and preserved input
    - If valid, read all employees, find employee by ID
    - If not found, redirect to / with error message
    - Update employee fields (preserve ID), write back to file
    - Redirect to / on success
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 7.4, 7.5_
  
  - [x] 9.3 Create views/edit.ejs template
    - Create form pre-populated with employee data
    - Set form action to POST /edit/:id
    - Display validation errors if present
    - Preserve user input in form fields if validation failed
    - Add Submit button and Cancel link back to /
    - _Requirements: 3.1, 7.4, 7.5_
  
  - [ ]* 9.4 Write property test for ID preservation during updates
    - **Property 10: Employee ID Preservation During Updates**
    - **Validates: Requirements 3.2**
    - Generate random updates, verify IDs remain unchanged
  
  - [ ]* 9.5 Write property test for edit form pre-population
    - **Property 11: Edit Form Pre-population**
    - **Validates: Requirements 3.1**
    - Generate random employees, verify edit form contains their data
  
  - [ ]* 9.6 Write unit tests for edit functionality
    - Test GET /edit/:id with valid ID renders form
    - Test GET /edit/:id with invalid ID redirects with error
    - Test POST /edit/:id with valid data updates employee
    - Test POST /edit/:id with invalid data shows errors
    - Test POST /edit/:id preserves employee ID
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Implement employee deletion functionality
  - [x] 10.1 Create POST /delete/:id route handler
    - Read all employees using FileHandler.readEmployees()
    - Find employee index by ID from route parameter
    - If not found, redirect to / with error message (graceful handling)
    - If found, remove employee from array using splice or filter
    - Write updated array back to file
    - Redirect to / on success
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ]* 10.2 Write property test for deletion
    - **Property 12: Deletion Removes Employee**
    - **Validates: Requirements 4.1, 4.2**
    - Generate random employees, delete one, verify it's removed from list
  
  - [ ]* 10.3 Write unit tests for delete functionality
    - Test POST /delete/:id with valid ID removes employee
    - Test POST /delete/:id with invalid ID redirects gracefully
    - Test deletion doesn't affect other employees
    - _Requirements: 4.1, 4.2, 4.4_

- [ ] 11. Create CSS styling
  - [x] 11.1 Create public/style.css
    - Style the page layout (centered container, max-width)
    - Style the employee table (borders, padding, alternating row colors)
    - Style forms (input fields, labels, spacing)
    - Style buttons (primary action, secondary action, delete action)
    - Style error messages (red text, prominent display)
    - Ensure professional, clean appearance
    - _Requirements: 6.4_

- [ ] 12. Add error handling and edge cases
  - [x] 12.1 Implement error handling in route handlers
    - Wrap async operations in try-catch blocks
    - Log errors to console
    - Display user-friendly error messages
    - Handle file write failures gracefully
    - Handle non-existent employee IDs gracefully
    - _Requirements: 4.4, 5.6_
  
  - [x] 12.2 Add server startup error handling
    - Catch port-in-use errors (EADDRINUSE)
    - Display helpful error messages
    - Exit gracefully on startup failure
    - _Requirements: 6.7_
  
  - [ ]* 12.3 Write unit tests for error scenarios
    - Test handling of non-existent employee ID
    - Test handling of file read errors
    - Test handling of file write errors
    - _Requirements: 4.4, 5.6_

- [ ] 13. Final integration and testing
  - [x] 13.1 Wire all components together
    - Ensure all routes are registered with Express
    - Ensure FileHandler is imported and used consistently
    - Ensure all views are in correct location
    - Ensure CSS is accessible via static middleware
    - Add app.listen() call with error handling
    - _Requirements: 6.2, 6.3, 6.4, 6.7_
  
  - [ ]* 13.2 Write integration tests for complete workflows
    - Test complete employee lifecycle: Create → Read → Update → Delete
    - Test multiple employees workflow
    - Test validation flow: Submit invalid → See errors → Correct → Success
    - Test persistence: Create employee → Restart server → Verify exists
    - _Requirements: 1.1, 2.1, 2.2, 2.5, 3.1, 3.2, 3.5, 4.1, 4.2, 5.2_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Run all unit tests, property tests, and integration tests
  - Verify all functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test-related sub-tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness across many random inputs (100+ iterations)
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate complete workflows and component interactions
- The implementation follows an incremental approach: infrastructure → data layer → business logic → views → integration
- All CRUD operations redirect to the dashboard after completion to prevent duplicate submissions
- Employee IDs are generated using Date.now() for simplicity (sufficient for single-server deployment)
- All monetary values are formatted to 2 decimal places for consistent display
