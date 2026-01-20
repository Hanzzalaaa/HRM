# HRM System Setup Guide

## Prerequisites

- Node.js installed
- PostgreSQL database (Neon or local)
- `.env` file configured with `DATABASE_URL`

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Database

Make sure your `.env` file has the correct database URL:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

### 3. Run Prisma Migrations

```bash
npx prisma migrate dev
```

Or if migrations are already applied:

```bash
npx prisma generate
```

### 4. Seed Initial Data

Run this command to create departments and super admin:

```bash
npm run seed:all
```

This will:
- Create 8 departments (Engineering, HR, Finance, Marketing, Sales, Operations, Customer Support, Product)
- Create a super admin user with credentials:
  - Email: `hassank1751@gmail.com`
  - Password: `oyehoye213`

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use).

## Login

Navigate to `http://localhost:3000/auth/login` and use the super admin credentials:

- **Email**: hassank1751@gmail.com
- **Password**: oyehoye213

## Creating Employees

1. Login as super admin
2. Navigate to **Employees** → **Add Employee**
3. Select a department from the dropdown (populated from database)
4. Fill in employee details
5. Submit the form

## Database Structure

The system uses Prisma ORM with PostgreSQL and includes:

- **Users**: Authentication and user profiles
- **Employees**: Employee records linked to users
- **Departments**: Organizational departments
- **Attendance**: Daily attendance tracking
- **Leaves**: Leave requests and approvals
- **Salaries**: Payroll records
- **Announcements**: Company-wide announcements
- **Activity Logs**: System activity tracking
- **Company Financials**: Financial records

## Features

### Super Admin
- Full access to all features
- Employee management (create, view, update)
- Department management
- Attendance tracking
- Leave management
- Payroll processing
- Financial tracking
- Activity logs
- Announcements

### HR
- Employee management
- Attendance tracking
- Leave approvals
- Payroll management
- Department management
- Announcements

### Employee
- View personal dashboard
- Check attendance
- Apply for leaves
- View salary details
- View announcements
- Update profile settings

## Troubleshooting

### Port Already in Use

If port 3000 is in use, Next.js will automatically use the next available port (3001, 3002, etc.).

### Database Connection Issues

Make sure your `DATABASE_URL` in `.env` is correct and the database is accessible.

### Missing Departments Error

If you get a foreign key constraint error when creating employees, run:

```bash
npm run seed:departments
```

### Prisma Client Issues

If you encounter Prisma client errors, regenerate the client:

```bash
npx prisma generate
```

## Additional Scripts

- `npm run seed:admin` - Create super admin only
- `npm run seed:departments` - Create departments only
- `npm run seed:all` - Create both departments and super admin
- `npx prisma studio` - Open Prisma Studio to view/edit database

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma 6
- **Authentication**: Cookie-based sessions with bcrypt
- **UI**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript
