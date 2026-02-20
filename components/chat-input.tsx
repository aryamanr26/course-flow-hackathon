'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
  status: string
}

export function ChatInput({ onSend, disabled, status }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <div className="border-t border-border/50 bg-background/80 backdrop-blur-lg px-4 py-3">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <div className="relative flex items-end gap-2 rounded-xl border border-border/50 bg-card px-3 py-2 shadow-sm transition-colors focus-within:border-primary/40 focus-within:shadow-md">
          <Sparkles className="mb-2 size-4 shrink-0 text-primary/50" />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Thinking...' : 'Ask about courses, schedules, or reviews...'}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={cn(
              'mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg transition-all',
              input.trim() && !disabled
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-muted text-muted-foreground/30'
            )}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
          CourseFlow has access to your student profile, course catalog, reviews, and Google Calendar
        </p>
      </form>
    </div>
  )
}
