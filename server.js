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
    
  //connect to database
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
        '🔍 1.View All Departments',
        '🔍 2.View All Roles',
        '🔍 3.View All Employees',
        '📊 4.View Employees By Department',
        '👨 5.View Employees By Manager',
        '💰 6.View the total utilized budget of a department',
        '🆕 7.Add a Department',
        '❌ 8.Delete an Department',
        '🆕 9.Add a Role',
        '❌ 10.Delete an Role',
        '🆕 11.Add an Employee',
        '❌ 12.Delete an Employee',
        '🛠️ 13.Update an Employee Role',
        '🛠️ 14.Update Employee Manager',
        '🏃‍♂️ 15.Quit'  
      ]
    });

    // call the appropriate function based on the user's choice
    switch (choice) {
      case '🔍 1.View All Departments':
        viewAllDepartments();
        break;
      case '🔍 2.View All Roles':
        viewAllRoles();
        break;
      case '🔍 3.View All Employees':
        viewAllEmployees();
        break;
      case '📊 4.View Employees By Department':
        viewEmployeesByDepartment();
        break; 
      case '👨 5.View Employees By Manager':
        viewEmployeesByManager();
        break;
      case '💰 6.View the total utilized budget of a department':
        viewTotalUtilizedBudget();
        break;
      case '🆕 7.Add a Department':
        addDepartment();
        break;
      case '❌ 8.Delete an Department':
        deleteDepartment();
        break;
      case '🆕 9.Add a Role':
        addRole();
        break;
      case '❌ 10.Delete an Role':
        deleteRole();
        break;
      case '🆕 11.Add an Employee':
        addEmployee();
        break;
      case '❌ 12.Delete an Employee':
        deleteEmployee();
        break;
      case '🛠️ 13.Update an Employee Role':
        updateEmployeeRole();
        break;
      case '🛠️ 14.Update Employee Manager':
        updateEmployeeManager();
        break;
      case '🏃‍♂️ 15.Quit':
        connection.end();
        break;
    }
  }

  // start the program by calling the main menu
  mainMenu();

  // 1.view All Departments function
  async function viewAllDepartments() {
    const [rows, fields] = await connection.execute(`
      SELECT * FROM department
    `)
    .catch(error => console.log(error));
    console.table(rows);
    mainMenu();
  }

  // 2.view All Roles function
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
  
  // 3.view All Employees function
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
    
  // 4.view Employees By Department function
  async function viewEmployeesByDepartment() {
    const departments = await connection.execute(`
      SELECT * FROM department
    `)
    .catch(error => console.log(error));
    const departmentChoices = departments[0].map(({ id, name }) => ({
      name: name,
      value: id
    }));
    const { departmentId } = await inquirer.prompt({
      type: 'list',
      name: 'departmentId',
      message: 'Which department would you like to see the employees for?',
      choices: departmentChoices
    });
    const [rows, fields] = await connection.execute(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      WHERE department.id = ?
    `, [departmentId])
    .catch(error => console.log(error));
    console.table(rows);
    mainMenu();
  }
  
  // 5.view Employees By Manager function
  async function viewEmployeesByManager() {
    const managers = await connection.execute(`
      SELECT DISTINCT CONCAT(manager.first_name, ' ', manager.last_name) as manager
      FROM employee
      LEFT JOIN employee manager ON manager.id = employee.manager_id
    `)
    .catch(error => console.log(error));
    const managerChoices = managers[0].map(({ manager }) => ({
      name: manager,
      value: manager
    }));
    const { manager } = await inquirer.prompt({
      type: 'list',
      name: 'manager',
      message: 'Which manager would you like to see the employees for?',
      choices: managerChoices
    });
    const [rows, fields] = await connection.execute(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name as department, role.salary
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      LEFT JOIN employee manager ON manager.id = employee.manager_id
      WHERE CONCAT(manager.first_name, ' ', manager.last_name) = ?
    `, [manager])
    .catch(error => console.log(error));
    console.table(rows);
    mainMenu();
    

  }

  // 6.view Total Utilized Budget function
  async function viewTotalUtilizedBudget() { 
    const departments = await connection.execute(`
      SELECT * FROM department
    `)
    .catch(error => console.log(error));
    const departmentChoices = departments[0].map(({ id, name }) => ({
      name: name,
      value: id
    }));

    // Add the "View all departments" option to the departmentChoices array
    departmentChoices.push({ name: "View all departments", value: "ALL" });

    const { departmentId } = await inquirer.prompt({
      type: 'list',
      name: 'departmentId',
      message: 'Which department would you like to see the total utilized budget for?',
      choices: departmentChoices
    });

    if(departmentId === "ALL"){
      const [rows] = await connection.execute(`
      SELECT department.name as department, SUM(role.salary) as total_budget
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      GROUP by department.name
    `)
    .catch(error => console.log(error));
    console.table(rows);
    } else {
      const [rows, fields] = await connection.execute(`
      SELECT department.name as department, SUM(role.salary) as total_budget
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id
      LEFT JOIN department ON role.department_id = department.id
      WHERE department.id = ?
      GROUP by department.name
    `, [departmentId])
    .catch(error => console.log(error));
    console.table(rows);
    }
    
    mainMenu();
  }

  // 7.add Department function
  async function addDepartment() {
    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'What is the name of the department?',
      //capitalize the first letter of each word
      transformer: (input) => {
        return input.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');}
    });
    await connection.execute(`
      INSERT INTO department (name)
      VALUES (?)
    `, [name])
    .catch(error => console.log(error));
    console.log(`Added ${name} to the database`);
    mainMenu();
  }

  // 8.delete Department function
  async function deleteDepartment() {
    const departments = await connection.execute(`
      SELECT * FROM department
    `)
    .catch(error => console.log(error));
    const departmentChoices = departments[0].map(({ id, name }) => ({
      name: name,
      value: id
    }));
    const { departmentId } = await inquirer.prompt({
      type: 'list',
      name: 'departmentId',
      message: 'Which department would you like to delete?',
      choices: departmentChoices
    });
    await connection.execute(`
      DELETE FROM department
      WHERE id = ?
    `, [departmentId])
    .catch(error => console.log(error));
    console.log(`Removed department from the database`);
    mainMenu();
  }

  // 9.add Role function
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
        message: 'What is the name of the role?',
        // capitalize the first letter of each word
        transformer: (input) => {
            return input.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');}
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of the role?',
        validate: (input) => {
            if (!Number.isInteger(Number(input))) {
              return 'Please enter a valid salary number';
            }
            return true;
        }
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
  // 10.delete role function
  async function deleteRole() {
    const roles = await connection.execute(`
      SELECT * FROM role
    `)
    .catch(error => console.log(error));
    const roleChoices = roles[0].map(({ id, title }) => ({
      name: title,
      value: id
    }));
    const { roleId } = await inquirer.prompt({
      type: 'list',
      name: 'roleId',
      message: 'Which role do you want to delete?',
      choices: roleChoices
    });
    await connection.execute(`
      DELETE FROM role WHERE id = ?
    `, [roleId])
    .catch(error => console.log(error));
    console.log(`Deleted role from the database`);
    mainMenu();
  }
  
  // 11.add Employee function
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
        message: "What is the employee's first name?",
        transformer: (input) => {
            return input.charAt(0).toUpperCase() + input.slice(1);
        }
      },
      {
        type: 'input',
        name: 'last_name',
        message: "What is the employee's last name?",
        transformer: (input) => {
            return input.charAt(0).toUpperCase() + input.slice(1);
        }
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
  
  // 12.delete Employee function
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

  // 13.update Employee Role function
  async function updateEmployeeRole() {
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
        message: 'Which employee would you like to update?',
        choices: employeeChoices
      }
    ]);
  
    const roles = await connection.execute(`
      SELECT * FROM role
    `).catch(error => console.log(error));
  
    const roleChoices = roles[0].map(({ id, title }) => ({
      name: title,
      value: id
    }));
  
    const role = await inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Which role would you like to assign to the selected employee?',
        choices: roleChoices
      }
    ]);
  
    await connection.execute(`
      UPDATE employee SET role_id = ? WHERE id = ?
    `, [role.id, employee.id]).catch(error => console.log(error));
    console.log(`Employee with ID ${employee.id} has been updated`);
    mainMenu();
  }

  // 14.update Employee Manager function
  async function updateEmployeeManager() {
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
        message: 'Which employee would you like to update?',
        choices: employeeChoices
      }
    ]);
  
    const managerChoices = employeeChoices.filter(employeeChoice => employeeChoice.value !== employee.id);
  
    const manager = await inquirer.prompt([
      {
        type: 'list',
        name: 'id',
        message: 'Which manager would you like to assign to the selected employee?',
        choices: managerChoices
      }
    ]);
  
    await connection.execute(`
      UPDATE employee SET manager_id = ? WHERE id = ?
    `, [manager.id, employee.id]).catch(error => console.log(error));
    console.log(`Employee with ID ${employee.id} has been updated`);
    mainMenu();
  }




}


// call the start function to start the program
start(); 
