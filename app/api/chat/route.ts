import { createUIMessageStream, createUIMessageStreamResponse, generateId } from 'ai'
import { join } from 'node:path'
import { GenerativeAiInferenceClient, models, requests } from 'oci-generativeaiinference'
import {
  ConfigFileAuthenticationDetailsProvider,
  NoRetryConfigurationDetails,
} from 'oci-common'
import { studentProfile } from '@/lib/data'

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
- Note: You do not have access to tools in this mode. Suggest that students explore the course catalog and reviews panels for detailed course information.`

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

function convertToOciMessages(messages: UIMessage[]): Array<{ role: string; content: Array<{ type: string; text?: string }> }> {
  const ociMessages: Array<{
    role: string
    content: Array<{ type: string; text?: string }>
  }> = []

  // Always include system prompt at the top (student profile + guidelines)
  ociMessages.push({
    role: 'SYSTEM',
    content: [{ type: 'TEXT', text: systemPrompt }],
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

        const ociMessages = convertToOciMessages(messages)

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
