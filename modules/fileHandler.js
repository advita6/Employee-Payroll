const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'employees.json');

/**
 * Read all employees from the data store
 * @returns {Promise<Array>} Array of employee objects, or empty array if file doesn't exist or parsing fails
 */
async function readEmployees() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist yet - normal for first run
      return [];
    }
    // JSON parse error or other read error
    console.error('Error reading employees file:', error);
    return [];
  }
}

/**
 * Write all employees to the data store
 * @param {Array} employees - Array of employee objects to write
 * @returns {Promise<void>}
 */
async function writeEmployees(employees) {
  await fs.writeFile(DATA_FILE, JSON.stringify(employees, null, 2));
}

module.exports = {
  readEmployees,
  writeEmployees
};
