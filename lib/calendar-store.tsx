'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { calendarEvents as defaultEvents, type CalendarEvent } from '@/lib/data'

type CalendarContextValue = {
  events: CalendarEvent[]
  importEvents: (newEvents: CalendarEvent[]) => void
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem('calendarEvents')
      if (stored) {
        const parsed = JSON.parse(stored) as CalendarEvent[]
        if (Array.isArray(parsed)) {
          setEvents(parsed)
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, [])

  // Persist to localStorage whenever events change
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem('calendarEvents', JSON.stringify(events))
    } catch {
      // ignore storage errors
    }
  }, [events])

  const importEvents = (newEvents: CalendarEvent[]) => {
    setEvents(prev => [...prev, ...newEvents])
  }

  return (
    <CalendarContext.Provider value={{ events, importEvents }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const ctx = useContext(CalendarContext)
  if (!ctx) {
    throw new Error('useCalendar must be used within CalendarProvider')
  }
  return ctx
}

