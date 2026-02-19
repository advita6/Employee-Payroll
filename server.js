// Employee Payroll System - Server
// Business logic functions for employee management and payroll calculations

// Import required modules
const express = require('express');
const FileHandler = require('./modules/fileHandler');
const multer = require('multer');
const path = require('path');
const session = require('express-session');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Create Express application instance
const app = express();

// Configure view engine
app.set('view engine', 'ejs');

// Configure middleware
app.use(express.static('public')); // Serve static files from public folder
app.use(express.urlencoded({ extended: true })); // Parse form data

// Configure session middleware
app.use(session({
  secret: 'payroll-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Configure port
const PORT = process.env.PORT || 3000;

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/login');
  }
}

/**
 * Generate unique employee ID using timestamp
 * @returns {number} Unique employee ID
 */
function generateEmployeeId() {
  return Date.now();
}

/**
 * Calculate tax (12% of basic salary)
 * @param {number} basicSalary - The employee's basic salary
 * @returns {number} Tax amount (12% of basic salary)
 */
function calculateTax(basicSalary) {
  return basicSalary * 0.12;
}

/**
 * Calculate net salary (basic salary minus tax)
 * @param {number} basicSalary - The employee's basic salary
 * @param {number} tax - The calculated tax amount
 * @returns {number} Net salary after tax deduction
 */
function calculateNetSalary(basicSalary, tax) {
  return basicSalary - tax;
}

/**
 * Enrich employee object with payroll calculations
 * @param {Object} employee - Employee object with id, name, department, basicSalary
 * @returns {Object} Employee object with added tax and netSalary fields
 */
function enrichEmployeeWithPayroll(employee) {
  const tax = calculateTax(employee.basicSalary);
  const netSalary = calculateNetSalary(employee.basicSalary, tax);
  
  return {
    ...employee,
    tax: tax,
    netSalary: netSalary
  };
}

/**
 * Validate employee input data
 * @param {string} name - Employee name
 * @param {string} department - Employee department
 * @param {number|string} basicSalary - Employee basic salary
 * @returns {Object} Validation result with { valid: boolean, errors: string[] }
 */
function validateEmployeeInput(name, department, basicSalary) {
  const errors = [];
  
  // Check name is not empty, null, or whitespace-only
  if (!name || name.trim() === '') {
    errors.push('Name is required and cannot be empty');
  }
  
  // Check department is not empty, null, or whitespace-only
  if (!department || department.trim() === '') {
    errors.push('Department is required and cannot be empty');
  }
  
  // Check basicSalary is numeric and positive (> 0)
  const salary = parseFloat(basicSalary);
  if (isNaN(salary) || salary <= 0) {
    errors.push('Basic Salary must be a positive number');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ============================================
// ROUTE HANDLERS
// ============================================

/**
 * GET / - Dashboard route
 * Displays all employees with payroll calculations
 */
app.get('/', async (req, res) => {
  try {
    // Read all employees from data store
    const employees = await FileHandler.readEmployees();
    
    // Enrich each employee with payroll calculations
    const enrichedEmployees = employees.map(enrichEmployeeWithPayroll);
    
    // Get error message from query parameter if present
    const errorMessage = req.query.error || null;
    
    // Check if user is admin
    const isAdmin = req.session && req.session.isAdmin;
    
    // Render dashboard with employees and admin status
    res.render('index', { employees: enrichedEmployees, error: errorMessage, isAdmin: isAdmin });
  } catch (error) {
    // Handle errors by rendering with empty array
    console.error('Error loading dashboard:', error);
    res.render('index', { employees: [], error: 'Failed to load employee data', isAdmin: false });
  }
});

/**
 * GET /login - Login page
 */
app.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/');
  }
  res.render('login', { error: null });
});

/**
 * POST /login - Handle login
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});

/**
 * GET /logout - Handle logout
 */
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

/**
 * GET /add - Add employee form route
 * Renders the add employee form (admin only)
 */
app.get('/add', requireAuth, (req, res) => {
  res.render('add', { errors: [], employee: {} });
});

/**
 * POST /add - Create new employee
 * Validates input, creates employee, saves to data store, and redirects to dashboard (admin only)
 */
app.post('/add', requireAuth, upload.single('profileImage'), async (req, res) => {
  try {
    // Extract all fields from request body
    const { name, department, basicSalary, selectedAvatar, gender, day, month, year, notes } = req.body;
    
    // Determine profile image path
    let profileImage = '';
    if (req.file) {
      profileImage = '/uploads/' + req.file.filename;
    } else if (selectedAvatar) {
      profileImage = `https://i.pravatar.cc/150?img=${selectedAvatar}`;
    } else {
      profileImage = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;
    }
    
    // Validate input
    const validation = validateEmployeeInput(name, department, basicSalary);
    
    // If validation fails, re-render add.ejs with errors and preserved input
    if (!validation.valid) {
      return res.render('add', {
        errors: validation.errors,
        employee: { name, department, basicSalary }
      });
    }
    
    // Generate new employee ID
    const id = generateEmployeeId();
    
    // Format start date if provided
    let startDate = '';
    if (day && month && year) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      startDate = `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    // Create employee object with all fields
    const newEmployee = {
      id: id,
      name: name.trim(),
      department: department.trim(),
      basicSalary: parseFloat(basicSalary),
      profileImage: profileImage,
      gender: gender || 'Male',
      startDate: startDate,
      notes: notes ? notes.trim() : ''
    };
    
    // Read existing employees
    const employees = await FileHandler.readEmployees();
    
    // Append new employee
    employees.push(newEmployee);
    
    // Write back to file
    await FileHandler.writeEmployees(employees);
    
    // Redirect to dashboard on success
    res.redirect('/');
  } catch (error) {
    console.error('Error creating employee:', error);
    res.render('add', {
      errors: ['Failed to save employee data. Please try again.'],
      employee: { name: req.body.name, department: req.body.department, basicSalary: req.body.basicSalary }
    });
  }
});

/**
 * GET /edit/:id - Edit employee form route
 * Finds employee by ID and renders the edit form with employee data (admin only)
 */
app.get('/edit/:id', requireAuth, async (req, res) => {
  try {
    // Read all employees from data store
    const employees = await FileHandler.readEmployees();
    
    // Find employee by ID from route parameter
    const employeeId = parseInt(req.params.id);
    const employee = employees.find(e => e.id === employeeId);
    
    // If not found, redirect to / with error message
    if (!employee) {
      return res.redirect('/?error=Employee not found');
    }
    
    // If found, render edit.ejs with employee data
    res.render('edit', { employee, errors: [] });
  } catch (error) {
    console.error('Error loading edit form:', error);
    res.redirect('/?error=Failed to load employee data');
  }
});

/**
 * POST /edit/:id - Update employee
 * Validates input, updates employee data, saves to data store, and redirects to dashboard (admin only)
 */
app.post('/edit/:id', requireAuth, async (req, res) => {
  try {
    // Extract name, department, basicSalary from request body
    const { name, department, basicSalary } = req.body;
    
    // Validate input using validateEmployeeInput()
    const validation = validateEmployeeInput(name, department, basicSalary);
    
    // If validation fails, re-render edit.ejs with errors and preserved input
    if (!validation.valid) {
      const employeeId = parseInt(req.params.id);
      return res.render('edit', {
        errors: validation.errors,
        employee: { id: employeeId, name, department, basicSalary }
      });
    }
    
    // Read all employees
    const employees = await FileHandler.readEmployees();
    
    // Find employee by ID
    const employeeId = parseInt(req.params.id);
    const employeeIndex = employees.findIndex(e => e.id === employeeId);
    
    // If not found, redirect to / with error message
    if (employeeIndex === -1) {
      return res.redirect('/?error=Employee not found');
    }
    
    // Update employee fields (preserve ID and other fields)
    const existingEmployee = employees[employeeIndex];
    employees[employeeIndex] = {
      id: employeeId, // Preserve the original ID
      name: name.trim(),
      department: department.trim(),
      basicSalary: parseFloat(basicSalary),
      profileImage: existingEmployee.profileImage || '',
      gender: existingEmployee.gender || 'Male',
      startDate: existingEmployee.startDate || '',
      notes: existingEmployee.notes || ''
    };
    
    // Write back to file
    await FileHandler.writeEmployees(employees);
    
    // Redirect to / on success
    res.redirect('/');
  } catch (error) {
    console.error('Error updating employee:', error);
    const employeeId = parseInt(req.params.id);
    res.render('edit', {
      errors: ['Failed to update employee data. Please try again.'],
      employee: { id: employeeId, name: req.body.name, department: req.body.department, basicSalary: req.body.basicSalary }
    });
  }
});

/**
 * POST /delete/:id - Delete employee
 * Removes employee from data store and redirects to dashboard (admin only)
 */
app.post('/delete/:id', requireAuth, async (req, res) => {
  try {
    // Read all employees from data store
    const employees = await FileHandler.readEmployees();
    
    // Find employee index by ID from route parameter
    const employeeId = parseInt(req.params.id);
    const employeeIndex = employees.findIndex(e => e.id === employeeId);
    
    // If not found, redirect to / with error message (graceful handling)
    if (employeeIndex === -1) {
      return res.redirect('/?error=Employee not found');
    }
    
    // If found, remove employee from array using splice
    employees.splice(employeeIndex, 1);
    
    // Write updated array back to file
    await FileHandler.writeEmployees(employees);
    
    // Redirect to / on success
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.redirect('/?error=Failed to delete employee');
  }
});

// Export functions for testing and use in routes
module.exports = {
  generateEmployeeId,
  calculateTax,
  calculateNetSalary,
  enrichEmployeeWithPayroll,
  validateEmployeeInput,
  app // Export app for testing
};

// Start server only if not in test environment
if (require.main === module) {
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
}
