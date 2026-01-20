# Database Scripts

## Quick Start

To set up the database with initial data, run:

```bash
npm run seed:all
```

This will create departments and the super admin user.

## Individual Scripts

### Seed Departments

Creates initial departments in the database.

```bash
npm run seed:departments
```

**Departments created:**
- Engineering
- Human Resources
- Finance
- Marketing
- Sales
- Operations
- Customer Support
- Product

### Seed Super Admin

This script creates a super admin user in the database.

```bash
npm run seed:admin
```

**Credentials:**
- **Email**: hassank1751@gmail.com
- **Password**: oyehoye213
- **Role**: super_admin

## What the scripts do

### seed:departments
1. Checks if each department already exists
2. Creates departments that don't exist
3. Displays all available departments with their IDs

### seed:admin
1. Checks if a user with the email already exists
2. If not, creates a new user with:
   - Hashed password using bcrypt
   - Role set to `super_admin`
   - Status set to `active`
3. Displays the created user details

## Notes

- All scripts are idempotent - running them multiple times won't create duplicates
- Make sure your `.env` file has the correct `DATABASE_URL` before running
- Passwords are securely hashed using bcrypt with 10 salt rounds
- You must seed departments before creating employees (employees require a valid department_id)

## Creating Employees

After running the seed scripts, you can create employees through the web interface:

1. Login with the super admin credentials
2. Navigate to Employees → Add Employee
3. Select a department from the dropdown (now populated with seeded departments)
4. Fill in the employee details
5. Submit the form
