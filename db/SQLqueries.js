const db = require("../db/connection");
const inquirer = require("inquirer");
const mysql = require('mysql2')
const cTable = require("console.table");



function promptUser() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'Please select an option:',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update employee role',
                //'Delete a department',
                //'Delete a role',
                'Delete an employee',

                'Quit'
            ],
        },
    ])
        .then((response) => {
            // store response in a variable
            const { option } = response;

            if (option === 'View all departments') {
                viewDepartments();
            }
            if (option === 'View all roles') {
                viewRoles();
            }
            if (option === 'View all employees') {
                viewEmployees();
            }
            if (option === 'Add a department') {
                addDepartment();
            }
            if (option === 'Add a role') {
                addRole();
            }
            if (option === 'Add an employee') {
                addEmployee();
            }
            if (option === 'Update employee role') {
                updateEmployeeRole();
            }
            if (option === 'Delete a department') {
                deleteDepartment();
            }
            if (option === 'Delete a Role') {
                deleteRole();
            }
            if (option === 'Delete a Employee') {
                deleteEmployee();
            }

            if (option === 'Quit') {
                console.log("Goodbye, have a nice day!");
                return process.exit(0);
            }
        });


    function viewDepartments() {
        const sql = `SELECT * FROM department`;
        db.query(sql, (err, rows) => {
            if (err) throw err;
            console.table(rows);
            promptUser();
        });
    };

    function viewRoles() {
        const sql = `SELECT role.title, role.id, role.salary, department.name AS department_name
    FROM role
    LEFT JOIN department on role.department_id = department.id;
    `;
        db.query(sql, (err, rows) => {
            if (err) throw err;
            console.table(rows);
            promptUser();
        });
    };

    function viewEmployees() {
        const sql = `SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name AS department,
    CONCAT(m.first_name, ' ',m.last_name) AS Manager
    FROM employee
    LEFT JOIN employee m ON employee.manager_id = m.id
    LEFT JOIN role on employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    `;
        db.query(sql, (err, rows) => {
            if (err) throw err;
            console.table(rows);
            promptUser();
        });
    };

    function addDepartment() {
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "newDepartment",
                    message: "Enter the department you want to add:",
                    validate: (newDepartment) => {
                        if (newDepartment) {
                            return true;
                        } else {
                            console.log("Please enter a department.");
                            return false;
                        }
                    },
                },
            ])
            .then((input) => {
                const params = input.newDepartment;
                const sql = `INSERT INTO department (name)VALUES (?)`;
                db.query(sql, params, (err, result) => {
                    if (err) throw err;

                    viewDepartments();
                });
            });
    };

    function addRole() {
        const sql = `SELECT department.name, department.id
    FROM department`;

        db.query(sql, (err, data) => {
            if (err) throw err;

            const department = data.map(({ name, id }) => ({ name: name, value: id }));

            inquirer
                .prompt([
                    {
                        type: "input",
                        name: "newRole",
                        message: "Please enter role do you want to add:",
                        validate: (newRole) => {
                            if (newRole) {
                                return true;
                            } else {
                                console.log("Please enter a role.");
                                return false;
                            }
                        },
                    },
                    {
                        type: "input",
                        name: "salary",
                        message: "Enter salary for new role:",
                        validate: (salary) => {
                            if (salary) {
                                return true;
                            } else {
                                console.log("Please enter a salary.");
                                return false;
                            }
                        },
                    },
                    {
                        type: "list",
                        name: "choices",
                        message: "Please enter department for new role:",
                        choices: department,
                    },
                ])
                .then((input) => {
                    const params = [input.newRole, input.salary, input.choices];
                    const sql = `INSERT INTO role (title, salary, department_id)
                    VALUES (?,?,?)`;
                    db.query(sql, params, (err, result) => {
                        if (err) throw err;
                    });
                    viewRoles();
                });
        });
    };


    // prompt: first_name, last_name, role, manager
    function addEmployee() {
        // getting info from role table
        const sql = `SELECT role.title, role.id 
    FROM role`;

        db.query(sql, (err, data) => {
            if (err) throw err;

            const role = data.map(({ title, id }) => ({
                name: title,
                value: id,
            }));

            inquirer
                .prompt([
                    {
                        type: "input",
                        name: "firstName",
                        message: "Enter employee's first name:",
                        validate: (firstName) => {
                            if (firstName) {
                                return true;
                            } else {
                                console.log("Please employee's first name.");
                                return false;
                            }
                        },
                    },
                    {
                        type: "input",
                        name: "lastName",
                        message: "Enter employee's last name:",
                        validate: (lastName) => {
                            if (lastName) {
                                return true;
                            } else {
                                console.log("Please enter employee's last name.");
                                return false;
                            }
                        },
                    },
                    {
                        type: "list",
                        name: "choices",
                        message: "Enter employee's role:",
                        choices: role,
                    },
                    {
                        type: "input",
                        name: "managerID",
                        message: "Enter employee's manager's ID:",
                        validate: (managerID) => {
                            if (managerID) {
                                return true;
                            } else {
                                console.log("Please enter employee's manager's ID.");
                                return false;
                            }
                        },
                    },
                ])
                .then((input) => {
                    const params = [
                        input.firstName,
                        input.lastName,
                        input.choices,
                        input.managerID,
                    ];
                    const sql = `INSERT INTO employee (first_name, last_name, role_id ,manager_id)
                    VALUES (?,?,?,?)`;
                    db.query(sql, params, (err, result) => {
                        if (err) throw err;
                    });

                    viewEmployees();
                });
        });
    };

    // select: employee, new role 
    function updateEmployeeRole() {
        // getting info from employee table
        const sql = `SELECT employee.first_name, employee.last_name, employee.id
        FROM employee`;
        db.query(sql, (error, response) => {
            if (error) throw error;

            const employee = response.map(({ first_name, last_name, id }) => ({
                name: first_name + " " + last_name,
                value: id,
            }));

            //getting info from role table
            const sql = `SELECT role.id, role.title FROM role`;

            db.query(sql, (error, response) => {
                if (error) throw error;

                role = response.map(({ title, id }) => ({
                    name: title,
                    value: id,
                }));

                inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'employeeName',
                            message: 'Enter employee you would like to update:',
                            choices: employee
                        },
                        {
                            type: 'list',
                            name: 'role',
                            message: 'Enter new role for the employee:',
                            choices: role
                        }
                    ])
                    .then((answer) => {

                        let query = "Update employee SET role_id = ? where id = ?"
                        db.query(query, [answer.role, answer.employeeName], (error, response) => {
                            if (error) throw (error);
                            console.log("Employee role has been updated.");
                            promptUser();
                        })
                    });
            });
        });
    };



    deleteEmployee = () => {
        const employeeSql = `SELECT * FROM employee`;

        db.query(employeeSql, (err, result) => {
            if (err) throw err;

            const employees = result.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
            }));

            const deleteEmployeePrompt = [
                {
                    type: "list",
                    name: "deleteEmployee",
                    message: "What is the name of the employee, you would like to delete?",
                    choices: employees,
                },
            ];

            return inquirer.prompt(deleteEmployeePrompt).then((output) => {
                const params = [output.deleteEmployee];
                console.log(params);
                const sql = `DELETE FROM employee WHERE id = ?`;
                db.query(sql, params, (err, result) => {
                    if (err) throw err;
                });
                viewEmployees();
            });
        });
    };


};


module.exports = promptUser;
