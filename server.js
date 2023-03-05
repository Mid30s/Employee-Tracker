const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const figlet = require('figlet');

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
    password: 'abcd1234',
    database: 'company_db'
  });

  // prompt the user with the main menu
  async function mainMenu() {
    const { choice } = await inquirer.prompt({
      type: 'list',
      name: 'choice',
      message: 'What would you like to do?',
      choices: [
        '🔍 View All Departments',
        '🔍 View All Roles',
        '🔍 View All Employees',
        '📊 View All Employees By Department',
        '👨 View All Employees By Manager',
        '💰 View the total utilized budget of a department',
        '🆕 Add a Department',
        '❌ Delete an Department',
        '🆕 Add a Role',
        '❌ Delete an Role',
        '🆕 Add an Employee',
        '❌ Delete an Employee',
        '🛠️ Update an Employee Role',
        '🛠️ Update Employee Manager'
        
      ]
    });

    // call the appropriate function based on the user's choice
    switch (choice) {
      case '🔍 View All Departments':
        viewAllDepartments();
        break;
      case '🔍 View All Roles':
        viewAllRoles();
        break;
      case '🔍 View All Employees':
        viewAllEmployees();
        break;
      case '📊 View All Employees By Department':
        viewAllEmployeesByDepartment();
        break; 
      case '👨 View All Employees By Manager':
        viewAllEmployeesByManager();
        break;
      case '💰 View the total utilized budget of a department':
        viewTotalUtilizedBudget();
        break;
      case '🆕 Add a Department':
        addDepartment();
        break;
      case '❌ Delete an Department':
        deleteDepartment();
        break;
      case '🆕 Add a Role':
        addRole();
        break;
      case '❌ Delete an Role':
        deleteRole();
        break;
      case '🆕 Add an Employee':
        addEmployee();
        break;
      case '❌ Delete an Employee':
        deleteEmployee();
        break;
      case '🛠️ Update an Employee Role':
        updateEmployeeRole();
        break;
      case '🛠️ Update Employee Manager':
        updateEmployeeManager();
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
  
  //add Department function
  async function addDepartment() {
    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'What is the name of the department?'
    });
    await connection.execute(`
      INSERT INTO department (name)
      VALUES (?)
    `, [name])
    .catch(error => console.log(error));
    console.log(`Added ${name} to the database`);
    mainMenu();
  }

  //add Role function
  async function addRole() {
    const departments = await connection.execute(`
      SELECT * FROM department
    `)
    .catch(error => console.log(error));
    const departmentChoices = departments[0].map(({ id, name }) => ({
      name: name,
      value: id
    }));
    const role = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the name of the role?'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of the role?'
      },
      {
        type: 'list',
        name: 'department_id',
        message: 'Which department does the role belong to?',
        choices: departmentChoices
      }
    ]);
    await connection.execute(`
      INSERT INTO role (title, salary, department_id)
      VALUES (?, ?, ?)
    `, [role.title, role.salary, role.department_id])
    .catch(error => console.log(error));
    console.log(`Added ${role.title} to the database`);
    mainMenu();
  }
  
  //add Employee function
  async function addEmployee() {
    const roles = await connection.execute(`
      SELECT * FROM role
    `)
    .catch(error => console.log(error));
    const roleChoices = roles[0].map(({ id, title }) => ({
      name: title,
      value: id
    }));
    const employees = await connection.execute(`
      SELECT * FROM employee
    `)
    .catch(error => console.log(error));
    const employeeChoices = employees[0].map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
    employeeChoices.unshift({ name: 'None', value: null });
    const employee = await inquirer.prompt([
      {
        type: 'input',
        name: 'first_name',
        message: "What is the employee's first name?"
      },
      {
        type: 'input',
        name: 'last_name',
        message: "What is the employee's last name?"
      },
      {
        type: 'list',
        name: 'role_id',
        message: "What is the employee's role?",
        choices: roleChoices
      },
      {
        type: 'list',
        name: 'manager_id',
        message: "Who is the employee's manager?",
        choices: employeeChoices
      }
    ]);
    await connection.execute(`
      INSERT INTO employee (first_name, last_name, role_id, manager_id)
      VALUES (?, ?, ?, ?)
    `, [employee.first_name, employee.last_name, employee.role_id, employee.manager_id])
    .catch(error => console.log(error));
    console.log(`Added ${employee.first_name} ${employee.last_name} to the database`);
    mainMenu();
  }
  
  //delete Employee function
  async function deleteEmployee() {
    const employees = await connection.execute(`
      SELECT * FROM employee
    `).catch(error => console.log(error));
  
    const employeeChoices = employees[0].map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id
    }));
  
    const employee = await inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Which employee would you like to delete?',
        choices: employeeChoices
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to delete this employee?',
        default: false
      }
    ]);
  
    if (employee.confirm) {
      await connection.execute(`
        DELETE FROM employee WHERE id = ?
      `, [employee.id]).catch(error => console.log(error));
      console.log(`Employee with ID ${employee.id} has been deleted`);
    } else {
      console.log('Deletion cancelled');
    } 
    mainMenu();
  } 
}

// call the start function to start the program
start(); 
