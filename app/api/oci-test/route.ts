import { join } from 'node:path'
import { GenerativeAiInferenceClient, models, requests } from 'oci-generativeaiinference'
import {
  ConfigFileAuthenticationDetailsProvider,
  NoRetryConfigurationDetails,
} from 'oci-common'

const CONFIG_LOCATION =
  process.env.OCI_CONFIG_LOCATION ?? join(process.cwd(), '.oci', 'config')
const CONFIG_PROFILE = process.env.OCI_CONFIG_PROFILE ?? 'DEFAULT'
const COMPARTMENT_ID =
  process.env.OCI_COMPARTMENT_ID ??
  'ocid1.tenancy.oc1..aaaaaaaaloqxfso4y4fro7q7f3dtsx3s2a4qupoqaieqvl4t536hstvvflxa'
const ENDPOINT =
  process.env.OCI_GENERATIVE_AI_ENDPOINT ??
  'https://inference.generativeai.us-chicago-1.oci.oraclecloud.com'
const MODEL_ID =
  process.env.OCI_MODEL_ID ??
  'ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyavwtf4vi3u7mpzniugmfbinljhtnktexnmnikwolykzma'

/**
 * GET /api/oci-test
 * Verifies OCI config and Generative AI connection.
 */
export async function GET() {
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

    const chatRequest: requests.ChatRequest = {
      chatDetails: {
        compartmentId: COMPARTMENT_ID,
        servingMode,
        chatRequest: {
          messages: [
            { role: 'USER', content: [{ type: 'TEXT', text: 'Reply with exactly: OK' }] },
          ],
          apiFormat: 'GENERIC',
          maxTokens: 10,
        } as models.GenericChatRequest,
      },
      retryConfiguration: NoRetryConfigurationDetails,
    }

    const response = await client.chat(chatRequest)

    if (!response || response instanceof ReadableStream) {
      return Response.json(
        { ok: false, error: 'Unexpected OCI response format' },
        { status: 502 }
      )
    }

    const result = response.chatResult?.chatResponse as models.GenericChatResponse
    const text = result?.choices?.[0]?.message?.content
      ?.filter((c): c is { type: string; text?: string } => c.type === 'TEXT' && 'text' in c)
      .map(c => c.text ?? '')
      .join('') ?? ''

    return Response.json({
      ok: true,
      message: 'Connected to OCI Generative AI',
      modelResponse: text.trim() || '(empty response)',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json(
      { ok: false, error: message },
      { status: 401 }
    )
  }
}
