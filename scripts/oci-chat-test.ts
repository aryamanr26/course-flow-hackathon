/**
 * OCI Generative AI Chat - connection test (based on Oracle sample code).
 * Run from project root: npx tsx scripts/oci-chat-test.ts
 *
 * Uses project .oci/config by default. Set OCI_CONFIG_LOCATION to use another path.
 */

import { join } from 'node:path'
import { GenerativeAiInferenceClient, models, requests } from 'oci-generativeaiinference'
import {
  ConfigFileAuthenticationDetailsProvider,
  NoRetryConfigurationDetails,
} from 'oci-common'

const CONFIG_LOCATION = process.env.OCI_CONFIG_LOCATION ?? join(process.cwd(), '.oci', 'config')
const CONFIG_PROFILE = process.env.OCI_CONFIG_PROFILE ?? 'DEFAULT'
const COMPARTMENT_ID =
  process.env.OCI_COMPARTMENT_ID ??
  'ocid1.tenancy.oc1..aaaaaaaaloqxfso4y4fro7q7f3dtsx3s2a4qupoqaieqvl4t536hstvvflxa'
const ENDPOINT =
  'https://inference.generativeai.us-chicago-1.oci.oraclecloud.com'
const MODEL_ID =
  'ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyavwtf4vi3u7mpzniugmfbinljhtnktexnmnikwolykzma'

;(async () => {
  console.log('Config:', CONFIG_LOCATION)
  console.log('Profile:', CONFIG_PROFILE)
  console.log('Endpoint:', ENDPOINT)
  console.log('Model ID:', MODEL_ID)
  console.log('')

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
          {
            role: 'USER',
            content: [{ type: 'TEXT', text: 'Say hello in one short sentence.' }],
          },
        ],
        apiFormat: 'GENERIC',
        maxTokens: 100,
        temperature: 0.7,
        frequencyPenalty: 0,
        presencePenalty: 0,
        topK: 40,
        topP: 0.95,
      } as models.GenericChatRequest,
    },
    retryConfiguration: NoRetryConfigurationDetails,
  }

  try {
    const chatResponse = await client.chat(chatRequest)
    console.log('************************** Chat Response **************************')
    console.log(JSON.stringify(chatResponse, null, 2))
    console.log('')
    console.log('OK: OCI connection works and you are connected to the model.')
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
})()
