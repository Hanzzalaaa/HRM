# Password Change Feature for Admins

## Overview
Added the ability for Super Admin and HR users to change employee passwords directly from the employee view page.

## Implementation

### 1. API Endpoint
**File**: `app/api/employees/[id]/password/route.ts`

- **Method**: PUT
- **Authorization**: Only super_admin and hr roles can access
- **Validation**: 
  - Password must be at least 6 characters
  - Employee must exist
- **Security**: Password is hashed using bcryptjs before storing

### 2. UI Component
**File**: `components/employees/change-password-dialog.tsx`

- Modal dialog with password input fields
- Client-side validation:
  - Minimum 6 characters
  - Password confirmation match
- Loading state during API call
- Toast notifications for success/error

### 3. Integration
Updated employee view pages:
- `app/super-admin/employees/[id]/page.tsx`
- `app/hr/employees/[id]/page.tsx`

Added "Change Password" button between "Back to Employees" and "Edit Employee" buttons.

## Usage

1. Navigate to employee detail page: `/super-admin/employees/[id]` or `/hr/employees/[id]`
2. Click "Change Password" button
3. Enter new password (min 6 characters)
4. Confirm password
5. Click "Update Password"

## Security Features

- Role-based access control (super_admin and hr only)
- Password hashing with bcrypt (10 rounds)
- Client and server-side validation
- Secure API endpoint with authentication check

## API Request Example

```bash
PUT /api/employees/[employee-id]/password
Content-Type: application/json

{
  "new_password": "newpassword123"
}
```

## Response

Success:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

Error:
```json
{
  "error": "Password must be at least 6 characters long"
}
```
