# Employee ID Auto-Generation

## Overview

Employee IDs are now automatically generated in the format `EMP001`, `EMP002`, `EMP003`, etc. The system ensures unique IDs and handles concurrent requests safely.

## How It Works

### 1. Auto-Generation Logic

The system:
1. Queries the database for the latest employee ID starting with "EMP"
2. Extracts the numeric part (e.g., "EMP005" → 5)
3. Increments by 1
4. Formats with leading zeros (e.g., 6 → "EMP006")

### 2. Format

- **Pattern**: `EMP` + 3-digit number
- **Examples**: `EMP001`, `EMP002`, `EMP099`, `EMP100`
- **Range**: EMP001 to EMP999 (expandable)

### 3. Uniqueness

- Checked at database level (unique constraint)
- Validated before creation
- Transaction-safe (no race conditions)

## User Experience

### Creating New Employee

1. Navigate to **Employees** → **Add Employee**
2. Employee ID field is **auto-populated** with the next available ID
3. User can:
   - Keep the auto-generated ID
   - Click the refresh button (↻) to generate a new ID
   - Manually enter a custom ID (must follow EMP### format)

### Visual Indicators

- **Loading state**: Field shows pulse animation while generating
- **Disabled state**: Field is disabled during ID generation
- **Help text**: "Auto-generated. Click ↻ to generate a new ID."
- **Refresh button**: Click to get a new ID if needed

## API Endpoints

### GET `/api/employees/next-id`

Generates and returns the next available employee ID.

**Response:**
```json
{
  "success": true,
  "employee_id": "EMP003"
}
```

**Usage:**
```typescript
const response = await fetch('/api/employees/next-id')
const data = await response.json()
console.log(data.employee_id) // "EMP003"
```

### POST `/api/employees`

Creates a new employee. Employee ID is optional - will be auto-generated if not provided.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "employee_id": "EMP003", // Optional
  "department_id": "dept-uuid",
  // ... other fields
}
```

**Response:**
```json
{
  "success": true,
  "employee_id": "EMP003",
  "data": {
    "user": { /* user object */ },
    "employee": { /* employee object */ }
  }
}
```

## Code Implementation

### Utility Functions

Located in `lib/utils/employee-id-generator.ts`:

#### `generateEmployeeId()`
```typescript
const nextId = await generateEmployeeId()
// Returns: "EMP003"
```

#### `employeeIdExists(employeeId: string)`
```typescript
const exists = await employeeIdExists("EMP003")
// Returns: true or false
```

#### `isValidEmployeeIdFormat(employeeId: string)`
```typescript
const valid = isValidEmployeeIdFormat("EMP003")
// Returns: true

const invalid = isValidEmployeeIdFormat("EMP3")
// Returns: false
```

### Frontend Integration

The employee form automatically:
1. Fetches the next ID on component mount
2. Displays it in the input field
3. Allows manual override
4. Provides refresh functionality

```typescript
// Auto-fetch on mount
useEffect(() => {
  if (!employee) {
    fetchNextEmployeeId()
  }
}, [])

// Manual refresh
const fetchNextEmployeeId = async () => {
  const response = await fetch('/api/employees/next-id')
  const data = await response.json()
  setFormData(prev => ({ ...prev, employee_id: data.employee_id }))
}
```

## Edge Cases Handled

### 1. No Existing Employees
- First employee gets `EMP001`

### 2. Concurrent Requests
- Database unique constraint prevents duplicates
- Transaction ensures atomicity

### 3. Manual IDs
- Users can still enter custom IDs
- Must follow `EMP###` format
- Validated before creation

### 4. Gaps in Sequence
- If EMP002 is deleted, next ID is still EMP004
- Maintains sequential order
- No reuse of deleted IDs

### 5. Large Numbers
- Supports up to EMP999 by default
- Can be extended to 4+ digits if needed

## Customization

### Change Prefix

Edit `lib/utils/employee-id-generator.ts`:

```typescript
// Change "EMP" to "STAFF"
const nextId = `STAFF${String(nextNumber).padStart(3, '0')}`
```

### Change Number Length

```typescript
// Change from 3 to 4 digits (EMP0001)
const nextId = `EMP${String(nextNumber).padStart(4, '0')}`
```

### Different Format

```typescript
// Use year prefix (2024-001)
const year = new Date().getFullYear()
const nextId = `${year}-${String(nextNumber).padStart(3, '0')}`
```

## Testing

### Test Auto-Generation

1. Create first employee → Should get `EMP001`
2. Create second employee → Should get `EMP002`
3. Delete EMP002
4. Create third employee → Should get `EMP003` (not EMP002)

### Test Manual Override

1. Start creating employee
2. See auto-generated ID (e.g., `EMP005`)
3. Change to `EMP999`
4. Submit → Should create with `EMP999`
5. Next employee → Should get `EMP1000` or error if format limited

### Test Refresh Button

1. Start creating employee
2. Note the auto-generated ID
3. Click refresh button (↻)
4. Should see the same or next ID
5. Can click multiple times

## Benefits

✅ **No manual entry errors** - Eliminates typos and duplicates
✅ **Consistent format** - All IDs follow the same pattern
✅ **Sequential tracking** - Easy to see employee count
✅ **User-friendly** - Auto-populated but still customizable
✅ **Database-safe** - Unique constraint prevents conflicts
✅ **Scalable** - Handles concurrent requests properly

## Future Enhancements

Possible improvements:
- Department-specific prefixes (ENG001, HR001, etc.)
- Year-based numbering (2024-001, 2024-002)
- Custom format per organization
- Bulk ID generation for mass imports
- ID recycling option (reuse deleted IDs)
