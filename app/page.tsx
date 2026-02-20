'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Menu, BookOpen, MessageSquare, Star } from 'lucide-react'
import { StudentSidebar } from '@/components/student-sidebar'
import { ChatMessage, WelcomeScreen } from '@/components/chat-messages'
import { ChatInput } from '@/components/chat-input'
import { CourseCatalog } from '@/components/course-catalog'
import { CourseReviewsPanel } from '@/components/course-reviews'
import { useCalendar } from '@/lib/calendar-store'

const transport = new DefaultChatTransport({ api: '/api/chat' })

type ActiveView = 'chat' | 'catalog' | 'reviews'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState<ActiveView>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { events: calendarEvents } = useCalendar()

  const { messages, sendMessage, status } = useChat({
    transport,
  })

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = (text: string) => {
    sendMessage(
      { text },
      {
        body: {
          calendarEvents: calendarEvents,
        },
      }
    )
  }

  const handlePromptClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const button = target.closest('[data-prompt]') as HTMLElement | null
    if (button) {
      const prompt = button.getAttribute('data-prompt')
      if (prompt) handleSend(prompt)
    }
  }

  const isDisabled = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg hover:bg-muted transition-colors lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            <nav className="flex items-center gap-1 rounded-lg bg-muted/50 p-1" role="tablist">
              {[
                { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
                { id: 'catalog' as const, label: 'Catalog', icon: BookOpen },
                { id: 'reviews' as const, label: 'Reviews', icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeView === tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    activeView === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="size-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">Fall 2025 Enrollment</span>
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
          </div>
        </header>

        {/* Content Area */}
        {activeView === 'chat' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto" onClick={handlePromptClick}>
              {messages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                <div className="mx-auto max-w-3xl py-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isStreaming={status === 'streaming'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <ChatInput onSend={handleSend} disabled={isDisabled} status={status} />
          </div>
        )}

        {activeView === 'catalog' && <CourseCatalog />}
        {activeView === 'reviews' && <CourseReviewsPanel />}
      </div>
    </div>
  )
}
