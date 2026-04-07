'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endTime: string // ISO date string
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [ended, setEnded] = useState(false)
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    function update() {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('Ended')
        setEnded(true)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setUrgent(days === 0 && hours < 6)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  if (ended) {
    return <span className="text-gray-500 font-medium">Ended</span>
  }

  return (
    <span className={`font-mono font-bold ${urgent ? 'text-red-accent' : 'text-navy'}`}>
      {timeLeft}
    </span>
  )
}
