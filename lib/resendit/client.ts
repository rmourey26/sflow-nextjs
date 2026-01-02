import crypto from "crypto"

const RESENDIT_BASE_URL = process.env.RESENDIT_BASE_URL || "https://app.resend-it.com"
const CLIENT_ID = process.env.RESENDIT_CLIENT_ID!
const CLIENT_SECRET = process.env.RESENDIT_CLIENT_SECRET!

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url")
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url")
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${RESENDIT_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Token refresh failed: ${error.message || response.statusText}`)
  }

  return response.json()
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export class ResendItClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry = 0

  constructor(tokens?: { accessToken: string; refreshToken: string; expiresIn?: number }) {
    if (tokens) {
      this.accessToken = tokens.accessToken
      this.refreshToken = tokens.refreshToken
      this.tokenExpiry = Date.now() + (tokens.expiresIn || 3600) * 1000
    }
  }

  async ensureValidToken(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry - 300000) {
      if (this.refreshToken) {
        const tokens = await refreshAccessToken(this.refreshToken)
        this.accessToken = tokens.access_token
        this.tokenExpiry = Date.now() + tokens.expires_in * 1000
      } else {
        throw new Error("No valid access token or refresh token available")
      }
    }
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    await this.ensureValidToken()

    const response = await fetch(`${RESENDIT_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (response.status === 401 && this.refreshToken) {
      // Token expired, refresh and retry
      const tokens = await refreshAccessToken(this.refreshToken)
      this.accessToken = tokens.access_token
      this.tokenExpiry = Date.now() + tokens.expires_in * 1000

      return fetch(`${RESENDIT_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      })
    }

    return response
  }

  async executeAgent(
    agentId: string,
    params: {
      prompt: string
      assetIds?: string[]
      dataStreamIds?: string[]
      webhookUrl?: string
      metadata?: Record<string, any>
    },
  ) {
    const response = await this.request(`/api/v1/agents/${agentId}/execute`, {
      method: "POST",
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Agent execution failed")
    }

    return response.json()
  }

  async executeWorkflow(
    workflowId: string,
    params: {
      input?: Record<string, any>
      webhookUrl?: string
      metadata?: Record<string, any>
    },
  ) {
    const response = await this.request(`/api/v1/workflows/${workflowId}/execute`, {
      method: "POST",
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Workflow execution failed")
    }

    return response.json()
  }

  async getAgents() {
    const response = await this.request("/api/v1/agents")
    if (!response.ok) throw new Error("Failed to fetch agents")
    return response.json()
  }

  async getWorkflows() {
    const response = await this.request("/api/v1/workflows")
    if (!response.ok) throw new Error("Failed to fetch workflows")
    return response.json()
  }

  async getAssets() {
    const response = await this.request("/api/v1/assets")
    if (!response.ok) throw new Error("Failed to fetch assets")
    return response.json()
  }
}
