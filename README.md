# CourseFlow

AI course scheduling assistant for university students. Chat is powered by **OCI (Oracle Cloud Infrastructure) Generative AI**.

**Tested on:** WSL (Ubuntu recommended).

---

## Prerequisites

- WSL with Ubuntu (or similar Linux)
- OCI account and API key for chat (see [OCI setup](#oci-setup-optional))

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

## Commands reference

| Command        | Description              |
|----------------|--------------------------|
| `npm install`  | Install dependencies     |
| `npm run dev`  | Start dev server (3000)  |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |

---


