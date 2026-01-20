# Employee Password Change Feature

## Overview
Added a modal-based password change feature for employees to change their own passwords from the settings page.

## Implementation

### 1. Password Change Modal Component
**File**: `components/settings/change-password-modal.tsx`

- Modal dialog with three password fields:
  - Current password (for verification)
  - New password (minimum 6 characters)
  - Confirm new password
- Client-side validation:
  - Password length check (min 6 characters)
  - Password confirmation match
  - Current password required
- Loading state during API call
- Toast notifications for success/error
- Form resets on successful password change

### 2. Updated Settings Form
**File**: `components/settings/settings-form.tsx`

- Replaced inline password change form with modal button
- Simplified "Security" card with "Change Password" button
- Removed password state management from main form
- Cleaner UI with modal-based interaction

### 3. API Endpoint (Already Exists)
**File**: `app/api/user/password/route.ts`

- **Method**: PATCH
- **Authentication**: Requires logged-in user
- **Validation**: 
  - Verifies current password using bcrypt
  - Validates new password length
- **Security**: New password is hashed before storing

### 4. Available on All User Roles
The password change modal is available on:
- Employee settings: `/employee/settings`
- HR settings: `/hr/settings`
- Super Admin settings: `/super-admin/settings`

All three pages use the same `SettingsForm` component, so the feature is automatically available to all users.

## Usage

1. Navigate to Settings page
2. Find the "Security" card
3. Click "Change Password" button
4. Enter current password
5. Enter new password (min 6 characters)
6. Confirm new password
7. Click "Update Password"

## Security Features

- Current password verification required
- Password hashing with bcrypt (10 rounds)
- Client and server-side validation
- Secure API endpoint with authentication check
- User can only change their own password

## Differences from Admin Password Change

### Employee Self-Service (This Feature)
- Requires current password verification
- User can only change their own password
- Available in Settings page
- Uses modal dialog

### Admin Password Reset (Previous Feature)
- No current password required
- Admin can change any employee's password
- Available in employee detail pages
- Only for super_admin and hr roles
- Uses different API endpoint: `/api/employees/[id]/password`

## API Request Example

```bash
PATCH /api/user/password
Content-Type: application/json

{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

## Response

Success:
```json
{
  "success": true
}
```

Error:
```json
{
  "error": "Current password is incorrect"
}
```
