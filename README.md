# Employee Payroll System (EPS)

A server-side web application to manage employee records and calculate monthly payroll using Node.js, Express, and EJS.

## Features

- **Dashboard**: View all employees with automatic payroll calculations
- **Add Employee**: Register new employees with name, department, and basic salary
- **Edit Employee**: Update existing employee information
- **Delete Employee**: Remove employees from the system
- **Automatic Calculations**: Tax (12%) and Net Salary computed automatically
- **Data Persistence**: All data saved to `employees.json` file

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

Start the server:
```bash
node server.js
```

The application will be available at: **http://localhost:3000**

## Usage

1. **View Dashboard**: Navigate to http://localhost:3000 to see all employees
2. **Add Employee**: Click "Add New Employee" button and fill in the form
3. **Edit Employee**: Click "Edit" button next to any employee
4. **Delete Employee**: Click "Delete" button (with confirmation)

## Payroll Calculations

- **Tax**: 12% of Basic Salary
- **Net Salary**: Basic Salary - Tax

All monetary values are displayed with 2 decimal places.

## Project Structure

```
payroll-app/
├── modules/
│   └── fileHandler.js      # File operations module
├── public/
│   └── style.css           # Styling
├── views/
│   ├── index.ejs           # Dashboard
│   ├── add.ejs             # Add employee form
│   └── edit.ejs            # Edit employee form
├── tests/                  # Test files
├── employees.json          # Data store
├── server.js               # Main application
└── package.json            # Dependencies
```

## Testing

Run all tests:
```bash
npm test
```

## Requirements

- Node.js (v14+)
- Express.js
- EJS

## Data Validation

- Name: Required, cannot be empty or whitespace
- Department: Required, cannot be empty or whitespace
- Basic Salary: Must be a positive number

## Error Handling

The application handles:
- Missing or corrupted data files
- Invalid employee IDs
- File read/write errors
- Port conflicts on startup
