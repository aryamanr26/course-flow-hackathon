'use client'

import { useState, useRef } from 'react'
import { Upload, Calendar as CalendarIcon, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/lib/data'

interface CalendarUploadProps {
  onImport: (events: CalendarEvent[]) => void
}

export function CalendarUpload({ onImport }: CalendarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.ics')) {
      setError('Please upload a .ics file (Google Calendar export).')
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/calendar/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import calendar')
      }

      const imported: CalendarEvent[] = (data.events || []).map((e: any, idx: number) => ({
        id: `gcal-${Date.now()}-${idx}`,
        title: e.title,
        day: e.day,
        startTime: e.startTime,
        endTime: e.endTime,
        recurring: !!e.recurring,
        type: e.type,
      }))

      onImport(imported)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import calendar')
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div className="mb-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".ics"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex items-center gap-1.5',
            success && 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
          )}
        >
          {isUploading ? (
            <>
              <Upload className="size-3.5 animate-pulse" />
              <span>Importing…</span>
            </>
          ) : success ? (
            <>
              <Check className="size-3.5" />
              <span>Imported</span>
            </>
          ) : (
            <>
              <CalendarIcon className="size-3.5" />
              <span>Import Google Calendar</span>
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-[10px] text-red-500 flex items-center gap-1">
          <X className="size-3" />
          <span>{error}</span>
        </p>
      )}
      <p className="text-[9px] text-sidebar-foreground/50">
        In Google Calendar: Settings → Import & export → <span className="font-semibold">Export</span>, then upload
        the <span className="font-mono">.ics</span> file here.
      </p>
    </div>
  )
}

