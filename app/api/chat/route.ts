import { createUIMessageStream, createUIMessageStreamResponse, generateId } from 'ai'
import { join } from 'node:path'
import { GenerativeAiInferenceClient, models, requests } from 'oci-generativeaiinference'
import {
  ConfigFileAuthenticationDetailsProvider,
  NoRetryConfigurationDetails,
} from 'oci-common'
import * as serpapi from 'serpapi'
import {
  studentProfile,
  availableCourses,
  meetsPrerequisites,
  getReviewsForCourse,
  getAverageRating,
  getRemainingRequirements,
  checkScheduleConflict,
  calendarEvents,
} from '@/lib/data'

export const maxDuration = 30

// OCI config: use project .oci/config if present, else ~/.oci/config
const CONFIG_LOCATION =
  process.env.OCI_CONFIG_LOCATION ??
  join(process.cwd(), '.oci', 'config')
const CONFIG_PROFILE = process.env.OCI_CONFIG_PROFILE ?? 'DEFAULT'
const COMPARTMENT_ID = "ocid1.tenancy.oc1..aaaaaaaaloqxfso4y4fro7q7f3dtsx3s2a4qupoqaieqvl4t536hstvvflxa";
const ENDPOINT = "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com";
const MODEL_ID = "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyavwtf4vi3u7mpzniugmfbinljhtnktexnmnikwolykzma";

const systemPrompt = `You are CourseFlow, an AI course scheduling assistant for university students. You help students plan their course schedules by understanding their degree requirements, checking for conflicts, and providing insights from course reviews.

## Student Profile
- Name: ${studentProfile.name}
- Year: ${studentProfile.year}
- Major(s): ${studentProfile.majors.join(', ')}
- Minor(s): ${studentProfile.minors.join(', ')}
- GPA: ${studentProfile.gpa}
- Credits Completed: ${studentProfile.totalCredits}/${studentProfile.requiredCredits}
- Current Courses: ${studentProfile.currentCourses.map(c => c.code + ' - ' + c.name).join(', ')}

## Completed Courses
${studentProfile.completedCourses.map(c => `- ${c.code}: ${c.name} (${c.grade})`).join('\n')}

## Guidelines
- Be conversational and friendly - you're talking to college students.
- Give concrete, actionable advice about which courses to take and when.
- Consider workload balance when suggesting multiple courses together.
- Keep responses concise but thorough.
- When the student asks for a list of all courses or what's available, you will receive the full catalog in the context below—use it to answer. When they ask about a specific course, you will receive prerequisites, ratings, and reviews in the context below.
- If you don't have information about something outside the course catalog (like current events, recent news, or external information), you can request a web search by saying "I need to search for more information about [topic]". The system will perform a Google search and provide you with the results.`

// AI SDK useChat sends messages with `parts` (not content)
type UIMessage = {
  id?: string
  role: 'user' | 'assistant' | 'system'
  parts?: Array<{ type: string; text?: string }>
  content?: Array<{ type: string; text?: string }> // fallback for older shape
}

function getMessageText(msg: UIMessage): string {
  const parts = msg.parts ?? msg.content ?? []
  return parts
    .filter((p): p is { type: string; text: string } => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text)
    .join('\n')
}

// Match course codes like "CS 470", "ECE 501", "MATH 301"
const COURSE_CODE_REGEX = /\b([A-Z]{2,4}\s*\d{3,4})\b/gi

function extractCourseCodes(text: string): string[] {
  const matches = text.match(COURSE_CODE_REGEX) ?? []
  const seen = new Set<string>()
  const codes: string[] = []
  for (const m of matches) {
    const normalized = m.replace(/\s+/g, ' ').trim()
    const withSpace = normalized.includes(' ')
      ? normalized
      : normalized.replace(/([A-Z]{2,4})(\d{3,4})/i, '$1 $2')
    const found = availableCourses.find(
      (c) => c.code.toUpperCase() === withSpace.toUpperCase()
    )
    if (found && !seen.has(found.code)) {
      seen.add(found.code)
      codes.push(found.code)
    }
  }
  return codes
}

function buildCourseContext(courseCode: string): string {
  const course = availableCourses.find((c) => c.code === courseCode)
  if (!course) return ''

  const prereq = meetsPrerequisites(courseCode)
  const reviews = getReviewsForCourse(courseCode)
  const rating = getAverageRating(courseCode)

  const scheduleInfo = course.schedule && course.schedule.length > 0
    ? `Schedule:\n${course.schedule.map(s => `- ${s.days.join(', ')}: ${s.startTime}–${s.endTime}`).join('\n')}`
    : 'Schedule: Not available'

  return `
Course: ${course.code} - ${course.name}
${scheduleInfo}
Prerequisites Met: ${prereq.met}
Missing Prerequisites: ${prereq.missing.join(', ') || 'None'}

Average Rating: ${rating.toFixed(1)}/5
Recent Reviews:
${reviews.slice(0, 3).map((r) => `- ${r.comment}`).join('\n') || '(No reviews yet)'}
`.trim()
}

function isAskingForCourseList(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    /\b(all|list|show|give me|what are)\s+(the\s+)?(available\s+)?courses\b/.test(lower) ||
    /\b(available|offered)\s+courses\b/.test(lower) ||
    /\bcourse\s+catalog\b/.test(lower) ||
    /\bwhat\s+courses\s+(are\s+)?(available|offered)?\b/.test(lower)
  )
}

function buildFullCatalogContext(): string {
  return `## Full course catalog\n${availableCourses.map((c) => `- ${c.code}: ${c.name} (${c.credits} cr)`).join('\n')}`
}

function isAskingForRemainingRequirements(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    /\b(core\s+)?requirements?\s+(do\s+i\s+still\s+need|remaining|left)\b/.test(lower) ||
    /\bwhat\s+(core\s+)?(requirements?|do\s+i\s+still\s+need)\b/.test(lower) ||
    /\bremaining\s+(core\s+)?requirements?\b/.test(lower) ||
    /\bdegree\s+requirements?\s+(remaining|left|still)\b/.test(lower) ||
    /\bwhat\s+(courses?|credits?)\s+(do\s+i\s+still\s+need|remaining)\b/.test(lower)
  )
}

function buildRequirementsContext(): string {
  const remaining = getRemainingRequirements()
  return `## Remaining degree requirements

Remaining Core:
${remaining.remainingCore.map((c) => c.code + ' - ' + c.name).join('\n') || '(None - all core completed)'}

Electives Still Needed: ${remaining.remainingElectivesNeeded}

Elective options still available:
${remaining.electiveOptions.map((c) => `- ${c.code}: ${c.name}`).join('\n') || '(None)'}`.trim()
}

function isAskingAboutScheduleConflict(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    /\bconflict(s)?\s+(with\s+)?(my\s+)?schedule\b/.test(lower) ||
    /\b(does|do)\s+.+\s+conflict\b/.test(lower) ||
    /\bschedule\s+conflict\b/.test(lower) ||
    /\bconflict\s+with\s+(my\s+)?(calendar|schedule)\b/.test(lower)
  )
}

function buildConflictContext(courseCode: string): string {
  const course = availableCourses.find((c) => c.code === courseCode)
  if (!course || !course.schedule?.length) return ''

  const allConflicts: { title: string }[] = []
  const seen = new Set<string>()
  for (const slot of course.schedule) {
    const conflicts = checkScheduleConflict(
      slot.days,
      slot.startTime,
      slot.endTime,
      calendarEvents
    )
    for (const e of conflicts) {
      if (!seen.has(e.id)) {
        seen.add(e.id)
        allConflicts.push({ title: e.title })
      }
    }
  }

  const conflictList =
    allConflicts.length === 0
      ? 'None'
      : allConflicts.map((e) => e.title).join(', ')
  return `## Schedule conflict check: ${course.code} - ${course.name}\n\nConflicts: ${conflictList}`
}

function isAskingAboutCalendar(text: string): boolean {
  const lower = text.toLowerCase()

  return (
    /\bcalendar\b/.test(lower) ||
    /\bcalender\b/.test(lower) || // common misspelling
    /\bmy\s+schedule\b/.test(lower) ||
    /\bwhat\s+does\s+my\s+week\b/.test(lower) ||
    /\bhow\s+busy\b/.test(lower)
  )
}

async function performGoogleSearch(query: string): Promise<string> {
  // Next.js reads from .env.local or environment variables
  const serpApiKey = process.env.SERPAPI_KEY || process.env.NEXT_PUBLIC_SERPAPI_KEY
  if (!serpApiKey) {
    console.warn('SERPAPI_KEY not set. Available env vars:', Object.keys(process.env).filter(k => k.includes('SERP')))
    return 'Search unavailable: API key not configured. Please set SERPAPI_KEY in .env.local or export it before starting the server.'
  }

  try {
    const results = await serpapi.getJson({
      engine: 'google',
      q: query,
      api_key: serpApiKey,
      num: 5, // Get top 5 results
    })

    const organicResults = results.organic_results || []
    if (organicResults.length === 0) {
      return 'No search results found.'
    }

    const formattedResults = organicResults
      .map((result: any, idx: number) => {
        return `${idx + 1}. ${result.title || 'Untitled'}
   URL: ${result.link || 'N/A'}
   ${result.snippet || result.about_this_result?.text || 'No description available'}`
      })
      .join('\n\n')

    return `## Google Search Results for: "${query}"

${formattedResults}`
  } catch (error) {
    console.error('Search error:', error)
    return `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

function needsWebSearch(text: string): boolean {
  const lower = text.toLowerCase()
  // Explicit search requests
  if (
    /\b(search|google|look up|find information about)\b/.test(lower) ||
    /\bneed (more )?information (on|about|regarding)\b/.test(lower) ||
    /\bwhat is\b.*\b(current|recent|latest|news|today)\b/.test(lower) ||
    /\bwhat are\b.*\b(current|recent|latest|news|today)\b/.test(lower) ||
    /\bwhat's\b.*\b(current|recent|latest|news|today)\b/.test(lower) ||
    /\bwhen did\b/.test(lower) ||
    /\bwho is\b/.test(lower) ||
    /\bhow much does\b/.test(lower) ||
    /\b(latest|recent|current|news|today)\b.*\b(news|updates|events)\b/.test(lower) ||
    /\bAI news\b/.test(lower) ||
    /\btech news\b/.test(lower) ||
    /\b(latest|recent|current)\b.*\b(courses|classes|programs)\b/.test(lower)
  ) {
    return true
  }
  return false
}

function extractSearchQuery(text: string, assistantResponse?: string): string | null {
  // If assistant explicitly requests search
  if (assistantResponse) {
    const searchMatch = assistantResponse.match(/I need to search for more information about (.+?)(?:\.|\?|$)/i)
    if (searchMatch) {
      return searchMatch[1].trim()
    }
    // Also check for "search for" patterns
    const searchForMatch = assistantResponse.match(/search for (.+?)(?:\.|\?|$)/i)
    if (searchForMatch) {
      return searchForMatch[1].trim()
    }
  }

  // Extract from user's question
  const lower = text.toLowerCase()
  
  // Patterns to extract search queries (order matters - more specific first)
  const patterns = [
    /(?:need (?:more )?information (?:on|about|regarding))\s+(.+?)(?:\?|$)/i,
    /(?:search|google|look up|find information about)\s+(.+?)(?:\?|$)/i,
    /what is (.+?)(?:\?|$)/i,
    /what are (.+?)(?:\?|$)/i,
    /what's (.+?)(?:\?|$)/i,
    /who is (.+?)(?:\?|$)/i,
    /when did (.+?)(?:\?|$)/i,
    /tell me about (.+?)(?:\?|$)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      let query = match[1].trim()
      // Clean up common prefixes
      query = query.replace(/^(the|a|an)\s+/i, '')
      return query
    }
  }

  // Fallback: use the whole question if it seems like a search query
  if (needsWebSearch(text)) {
    // Remove question words and clean up
    let query = text.replace(/\?$/, '').trim()
    query = query.replace(/^(i need (more )?information (on|about|regarding)|tell me about|what is|what are|what's|who is|when did|search for|google|look up|find information about)\s+/i, '')
    query = query.replace(/^(the|a|an)\s+/i, '')
    return query.trim() || null
  }

  return null
}

function buildCalendarContext(): string {
  // Group personal events by day
  const byDay: Record<string, Array<{ title: string; startTime: string; endTime: string; type: string }>> = {}
  for (const e of calendarEvents) {
    if (!byDay[e.day]) byDay[e.day] = []
    byDay[e.day].push({ title: e.title, startTime: e.startTime, endTime: e.endTime, type: e.type })
  }
  
  // Add current courses to the calendar
  for (const currentCourse of studentProfile.currentCourses) {
    const course = availableCourses.find((c) => c.code === currentCourse.code)
    if (course && course.schedule) {
      for (const slot of course.schedule) {
        for (const day of slot.days) {
          if (!byDay[day]) byDay[day] = []
          byDay[day].push({
            title: `${course.code} - ${course.name}`,
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: 'course',
          })
        }
      }
    }
  }
  
  // Sort events within each day by start time
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }
  for (const day in byDay) {
    byDay[day].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  }
  
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const lines: string[] = ['## Student calendar (current courses + weekly recurring events)']
  for (const day of daysOrder) {
    const events = byDay[day]
    if (!events?.length) continue
    lines.push(`\n### ${day}`)
    for (const e of events) {
      lines.push(`- ${e.title}: ${e.startTime}–${e.endTime} (${e.type})`)
    }
  }
  return lines.join('\n').trim()
}

function convertToOciMessages(
  messages: UIMessage[],
  courseContext?: string
): Array<{ role: string; content: Array<{ type: string; text?: string }> }> {
  const ociMessages: Array<{
    role: string
    content: Array<{ type: string; text?: string }>
  }> = []

  const systemText = courseContext
    ? `${systemPrompt}\n\n## Context for mentioned course(s)\n${courseContext}`
    : systemPrompt

  ociMessages.push({
    role: 'SYSTEM',
    content: [{ type: 'TEXT', text: systemText }],
  })

  for (const msg of messages) {
    if (msg.role === 'system') continue // already have SYSTEM above
    const text = getMessageText(msg)?.trim()
    if (!text) continue

    ociMessages.push({
      role: msg.role.toUpperCase(), // USER or ASSISTANT
      content: [{ type: 'TEXT', text }],
    })
  }

  return ociMessages
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const stream = createUIMessageStream({
    originalMessages: messages,
    async execute({ writer }) {
      try {
        const provider = new ConfigFileAuthenticationDetailsProvider(
          CONFIG_LOCATION,
          CONFIG_PROFILE
        )
        const client = new GenerativeAiInferenceClient({
          authenticationDetailsProvider: provider,
        })
        client.endpoint = ENDPOINT

        const servingMode: models.OnDemandServingMode = {
          modelId: MODEL_ID,
          servingType: 'ON_DEMAND',
        }

        const lastUserText = getMessageText(
          messages.filter((m: UIMessage) => m.role === 'user').slice(-1)[0]
        ) || ''
        const courseCodes = extractCourseCodes(lastUserText)
        const contextParts: string[] = []
        if (courseCodes.length > 0) {
          contextParts.push(courseCodes.map(buildCourseContext).join('\n\n---\n\n'))
        }
        if (isAskingForCourseList(lastUserText)) {
          contextParts.push(buildFullCatalogContext())
        }
        if (isAskingForRemainingRequirements(lastUserText)) {
          contextParts.push(buildRequirementsContext())
        }
        if (isAskingAboutScheduleConflict(lastUserText) && courseCodes.length > 0) {
          contextParts.push(
            courseCodes.map(buildConflictContext).filter(Boolean).join('\n\n---\n\n')
          )
        }
        if (isAskingAboutCalendar(lastUserText)) {
          contextParts.push(buildCalendarContext())
        }

        // Check if web search is needed
        let searchResults: string | null = null
        if (needsWebSearch(lastUserText)) {
          const searchQuery = extractSearchQuery(lastUserText)
          console.log(`needsWebSearch=true, extracted query: ${searchQuery}`)
          if (searchQuery) {
            console.log(`Performing proactive search for: ${searchQuery}`)
            searchResults = await performGoogleSearch(searchQuery)
            contextParts.push(searchResults)
          } else {
            console.log(`needsWebSearch=true but extractSearchQuery returned null`)
          }
        } else {
          console.log(`needsWebSearch=false for: "${lastUserText}"`)
        }

        const courseContext = contextParts.length > 0 ? contextParts.join('\n\n---\n\n') : undefined

        console.log("Context injected:\n", courseContext || '(none)')

        const ociMessages = convertToOciMessages(messages, courseContext)

        if (ociMessages.length === 0) {
          throw new Error(
            'No messages to send. Expected at least one user message. (Check that the request sends messages with parts[].type === "text".)'
          )
        }

        const chatRequest: requests.ChatRequest = {
          chatDetails: {
            compartmentId: COMPARTMENT_ID,
            servingMode,
            chatRequest: {
              messages: ociMessages,
              apiFormat: 'GENERIC',
              maxTokens: 4000,
              temperature: 0.7,
              frequencyPenalty: 0,
              presencePenalty: 0,
              topK: 40,
              topP: 0.95,
            } as models.GenericChatRequest,
          },
          retryConfiguration: NoRetryConfigurationDetails,
        }

        const chatResponse = await client.chat(chatRequest)

        if (!chatResponse || chatResponse instanceof ReadableStream) {
          throw new Error('Unexpected OCI response format')
        }

        const chatResult = chatResponse.chatResult
        const genericResponse = chatResult.chatResponse as models.GenericChatResponse
        const textId = generateId()

        // Extract text from response (match structure from working oci-chat-test.ts)
        let text = ''
        const choice = genericResponse?.choices?.[0]
        const msg = choice?.message as { content?: Array<{ type?: string; text?: string }> } | undefined
        if (msg?.content?.length) {
          text = msg.content
            .filter((c) => (c.type === 'TEXT' || c.type === 'text') && 'text' in c)
            .map((c) => (c.text ?? '').toString())
            .join('')
        }

        // Check if assistant is requesting a search (if we didn't already search)
        if (text && !searchResults) {
          // Check if assistant is asking to search
          const isRequestingSearch = /I need to search/i.test(text) || /search for/i.test(text)
          if (isRequestingSearch) {
            // Use the original user question as the search query
            let searchQuery = extractSearchQuery(lastUserText) || lastUserText.replace(/\?$/, '').trim()
            // Clean up the query
            searchQuery = searchQuery.replace(/^(i need (more )?information (on|about|regarding)|tell me about|what is|what are|what's)\s+/i, '')
            searchQuery = searchQuery.replace(/^(the|a|an)\s+/i, '')
            searchQuery = searchQuery.trim()
            
            if (searchQuery && searchQuery.length > 2) {
              console.log(`Assistant requested search, using query: ${searchQuery}`)
              
              // Perform search
              const followUpSearchResults = await performGoogleSearch(searchQuery)
              
              // Continue conversation with search results
              const searchContext = `## Web Search Results\n\n${followUpSearchResults}`
              const updatedMessages = [
                ...messages,
                {
                  role: 'assistant' as const,
                  parts: [{ type: 'text', text }],
                },
                {
                  role: 'user' as const,
                  parts: [{ type: 'text', text: `Here are the search results:\n\n${searchContext}\n\nPlease provide a comprehensive answer based on these results.` }],
                },
              ]
              
              const updatedOciMessages = convertToOciMessages(updatedMessages, undefined)
              const followUpRequest: requests.ChatRequest = {
                chatDetails: {
                  compartmentId: COMPARTMENT_ID,
                  servingMode,
                  chatRequest: {
                    messages: updatedOciMessages,
                    apiFormat: 'GENERIC',
                    maxTokens: 4000,
                    temperature: 0.7,
                    frequencyPenalty: 0,
                    presencePenalty: 0,
                    topK: 40,
                    topP: 0.95,
                  } as models.GenericChatRequest,
                },
                retryConfiguration: NoRetryConfigurationDetails,
              }
              
              const followUpResponse = await client.chat(followUpRequest)
              if (!followUpResponse || followUpResponse instanceof ReadableStream) {
                throw new Error('Unexpected OCI response format')
              }
              
              const followUpResult = followUpResponse.chatResult
              const followUpGenericResponse = followUpResult.chatResponse as models.GenericChatResponse
              const followUpChoice = followUpGenericResponse?.choices?.[0]
              const followUpMsg = followUpChoice?.message as { content?: Array<{ type?: string; text?: string }> } | undefined
              
              let followUpText = ''
              if (followUpMsg?.content?.length) {
                followUpText = followUpMsg.content
                  .filter((c) => (c.type === 'TEXT' || c.type === 'text') && 'text' in c)
                  .map((c) => (c.text ?? '').toString())
                  .join('')
              }
              
              // Write initial response
              writer.write({ type: 'text-start', id: textId })
              writer.write({ type: 'text-delta', id: textId, delta: text + '\n\n' })
              writer.write({ type: 'text-end', id: textId })
              
              // Write follow-up response with search results
              if (followUpText) {
                const followUpId = generateId()
                writer.write({ type: 'text-start', id: followUpId })
                writer.write({ type: 'text-delta', id: followUpId, delta: followUpText })
                writer.write({ type: 'text-end', id: followUpId })
              }
              
              return
            }
          }
        }

        if (text) {
          writer.write({ type: 'text-start', id: textId })
          writer.write({ type: 'text-delta', id: textId, delta: text })
          writer.write({ type: 'text-end', id: textId })
        } else {
          writer.write({ type: 'text-start', id: textId })
          writer.write({
            type: 'text-delta',
            id: textId,
            delta: 'I apologize, but I was unable to generate a response. Please try again.',
          })
          writer.write({ type: 'text-end', id: textId })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        writer.write({ type: 'error', errorText: errorMessage })
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}
