# Requirements Document

## Introduction

The Employee Payroll System (EPS) is a server-side web application designed to manage employee records and calculate monthly payroll. The system provides a dashboard for viewing all employees, functionality for adding, editing, and deleting employee records, and automatic payroll calculations including tax deductions. All data is persisted to a JSON file for simplicity.

## Glossary

- **EPS**: Employee Payroll System - the complete web application
- **Employee_Record**: A data structure containing employee information (ID, Name, Department, Basic Salary)
- **Dashboard**: The home page displaying all employee records in a table format
- **Basic_Salary**: The gross monthly salary before tax deductions (positive number)
- **Tax**: A percentage deduction from Basic Salary (12% of Basic Salary)
- **Net_Salary**: The final salary after tax deduction (Basic Salary - Tax)
- **Employee_ID**: A unique identifier for each employee generated using timestamp
- **Data_Store**: The employees.json file that persists all employee records
- **FileHandler**: A custom module for reading and writing to the Data_Store using fs.promises

## Requirements

### Requirement 1: Employee Dashboard

**User Story:** As a user, I want to view all employees in a table on the dashboard, so that I can see an overview of all employee records and their payroll information.

#### Acceptance Criteria

1. WHEN a user navigates to the home page, THE EPS SHALL display a dashboard with all Employee_Records in a table format
2. WHEN displaying each Employee_Record, THE EPS SHALL show Employee_ID, Name, Department, Basic_Salary, Tax, and Net_Salary
3. WHEN calculating Tax for display, THE EPS SHALL compute it as 12% of Basic_Salary
4. WHEN calculating Net_Salary for display, THE EPS SHALL compute it as Basic_Salary minus Tax
5. WHEN the Data_Store is empty, THE EPS SHALL display an empty table with appropriate headers

### Requirement 2: Employee Registration

**User Story:** As a user, I want to add new employees through a registration form, so that I can expand the employee database with new hires.

#### Acceptance Criteria

1. WHEN a user navigates to the add employee page, THE EPS SHALL display a registration form with fields for Name, Department, and Basic_Salary
2. WHEN a user submits the registration form with valid data, THE EPS SHALL create a new Employee_Record with a unique Employee_ID generated using Date.now()
3. WHEN a user submits a form with an empty Name field, THE EPS SHALL reject the submission and prevent record creation
4. WHEN a user submits a form with a negative Basic_Salary, THE EPS SHALL reject the submission and prevent record creation
5. WHEN a new Employee_Record is successfully created, THE EPS SHALL save it to the Data_Store and redirect to the Dashboard
6. WHEN saving to the Data_Store, THE EPS SHALL persist all existing records plus the new record

### Requirement 3: Employee Update

**User Story:** As a user, I want to edit existing employee details, so that I can keep employee information current when changes occur.

#### Acceptance Criteria

1. WHEN a user selects an employee to edit, THE EPS SHALL display an edit form pre-populated with that employee's current Name, Department, and Basic_Salary
2. WHEN a user submits the edit form with valid data, THE EPS SHALL update the Employee_Record with the new values while preserving the Employee_ID
3. WHEN a user submits an edit form with an empty Name field, THE EPS SHALL reject the submission and prevent the update
4. WHEN a user submits an edit form with a negative Basic_Salary, THE EPS SHALL reject the submission and prevent the update
5. WHEN an Employee_Record is successfully updated, THE EPS SHALL save the changes to the Data_Store and redirect to the Dashboard

### Requirement 4: Employee Deletion

**User Story:** As a user, I want to delete employee records, so that I can remove employees who have left the organization.

#### Acceptance Criteria

1. WHEN a user initiates deletion for an employee, THE EPS SHALL remove that Employee_Record from the system
2. WHEN an Employee_Record is deleted, THE EPS SHALL update the Data_Store to exclude the deleted record
3. WHEN deletion is successful, THE EPS SHALL redirect to the Dashboard
4. WHEN attempting to delete a non-existent Employee_ID, THE EPS SHALL handle the error gracefully and maintain data integrity

### Requirement 5: Data Persistence

**User Story:** As a system administrator, I want all employee data saved to a JSON file, so that data persists across server restarts.

#### Acceptance Criteria

1. THE EPS SHALL store all Employee_Records in a file named employees.json
2. WHEN the EPS starts, THE FileHandler SHALL read existing Employee_Records from the Data_Store
3. WHEN the Data_Store does not exist on startup, THE FileHandler SHALL initialize it as an empty array
4. WHEN any CRUD operation modifies employee data, THE FileHandler SHALL write the complete updated array to the Data_Store
5. WHEN writing to the Data_Store, THE FileHandler SHALL use fs.promises for asynchronous file operations
6. WHEN reading from the Data_Store fails, THE FileHandler SHALL return an empty array and log the error

### Requirement 6: Web Application Infrastructure

**User Story:** As a developer, I want the application built with Node.js, Express, and EJS, so that we have a maintainable server-side web application with templated views.

#### Acceptance Criteria

1. THE EPS SHALL use Node.js as the runtime environment
2. THE EPS SHALL use Express framework for routing and middleware
3. THE EPS SHALL use EJS as the templating engine for rendering views
4. WHEN serving static files, THE EPS SHALL serve CSS files from the public folder
5. THE EPS SHALL implement a FileHandler module in modules/fileHandler.js for all file operations
6. THE EPS SHALL organize views in a views folder containing index.ejs, add.ejs, and edit.ejs
7. WHEN the server starts, THE EPS SHALL listen on a configurable port and log the startup message

### Requirement 7: Input Validation

**User Story:** As a system administrator, I want all user inputs validated, so that the system maintains data integrity and prevents invalid records.

#### Acceptance Criteria

1. WHEN validating Name input, THE EPS SHALL reject empty strings, null values, and whitespace-only strings
2. WHEN validating Basic_Salary input, THE EPS SHALL reject negative numbers and non-numeric values
3. WHEN validating Department input, THE EPS SHALL reject empty strings, null values, and whitespace-only strings
4. WHEN validation fails, THE EPS SHALL display an appropriate error message to the user
5. WHEN validation fails, THE EPS SHALL preserve the user's input in the form for correction

### Requirement 8: Payroll Calculations

**User Story:** As a user, I want automatic payroll calculations, so that I can see accurate tax deductions and net salary for each employee.

#### Acceptance Criteria

1. THE EPS SHALL calculate Tax as exactly 12% of Basic_Salary
2. THE EPS SHALL calculate Net_Salary as Basic_Salary minus Tax
3. WHEN displaying monetary values, THE EPS SHALL format them with appropriate decimal precision
4. FOR ALL Employee_Records, the calculation Tax = Basic_Salary * 0.12 SHALL hold
5. FOR ALL Employee_Records, the calculation Net_Salary = Basic_Salary - Tax SHALL hold
