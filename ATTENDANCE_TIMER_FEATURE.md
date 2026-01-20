# Attendance Timer Feature

## Overview
Added a live timer to the attendance section that displays the elapsed working time since check-in. The timer updates every second and shows hours, minutes, and seconds in real-time.

## Implementation

### 1. Work Timer Component
**File**: `components/attendance/work-timer.tsx`

**Features**:
- Live countdown timer that updates every second
- Shows elapsed time in HH:MM:SS format
- Two modes:
  - **Active Mode**: Live timer when employee is checked in (not checked out yet)
  - **Static Mode**: Shows total work time when employee has checked out
- Visual design with timer icon and primary color theme
- Automatic cleanup of interval on component unmount

**Timer Calculation**:
- Calculates time difference between check-in and current time (or check-out time)
- Handles edge cases like midnight crossover
- Updates every second for real-time display
- Format: `HH:MM:SS` (e.g., "08:45:23")

### 2. Updated Employee Attendance View
**File**: `components/attendance/employee-attendance-view.tsx`

**Changes**:
- Integrated `WorkTimer` component
- Timer appears above check-in/check-out controls
- Only shows when employee has checked in
- Automatically switches from live to static mode after check-out

### 3. User Experience

#### Before Check-In:
- No timer displayed
- Shows "Check In" button
- Check-in and check-out times show "--:--"

#### After Check-In (Active Timer):
- Live timer appears showing "Working Time"
- Timer counts up from 00:00:00
- Updates every second
- Shows "Check Out" button
- Check-in time displayed

#### After Check-Out (Static Timer):
- Timer shows "Total Work Time"
- Displays final work duration
- Timer is static (no longer updating)
- Shows status badge with work hours

## Visual Design

### Timer Display:
```
┌─────────────────────────────────┐
│ 🕐 Working Time                 │
│    08:45:23                     │
└─────────────────────────────────┘
```

**Styling**:
- Primary color theme (blue/accent color)
- Rounded border with subtle background
- Large, bold time display (2xl font)
- Timer icon for visual clarity
- Responsive design

## Technical Details

### Timer Logic
```typescript
// Calculate elapsed time between two time strings
function calculateElapsedTime(startTime: string, endTime: string): string {
  // Parse HH:MM:SS format
  // Calculate difference in seconds
  // Handle midnight crossover
  // Format as HH:MM:SS
}
```

### Update Mechanism
```typescript
useEffect(() => {
  if (checkOutTime) {
    // Static mode - show final time
    return
  }
  
  // Active mode - update every second
  const interval = setInterval(updateTimer, 1000)
  return () => clearInterval(interval)
}, [checkInTime, checkOutTime])
```

## Benefits

1. **Real-Time Feedback**: Employees see exactly how long they've been working
2. **Motivation**: Visual timer encourages productivity awareness
3. **Transparency**: Clear display of work hours
4. **Accuracy**: Second-by-second precision
5. **User-Friendly**: Intuitive display with clear labels
6. **Performance**: Efficient updates with proper cleanup

## Example Scenarios

### Scenario 1: Morning Check-In
- Employee checks in at 09:00:00
- Timer starts: 00:00:00
- After 1 hour: 01:00:00
- After 4.5 hours: 04:30:00
- Employee checks out at 13:30:00
- Timer shows final: 04:30:00

### Scenario 2: Late Check-In
- Employee checks in at 10:15:30
- Timer starts: 00:00:00
- Status marked as "late"
- Timer continues counting normally

### Scenario 3: Half Day
- Employee checks in at 09:00:00
- Works for 3 hours 45 minutes
- Checks out at 12:45:00
- Timer shows: 03:45:00
- Status automatically set to "half_day"

## Future Enhancements (Optional)

1. **Break Timer**: Track break time separately
2. **Overtime Alert**: Notify when exceeding standard hours
3. **Productivity Stats**: Show average work time per day/week
4. **Timer Notifications**: Browser notifications at specific intervals
5. **Pause/Resume**: Allow pausing timer for breaks
6. **Multiple Sessions**: Support multiple check-in/out per day

## Notes

- Timer uses client-side JavaScript for real-time updates
- No server calls during timer operation (efficient)
- Timer automatically stops when component unmounts
- Works across all modern browsers
- Handles timezone correctly (uses local time)
- No battery drain concerns (efficient 1-second interval)
