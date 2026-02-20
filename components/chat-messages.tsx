'use client'

import type { UIMessage } from 'ai'
import { Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function getTextFromMessage(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

function ToolCallIndicator({ toolName }: { toolName: string }) {
  const toolLabels: Record<string, string> = {
    searchCourses: 'Searching courses...',
    getRequirements: 'Checking degree requirements...',
    checkConflicts: 'Checking calendar conflicts...',
    checkPrerequisites: 'Verifying prerequisites...',
    getCourseReviews: 'Looking up student reviews...',
    getCalendar: 'Loading your calendar...',
    buildSchedule: 'Building your schedule...',
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2 text-xs text-muted-foreground">
      <Loader2 className="size-3 animate-spin text-primary" />
      <span>{toolLabels[toolName] || `Using ${toolName}...`}</span>
    </div>
  )
}

function formatMarkdown(text: string) {
  // Split by double newlines for paragraphs
  const blocks = text.split(/\n\n+/)

  return blocks.map((block, blockIdx) => {
    const lines = block.split('\n').filter(Boolean)
    
    // Check if it's a list (all lines are list items)
    const listItems = lines.filter(l => l.match(/^[-*]\s/))
    if (listItems.length > 0 && listItems.length === lines.length) {
      return (
        <ul key={blockIdx} className="list-none flex flex-col gap-1.5 my-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-primary mt-0.5 shrink-0">{'>'}</span>
              <span>{formatInlineMarkdown(item.replace(/^[-*]\s/, ''))}</span>
            </li>
          ))}
        </ul>
      )
    }

    // Check numbered list (all lines are numbered items)
    const numberedItems = lines.filter(l => l.match(/^\d+\.\s/))
    if (numberedItems.length > 0 && numberedItems.length === lines.length) {
      return (
        <ol key={blockIdx} className="list-none flex flex-col gap-1.5 my-2">
          {numberedItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-primary font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
              <span>{formatInlineMarkdown(item.replace(/^\d+\.\s/, ''))}</span>
            </li>
          ))}
        </ol>
      )
    }

    // Check if block contains list items mixed with text (e.g., "Header: * item")
    // Split into parts: text before list, list items, text after list
    const parts: React.ReactNode[] = []
    let currentText: string[] = []
    
    for (const line of lines) {
      if (line.match(/^[-*]\s/)) {
        // Flush accumulated text as paragraph
        if (currentText.length > 0) {
          parts.push(
            <p key={`text-${parts.length}`} className="text-sm leading-relaxed my-1">
              {formatInlineMarkdown(currentText.join('\n'))}
            </p>
          )
          currentText = []
        }
        // Add list item
        parts.push(
          <div key={`item-${parts.length}`} className="flex gap-2 text-sm leading-relaxed my-0.5">
            <span className="text-primary mt-0.5 shrink-0">{'>'}</span>
            <span>{formatInlineMarkdown(line.replace(/^[-*]\s/, ''))}</span>
          </div>
        )
      } else {
        currentText.push(line)
      }
    }
    
    // Flush remaining text
    if (currentText.length > 0) {
      parts.push(
        <p key={`text-${parts.length}`} className="text-sm leading-relaxed my-1">
          {formatInlineMarkdown(currentText.join('\n'))}
        </p>
      )
    }
    
    if (parts.length > 0) {
      return <div key={blockIdx}>{parts}</div>
    }

    // Check if it's a heading (## or ###)
    const headingMatch = block.match(/^(#{1,3})\s(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const headingText = headingMatch[2]
      if (level === 1) return <h3 key={blockIdx} className="text-base font-bold mt-3 mb-1 text-foreground">{headingText}</h3>
      if (level === 2) return <h4 key={blockIdx} className="text-sm font-bold mt-3 mb-1 text-foreground">{headingText}</h4>
      return <h5 key={blockIdx} className="text-sm font-semibold mt-2 mb-1 text-foreground">{headingText}</h5>
    }

    // Regular paragraph
    return (
      <p key={blockIdx} className="text-sm leading-relaxed my-1">
        {formatInlineMarkdown(block)}
      </p>
    )
  })
}

function formatInlineMarkdown(text: string) {
  // Handle **bold**, *italic*, `code`, and inline bullet points (* item)
  // Process in order: bullet points first, then bold, then italic, then code
  let processed = text
  const parts: (string | React.ReactElement)[] = []
  let keyCount = 0

  // Pre-pass: convert inline bullet points (* item) to bullet elements
  // This handles cases like "Header: * item" within a paragraph
  const bulletRegex = /(\s|^)\*\s+([^\n*]+?)(?=\s*\*|\s*$|$)/g
  const bulletMatches: Array<{ start: number; end: number; text: string; prefix: string }> = []
  let match
  while ((match = bulletRegex.exec(processed)) !== null) {
    bulletMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[2],
      prefix: match[1] || '',
    })
  }

  // If we found bullet points, render them as a list
  if (bulletMatches.length > 0) {
    // Split text by bullet points and render accordingly
    let lastIndex = 0
    for (const bullet of bulletMatches) {
      // Add text before bullet
      if (bullet.start > lastIndex) {
        const beforeText = processed.substring(lastIndex, bullet.start + bullet.prefix.length)
        if (beforeText.trim()) {
          parts.push(beforeText)
        }
      }
      // Add bullet point
      parts.push(
        <span key={keyCount++} className="inline-flex items-start gap-1.5 my-0.5">
          <span className="text-primary mt-0.5 shrink-0">{'>'}</span>
          <span>{bullet.text.trim()}</span>
        </span>
      )
      lastIndex = bullet.end
    }
    // Add remaining text
    if (lastIndex < processed.length) {
      parts.push(processed.substring(lastIndex))
    }
    // Re-process the parts to handle bold/italic/code within them
    return parts.map((part, idx) => {
      if (typeof part === 'string') {
        return <span key={idx}>{formatInlineMarkdownWithoutBullets(part)}</span>
      }
      return part
    })
  }

  // No bullet points found, proceed with normal formatting
  return formatInlineMarkdownWithoutBullets(processed)
}

function formatInlineMarkdownWithoutBullets(text: string) {
  const parts: (string | React.ReactElement)[] = []
  let keyCount = 0

  // First pass: handle bold (**text**)
  const boldRegex = /\*\*(.+?)\*\*/g
  const boldMatches: Array<{ start: number; end: number; text: string }> = []
  let match
  while ((match = boldRegex.exec(text)) !== null) {
    boldMatches.push({ start: match.index, end: match.index + match[0].length, text: match[1] })
  }

  // Second pass: handle italic (*text*) - but skip if it's part of bold or a bullet point
  // Bullet points are * followed by space, so we exclude those
  const italicRegex = /\*([^*]+?)\*/g
  const italicMatches: Array<{ start: number; end: number; text: string }> = []
  while ((match = italicRegex.exec(text)) !== null) {
    // Check if this italic match overlaps with any bold match
    const overlapsBold = boldMatches.some(b => 
      match!.index >= b.start && match!.index < b.end
    )
    // Check if asterisk is immediately followed by space (bullet point marker like "* item")
    // This means the match content starts with a space
    const charAfterAsterisk = text[match.index + 1]
    const isBulletPoint = charAfterAsterisk === ' '
    
    if (!overlapsBold && !isBulletPoint) {
      italicMatches.push({ start: match.index, end: match.index + match[0].length, text: match[1] })
    }
  }

  // Third pass: handle code (`text`)
  const codeRegex = /`(.+?)`/g
  const codeMatches: Array<{ start: number; end: number; text: string }> = []
  while ((match = codeRegex.exec(text)) !== null) {
    codeMatches.push({ start: match.index, end: match.index + match[0].length, text: match[1] })
  }

  // Combine all matches and sort by position
  const allMatches = [
    ...boldMatches.map(m => ({ ...m, type: 'bold' as const })),
    ...italicMatches.map(m => ({ ...m, type: 'italic' as const })),
    ...codeMatches.map(m => ({ ...m, type: 'code' as const })),
  ].sort((a, b) => a.start - b.start)

  // Build the result
  let lastIndex = 0
  for (const m of allMatches) {
    // Add text before this match
    if (m.start > lastIndex) {
      parts.push(text.substring(lastIndex, m.start))
    }

    // Add the formatted element
    if (m.type === 'bold') {
      parts.push(<strong key={keyCount++} className="font-semibold text-foreground">{m.text}</strong>)
    } else if (m.type === 'italic') {
      parts.push(<em key={keyCount++} className="italic text-foreground">{m.text}</em>)
    } else if (m.type === 'code') {
      parts.push(
        <code key={keyCount++} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">
          {m.text}
        </code>
      )
    }

    lastIndex = m.end
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export function ChatMessage({ message, isStreaming }: { message: UIMessage; isStreaming: boolean }) {
  const isUser = message.role === 'user'
  const text = getTextFromMessage(message)

  // Check for tool invocations
  const toolParts = message.parts?.filter(
    (p) => p.type.startsWith('tool-') && !p.type.includes('result')
  ) || []

  return (
    <div className={cn('flex gap-3 px-4 py-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg',
          isUser ? 'bg-foreground/10' : 'bg-primary/10'
        )}
      >
        {isUser ? <User className="size-4 text-foreground/70" /> : <Bot className="size-4 text-primary" />}
      </div>

      <div className={cn('flex max-w-[85%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-foreground/[0.06] border border-border/50 px-4 py-2.5">
            <p className="text-sm leading-relaxed">{text}</p>
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-sm bg-card border border-border/50 px-4 py-3 shadow-sm">
            {text ? (
              <div className="prose-sm text-card-foreground">{formatMarkdown(text)}</div>
            ) : (
              toolParts.length === 0 && isStreaming && (
                <div className="flex items-center gap-2 py-1">
                  <div className="flex gap-1">
                    <span className="size-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Show active tool calls */}
        {!isUser && message.parts?.map((part, i) => {
          if (typeof part.type === 'string' && part.type.startsWith('tool-')) {
            const toolName = part.type.replace('tool-', '')
            const partWithState = part as { state?: string }
            if (partWithState.state === 'input-available' || partWithState.state === 'input-streaming') {
              return <ToolCallIndicator key={i} toolName={toolName} />
            }
          }
          return null
        })}
      </div>
    </div>
  )
}

export function WelcomeScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
        <Bot className="size-7 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2 text-center text-balance">
        Hey Alex, ready to plan your next semester?
      </h1>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
        I have access to your degree requirements, course catalog, student reviews, and your Google Calendar. Ask me anything about scheduling your courses.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {[
          { label: 'What courses do I still need?', desc: 'Check remaining requirements' },
          { label: 'Suggest my schedule for next semester', desc: 'Get personalized recommendations' },
          { label: 'Tell me about CS 410 Machine Learning', desc: 'Reviews and course details' },
          { label: 'What fits around my work schedule?', desc: 'Calendar-aware suggestions' },
        ].map((prompt) => (
          <button
            key={prompt.label}
            className="group flex flex-col items-start rounded-xl border border-border/50 bg-card p-3.5 text-left transition-all hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm"
            data-prompt={prompt.label}
          >
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {prompt.label}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">{prompt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
