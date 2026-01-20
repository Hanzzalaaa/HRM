"use client"

import { useEffect, useState } from "react"
import { Timer, Clock } from "lucide-react"

interface WorkTimerProps {
  checkInTime: string // ISO string or time string
  checkOutTime?: string
}

export function WorkTimer({ checkInTime, checkOutTime }: WorkTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('WorkTimer mounted with:', { checkInTime, checkOutTime })
    
    // Parse check-in time
    let checkInDate: Date
    
    try {
      // Always try parsing as Date first (handles ISO strings and Date objects)
      checkInDate = new Date(checkInTime)
      
      // Check if date is valid
      if (isNaN(checkInDate.getTime())) {
        console.error('Invalid date:', checkInTime)
        setError('Invalid check-in time')
        return
      }
      
      console.log('Parsed check-in date:', checkInDate.toLocaleString())
    } catch (err) {
      console.error('Error parsing check-in time:', err)
      setError('Failed to parse check-in time')
      return
    }

    // If checked out, calculate final time
    if (checkOutTime) {
      let checkOutDate: Date
      try {
        checkOutDate = new Date(checkOutTime)
        if (isNaN(checkOutDate.getTime())) {
          console.error('Invalid checkout date:', checkOutTime)
          return
        }
      } catch (err) {
        console.error('Error parsing checkout time:', err)
        return
      }
      
      const diffMs = checkOutDate.getTime() - checkInDate.getTime()
      const totalSeconds = Math.floor(diffMs / 1000)
      console.log('Checked out - total seconds:', totalSeconds)
      setElapsedSeconds(totalSeconds)
      setIsActive(false)
      return
    }

    // Active timer - update every second
    setIsActive(true)
    console.log('Starting active timer')
    
    const updateTimer = () => {
      const now = new Date()
      const diffMs = now.getTime() - checkInDate.getTime()
      const seconds = Math.floor(diffMs / 1000)
      setElapsedSeconds(seconds)
    }

    updateTimer() // Initial update
    const interval = setInterval(updateTimer, 1000)

    return () => {
      console.log('WorkTimer unmounting, clearing interval')
      clearInterval(interval)
    }
  }, [checkInTime, checkOutTime])

  if (error) {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <p className="text-xs text-red-500 mt-2">Check-in time: {checkInTime}</p>
      </div>
    )
  }

  const hours = Math.floor(elapsedSeconds / 3600)
  const minutes = Math.floor((elapsedSeconds % 3600) / 60)
  const seconds = elapsedSeconds % 60

  // Calculate shift progress (9 hours = 32400 seconds)
  const shiftDurationSeconds = 9 * 3600
  const progressPercentage = Math.min((elapsedSeconds / shiftDurationSeconds) * 100, 100)
  const remainingSeconds = Math.max(shiftDurationSeconds - elapsedSeconds, 0)
  const remainingHours = Math.floor(remainingSeconds / 3600)
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60)
  const isShiftComplete = elapsedSeconds >= shiftDurationSeconds

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      {/* Animated background for active timer */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
      )}
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-3 ${isActive ? 'bg-primary animate-pulse' : 'bg-primary/80'}`}>
              {isActive ? (
                <Timer className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Clock className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isActive ? '⏱️ Working Time' : '✅ Total Work Time'}
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-primary tabular-nums">
                  {String(hours).padStart(2, '0')}
                </span>
                <span className="text-2xl font-semibold text-primary/60">:</span>
                <span className="text-4xl font-bold text-primary tabular-nums">
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="text-2xl font-semibold text-primary/60">:</span>
                <span className="text-4xl font-bold text-primary tabular-nums">
                  {String(seconds).padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {hours > 0 && `${hours} hour${hours !== 1 ? 's' : ''} `}
                {minutes} minute{minutes !== 1 ? 's' : ''} 
                {!checkOutTime && ' and counting...'}
              </p>
            </div>
          </div>
          
          {isActive && (
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600">LIVE</span>
            </div>
          )}
        </div>

        {/* Shift Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {isShiftComplete ? '✅ Shift Complete!' : `${isActive ? 'Shift Progress' : 'Shift Duration'}`}
            </span>
            <span className={`font-medium ${isShiftComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
              {isShiftComplete 
                ? `+${hours - 9}h ${minutes}m overtime` 
                : isActive 
                  ? `${remainingHours}h ${remainingMinutes}m remaining`
                  : `${progressPercentage.toFixed(0)}% of 9h shift`
              }
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                isShiftComplete 
                  ? 'bg-green-500' 
                  : progressPercentage > 75 
                    ? 'bg-blue-500' 
                    : progressPercentage > 50 
                      ? 'bg-primary' 
                      : 'bg-primary/60'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

