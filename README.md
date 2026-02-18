# Employee Payroll System (EPS)

A modern server-side web application to manage employee records and calculate monthly payroll using Node.js, Express, and EJS.

## Features

- **Dashboard**: View all employees with automatic payroll calculations
- **Add Employee**: Register new employees with name, department, and basic salary
- **Profile Pictures**: Upload custom profile pictures or select from preset avatars
- **Edit Employee**: Update existing employee information
- **Delete Employee**: Remove employees from the system with confirmation
- **Automatic Calculations**: Tax (12%) and Net Salary computed automatically
- **Data Persistence**: All data saved to `employees.json` file
- **Modern UI**: Clean, professional interface with responsive design

## Installation

1. Clone the repository:
```bash
git clone https://github.com/advita6/Employee-Payroll.git
cd Employee-Payroll
```

2. Install dependencies:
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
2. **Add Employee**: Click "Add User" button and fill in the form
   - Upload your own profile picture or select a preset avatar
   - Enter name, select gender, department(s), salary, and start date
3. **Edit Employee**: Click the edit icon (✏️) next to any employee
4. **Delete Employee**: Click the delete icon (🗑️) with confirmation

## Payroll Calculations

- **Tax**: 12% of Basic Salary
- **Net Salary**: Basic Salary - Tax

All monetary values are displayed with 2 decimal places.

## Project Structure

```
Employee-Payroll/
├── modules/
│   └── fileHandler.js      # File operations module
├── public/
│   ├── style.css           # Styling
│   └── uploads/            # Uploaded profile pictures
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

## Technologies Used

- **Backend**: Node.js, Express.js
- **Template Engine**: EJS
- **File Upload**: Multer
- **Styling**: Custom CSS with modern design
- **Data Storage**: JSON file-based storage

## Requirements

- Node.js (v14+)
- npm

## Data Validation

- Name: Required, cannot be empty or whitespace
- Department: Required, cannot be empty or whitespace
- Basic Salary: Must be a positive number
- Profile Picture: Optional, accepts JPEG, JPG, PNG, GIF (max 5MB)

## Error Handling

The application handles:
- Missing or corrupted data files
- Invalid employee IDs
- File read/write errors
- Port conflicts on startup
- Invalid file uploads

## Contributing

This is a collaboration project. Feel free to contribute by:
1. Forking the repository
2. Creating a feature branch
3. Making your changes
4. Submitting a pull request

## License

MIT License
