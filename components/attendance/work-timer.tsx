"use client"

import { useEffect, useState } from "react"
import { Timer, Clock } from "lucide-react"

interface WorkTimerProps {
  checkInTime: string
  checkOutTime?: string
  shiftHours?: number
}

export function WorkTimer({ checkInTime, checkOutTime, shiftHours = 9 }: WorkTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const SHIFT_SECONDS = shiftHours * 3600

  useEffect(() => {
    setError(null)

    if (!checkInTime) {
      setError('No check-in time')
      return
    }

    const checkInDate = new Date(checkInTime)
    if (isNaN(checkInDate.getTime())) {
      setError('Invalid check-in time')
      return
    }

    if (checkOutTime) {
      const checkOutDate = new Date(checkOutTime)
      if (isNaN(checkOutDate.getTime())) return
      const diffMs = checkOutDate.getTime() - checkInDate.getTime()
      setElapsedSeconds(Math.max(0, Math.floor(diffMs / 1000)))
      setIsActive(false)
      return
    }

    setIsActive(true)

    const updateTimer = () => {
      const now = new Date()
      const diffMs = now.getTime() - checkInDate.getTime()
      setElapsedSeconds(Math.max(0, Math.floor(diffMs / 1000)))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [checkInTime, checkOutTime])

  if (error) {
    return (
      <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-center">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">Timer unavailable</p>
      </div>
    )
  }

  const remainingSeconds = Math.max(SHIFT_SECONDS - elapsedSeconds, 0)
  const isShiftComplete = elapsedSeconds >= SHIFT_SECONDS

  const displaySeconds = checkOutTime ? elapsedSeconds : remainingSeconds
  const hours = Math.floor(displaySeconds / 3600)
  const minutes = Math.floor((displaySeconds % 3600) / 60)
  const seconds = displaySeconds % 60

  const progressPercentage = Math.min((elapsedSeconds / SHIFT_SECONDS) * 100, 100)

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      {isActive && !isShiftComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
      )}

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-3 ${isActive && !isShiftComplete ? 'bg-primary animate-pulse' : 'bg-primary/80'}`}>
              {isActive && !isShiftComplete ? (
                <Timer className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Clock className="h-6 w-6 text-primary-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {checkOutTime 
                  ? '✅ Total Work Time' 
                  : isShiftComplete 
                    ? '✅ Shift Complete!' 
                    : '⏱️ Time Remaining'}
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
                {checkOutTime
                  ? `Worked ${Math.floor(elapsedSeconds / 3600)}h ${Math.floor((elapsedSeconds % 3600) / 60)}m`
                  : isShiftComplete
                    ? `Overtime: +${Math.floor((elapsedSeconds - SHIFT_SECONDS) / 3600)}h ${Math.floor(((elapsedSeconds - SHIFT_SECONDS) % 3600) / 60)}m`
                    : `${hours}h ${minutes}m remaining in shift`
                }
              </p>
            </div>
          </div>

          {isActive && !isShiftComplete && (
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600">LIVE</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Shift Progress ({shiftHours}h)</span>
            <span className={`font-medium ${isShiftComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
              {progressPercentage.toFixed(0)}%
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