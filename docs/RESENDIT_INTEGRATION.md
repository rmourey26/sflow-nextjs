# Resend-It MCP OAuth 2.1 Integration

Complete integration guide for connecting SaverFlow with Resend-It's AI agents and workflows using OAuth 2.1 with PKCE.

## Features

- ✅ OAuth 2.1 with PKCE for secure authentication
- ✅ Automatic token refresh handling
- ✅ Execute AI agents with financial context
- ✅ Run automated workflows
- ✅ Webhook notifications with signature verification
- ✅ Comprehensive error handling
- ✅ MCP-enabled AI agent context

## Setup

### 1. Create Resend-It OAuth Client

1. Log in to your Resend-It account
2. Navigate to Settings > OAuth Clients
3. Click "Create OAuth Client"
4. Configure:
   - **Name**: SaverFlow Integration
   - **Redirect URIs**: `https://your-domain.com/api/resendit/callback`
   - **Scopes**: 
     - `execute_agents`
     - `execute_workflows`
     - `read_assets`
     - `write_assets`
     - `read_analytics`
5. Save your Client ID and Client Secret

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
RESENDIT_BASE_URL=https://app.resend-it.com
RESENDIT_CLIENT_ID=your_client_id
RESENDIT_CLIENT_SECRET=your_client_secret
RESENDIT_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Set Up Webhook

1. Navigate to Resend-It Settings > Webhooks
2. Create a new webhook:
   - **URL**: `https://your-domain.com/api/webhooks/resendit`
   - **Events**: Select all agent and workflow events
   - **Secret**: Save this in `RESENDIT_WEBHOOK_SECRET`

### 4. Run Database Migration

The webhook handler automatically creates notifications in your Supabase database.

## Usage

### Connect Integration

```tsx
import { ResendItIntegration } from '@/components/integrations/resendit-integration'

export default function SettingsPage() {
  const isConnected = // check if user has tokens
  
  return <ResendItIntegration isConnected={isConnected} />
}
```

### Execute AI Agent

```typescript
import { executeResendItAgent } from '@/lib/actions/resendit-agents'

const result = await executeResendItAgent({
  agentId: 'agent-123',
  prompt: 'Analyze my spending patterns for the last 3 months',
  assetIds: ['asset-456'], // Optional: attach financial data
  webhookUrl: 'https://your-app.com/webhook', // Optional: custom webhook
  metadata: {
    userId: 'user-789',
    requestId: 'req-abc'
  }
})

if (result.success) {
  console.log('Agent result:', result.data.result)
}
```

### Execute Workflow

```typescript
import { executeResendItWorkflow } from '@/lib/actions/resendit-agents'

const result = await executeResendItWorkflow({
  workflowId: 'workflow-123',
  input: {
    accountId: 'account-456',
    analysisType: 'full'
  }
})
```

### List Available Agents

```typescript
import { listResendItAgents } from '@/lib/actions/resendit-agents'

const { data, success } = await listResendItAgents()
if (success) {
  console.log('Available agents:', data)
}
```

## Architecture

### OAuth 2.1 Flow

1. User clicks "Connect Resend-It"
2. Generate PKCE code verifier and challenge
3. Store verifier and state in HTTP-only cookies
4. Redirect to Resend-It authorization page
5. User authorizes
6. Callback receives authorization code
7. Exchange code for access/refresh tokens
8. Store tokens in secure HTTP-only cookies

### Token Management

- Access tokens stored in HTTP-only cookies
- Automatic refresh before expiration
- Refresh tokens valid for 30 days
- All tokens secured with SameSite and Secure flags

### Webhook Security

- HMAC SHA-256 signature verification
- Timing-safe comparison
- Automatic notification creation
- Event type routing

## API Endpoints

### Initiate OAuth
`/api/resendit/auth` (handled by server action)

### OAuth Callback
`/api/resendit/callback`

### Webhook Handler
`/api/webhooks/resendit`

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  const result = await executeResendItAgent(params)
  if (!result.success) {
    console.error('Agent error:', result.error)
  }
} catch (error) {
  console.error('Execution failed:', error)
}
```

## Security Best Practices

1. Always verify webhook signatures
2. Use HTTP-only cookies for tokens
3. Enable HTTPS in production
4. Rotate client secrets regularly
5. Monitor API key usage
6. Use minimal required scopes

## Troubleshooting

### Connection Issues

- Verify CLIENT_ID and CLIENT_SECRET
- Check redirect URI matches exactly
- Ensure webhook URL is publicly accessible

### Token Errors

- Check token expiration
- Verify refresh token is valid
- Re-authenticate if refresh fails

### Webhook Verification Fails

- Verify WEBHOOK_SECRET matches
- Check signature header format
- Use raw request body for verification

## Support

For integration support:
- Resend-It Documentation: https://docs.resend-it.com
- SaverFlow Support: support@saverflow.com
