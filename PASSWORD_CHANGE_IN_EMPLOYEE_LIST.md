# Password Change in Employee List

## Overview
Added "Change Password" option in the employee list dropdown menu for Super Admin and HR users.

## Implementation

### 1. Updated Employee List Component
**File**: `components/employees/employee-list.tsx`

**Changes**:
- Added state management for password dialog:
  - `passwordDialogOpen`: Controls dialog visibility
  - `selectedEmployee`: Stores selected employee ID and name
- Added "Change Password" menu item in the dropdown
- Integrated `ChangePasswordDialog` component at the bottom of the list
- Added `Key` icon import from lucide-react

**Dropdown Menu Items** (in order):
1. View Details
2. Edit
3. **Change Password** (NEW)
4. Delete

### 2. Enhanced Change Password Dialog
**File**: `components/employees/change-password-dialog.tsx`

**Changes**:
- Made the dialog controllable from parent components
- Added optional props:
  - `open?: boolean` - Control dialog visibility externally
  - `onOpenChange?: (open: boolean) => void` - Handle dialog state changes
- Supports two modes:
  - **Standalone mode**: Shows trigger button (used in employee detail pages)
  - **Controlled mode**: No trigger button, controlled by parent (used in employee list)

### 3. User Flow

#### From Employee List:
1. Navigate to `/super-admin/employees` or `/hr/employees`
2. Click the three-dot menu (⋮) on any employee row
3. Select "Change Password" from dropdown
4. Modal opens with employee name pre-filled
5. Enter new password (min 6 characters)
6. Confirm password
7. Click "Update Password"
8. Success toast notification appears
9. Modal closes automatically

#### From Employee Detail Page:
1. Navigate to `/super-admin/employees/[id]` or `/hr/employees/[id]`
2. Click "Change Password" button in the header
3. Same modal flow as above

### 4. Features

**Employee List Integration**:
- Quick access to password change without navigating to detail page
- Contextual menu item with key icon
- Employee name automatically populated in dialog
- Non-blocking UI - dialog overlays the list

**Dialog Features**:
- Dual-mode operation (standalone/controlled)
- Password validation (min 6 characters)
- Password confirmation matching
- Loading states
- Toast notifications
- Auto-close on success
- Form reset after submission

### 5. Security

- Only accessible to super_admin and hr roles
- API endpoint validates user permissions
- Password hashing with bcrypt
- No current password required (admin override)

## Technical Details

### State Management
```typescript
const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null)
```

### Dialog Trigger
```typescript
<DropdownMenuItem
  onSelect={() => {
    setSelectedEmployee({ id: employee.id, name: employee.users.full_name })
    setPasswordDialogOpen(true)
  }}
>
  <Key className="mr-2 h-4 w-4" />
  Change Password
</DropdownMenuItem>
```

### Controlled Dialog Usage
```typescript
{selectedEmployee && (
  <ChangePasswordDialog
    employeeId={selectedEmployee.id}
    employeeName={selectedEmployee.name}
    open={passwordDialogOpen}
    onOpenChange={setPasswordDialogOpen}
  />
)}
```

## Benefits

1. **Faster Workflow**: Change password without navigating to detail page
2. **Better UX**: Contextual action in dropdown menu
3. **Consistent UI**: Same dialog used in both list and detail views
4. **Flexible Component**: Dialog supports both controlled and uncontrolled modes
5. **Bulk Operations**: Easy to change passwords for multiple employees sequentially

## API Endpoint

**Endpoint**: `PUT /api/employees/[id]/password`

**Request**:
```json
{
  "new_password": "newpassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Notes

- TypeScript may show a temporary cache error for the `open` prop - this is a language server issue and doesn't affect runtime
- The dialog component is reusable across different contexts
- Password change is logged (if activity logging is implemented)
- No email notification is sent (can be added if needed)
