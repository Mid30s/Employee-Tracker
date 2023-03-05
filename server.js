const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const figlet = require('figlet');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

async function start() {
    //top banner using figlet
    figlet("Employee Tracker", function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data)
    });
    
    const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
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

  // view All Departments function
  async function viewAllDepartments() {
    const [rows, fields] = await connection.execute(`
      SELECT * FROM department
    `)
    .catch(error => console.log(error));
    console.table(rows);
    mainMenu();
  }

  //view All Roles function
  async function viewAllRoles() {
    const [rows, fields] = await connection.execute(`
      SELECT role.id, role.title, department.name as department, role.salary
      FROM role
      LEFT JOIN department ON role.department_id = department.id
    `)
    .catch(error => console.log(error));
    console.table(rows);
    mainMenu();
  }
  
  //view All Employees function
  async function viewAllEmployees() {
    const [rows, fields] = await connection.execute(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) as manager
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      LEFT JOIN employee manager ON manager.id = employee.manager_id
    `)
    .catch(error => console.log(error));
    console.table(rows);
    mainMenu();
  }
  
}

// call the start function to start the program
start(); 
