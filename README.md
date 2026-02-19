# Employee Payroll System (EPS)

A modern server-side web application to manage employee records and calculate monthly payroll using Node.js, Express, and EJS.

## 🌟 Features

- **Admin Login System**: Secure authentication for admin users (username: admin, password: admin)
- **Guest Mode**: View-only access for non-admin users
- **Dashboard**: View all employees with automatic payroll calculations
- **Add Employee**: Register new employees with comprehensive details
- **Profile Pictures**: Upload custom profile pictures or select from preset avatars
- **Custom Departments**: Choose from preset departments or enter custom ones
- **Custom Salary**: Select from preset amounts or enter custom salary
- **Gender & Start Date**: Track employee demographics and tenure
- **Notes Field**: Add additional information for each employee
- **Edit Employee**: Update existing employee information
- **Delete Employee**: Remove employees from the system with confirmation
- **Automatic Calculations**: Tax (12%) and Net Salary computed automatically
- **Data Persistence**: All data saved to `employees.json` file
- **Modern UI**: Clean, professional interface with responsive design
- **Session Management**: Secure login sessions with express-session

## 📂 Project Structure

The complete project code is available in the **`project`** branch.

```bash
# Clone the repository
git clone https://github.com/advita6/Employee-Payroll.git

# Switch to project branch to access the code
git checkout project
```

## 🚀 Quick Start

1. **Clone and switch to project branch:**
```bash
git clone https://github.com/advita6/Employee-Payroll.git
cd Employee-Payroll
git checkout project
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the application:**
```bash
npm run dev
# or
npm start
```

4. **Access the application:**
Open your browser and navigate to **http://localhost:3000**

5. **Login as Admin (optional):**
- Click "Admin Login" button
- Username: `admin`
- Password: `admin`
- As admin, you can add, edit, and delete employees
- Without login, you can view employees in read-only mode

## 📸 Screenshots

### Dashboard
Modern employee management interface with profile pictures, department badges, and action buttons.

### Add Employee Form
Comprehensive form with profile picture upload, gender selection, department checkboxes, and salary dropdown.

## 💻 Technologies Used

- **Backend**: Node.js, Express.js
- **Template Engine**: EJS
- **File Upload**: Multer
- **Session Management**: express-session
- **Styling**: Custom CSS with modern design
- **Data Storage**: JSON file-based storage
- **Testing**: Jest, Supertest, Fast-check

## 📋 Requirements

- Node.js (v14+)
- npm

## 🧪 Testing

Run all tests:
```bash
npm test
```

## 🤝 Contributing

This is a collaboration project. Feel free to contribute by:
1. Forking the repository
2. Creating a feature branch from `project` branch
3. Making your changes
4. Submitting a pull request

## 📄 License

MIT License

---

**Note**: All project files are in the `project` branch. Switch to that branch to access the complete source code.
