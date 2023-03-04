const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

// create the database connection
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'company_db'
});

// prompt the user with the main menu
async function mainMenu() {
  const { choice } = await inquirer.prompt({
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role'
    ]
  });

  // call the appropriate function based on the user's choice
  switch (choice) {
    case 'View all departments':
      viewAllDepartments();
      break;
    case 'View all roles':
      viewAllRoles();
      break;
    case 'View all employees':
      viewAllEmployees();
      break;
    case 'Add a department':
      addDepartment();
      break;
    case 'Add a role':
      addRole();
      break;
    case 'Add an employee':
      addEmployee();
      break;
    case 'Update an employee role':
      updateEmployeeRole();
      break;
    default:
      console.log('Invalid choice');
  }
}

// start the program by calling the main menu
mainMenu();
