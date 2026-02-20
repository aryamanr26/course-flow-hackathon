# CourseFlow

AI course scheduling assistant for university students. Chat is powered by **OCI (Oracle Cloud Infrastructure) Generative AI**.

**Tested on:** WSL (Ubuntu recommended).

---

## Prerequisites

- WSL with Ubuntu (or similar Linux)
- OCI account and API key for chat (see [OCI setup](#oci-setup-optional))
- SerpAPI key for web search (optional, see [SerpAPI setup](#serpapi-setup-optional))

---

## Quick start

### 1. Install Node.js via nvm (if needed)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
node -v
npm -v
```

### 2. Install and run the app

```bash
# Go to your project directory
cd /path/to/course-flow-hackathon

npm install
npm run dev
```

### 3. Open in browser

**http://localhost:3000**

---

## OCI setup (optional)

Chat uses **OCI Generative AI**. To enable it:

1. Create an OCI config and API key: [Oracle Cloud – Config and API Key](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm).
2. In the project root, create a `.oci` folder and add:
   - `config` – your OCI config (user, fingerprint, tenancy, region, `key_file` path).
   - Your `.pem` private key file.
3. In `config`, set `key_file` to the **full path** to the `.pem` file (e.g. `/home/you/course-flow-hackathon/.oci/your-key.pem`).

Without OCI config, the chat API will return an error when you send a message.

---

## SerpAPI setup (optional)

Web search functionality uses **SerpAPI** for Google searches. To enable it:

1. Sign up for a free account at [serpapi.com](https://serpapi.com)
2. Get your API key from the dashboard
3. Set the environment variable:
   ```bash
   export SERPAPI_KEY=your_api_key_here
   ```
   Or create a `.env.local` file in the project root:
   ```
   SERPAPI_KEY=your_api_key_here
   ```

Without SerpAPI key, web search will be unavailable but the chat will still work for course-related queries.

---

## Commands reference

| Command        | Description              |
|----------------|--------------------------|
| `npm install`  | Install dependencies     |
| `npm run dev`  | Start dev server (3000)  |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |

---


