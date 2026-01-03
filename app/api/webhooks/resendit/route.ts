import { type NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/resendit/client"
import { createServerClient } from "@/lib/supabase/server"

const WEBHOOK_SECRET = process.env.RESENDIT_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-resendit-signature")

  if (!signature) {
    console.error("[Resend-It] Missing webhook signature")
    return NextResponse.json({ error: "Missing signature" }, { status: 401 })
  }

  const payload = await request.text()

  if (!verifyWebhookSignature(payload, signature.replace("sha256=", ""), WEBHOOK_SECRET)) {
    console.error("[Resend-It] Invalid webhook signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  try {
    const event = JSON.parse(payload)
    console.log("[Resend-It] Webhook event received:", event.event)

    // Process webhook events
    switch (event.event) {
      case "agent.executed":
      case "agent.execution.completed":
        await handleAgentCompleted(event.data)
        break

      case "agent.failed":
      case "agent.execution.failed":
        await handleAgentFailed(event.data)
        break

      case "workflow.completed":
      case "workflow.execution.completed":
        await handleWorkflowCompleted(event.data)
        break

      case "workflow.failed":
      case "workflow.execution.failed":
        await handleWorkflowFailed(event.data)
        break

      case "asset.created":
      case "asset.updated":
        await handleAssetEvent(event.data)
        break

      default:
        console.log("[Resend-It] Unknown event type:", event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Resend-It] Webhook processing error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}

async function handleAgentCompleted(data: any) {
  console.log("[Resend-It] Agent completed:", {
    agentId: data.agentId || data.agent_id,
    executionId: data.executionId || data.execution_id,
    result: data.result?.substring(0, 100),
  })

  const supabase = await createServerClient()
  await supabase.from("notifications").insert({
    type: "resendit_agent_completed",
    title: "AI Agent Completed",
    message: `Agent ${data.agentName || data.agent_name || "execution"} completed successfully`,
    data: { executionId: data.executionId || data.execution_id },
    read: false,
  })
}

async function handleAgentFailed(data: any) {
  console.error("[Resend-It] Agent failed:", {
    agentId: data.agentId || data.agent_id,
    executionId: data.executionId || data.execution_id,
    error: data.error,
  })

  const supabase = await createServerClient()
  await supabase.from("notifications").insert({
    type: "resendit_agent_failed",
    title: "AI Agent Failed",
    message: `Agent execution failed: ${data.error}`,
    data: { executionId: data.executionId || data.execution_id },
    read: false,
  })
}

async function handleWorkflowCompleted(data: any) {
  console.log("[Resend-It] Workflow completed:", {
    workflowId: data.workflowId || data.workflow_id,
    executionId: data.executionId || data.execution_id,
  })

  const supabase = await createServerClient()
  await supabase.from("notifications").insert({
    type: "resendit_workflow_completed",
    title: "Workflow Completed",
    message: `Workflow ${data.workflowName || data.workflow_name || "execution"} completed successfully`,
    data: { executionId: data.executionId || data.execution_id },
    read: false,
  })
}

async function handleWorkflowFailed(data: any) {
  console.error("[Resend-It] Workflow failed:", {
    workflowId: data.workflowId || data.workflow_id,
    executionId: data.executionId || data.execution_id,
    error: data.error,
  })

  const supabase = await createServerClient()
  await supabase.from("notifications").insert({
    type: "resendit_workflow_failed",
    title: "Workflow Failed",
    message: `Workflow execution failed: ${data.error}`,
    data: { executionId: data.executionId || data.execution_id },
    read: false,
  })
}

async function handleAssetEvent(data: any) {
  console.log("[Resend-It] Asset event:", {
    assetId: data.assetId || data.asset_id,
    event: data.event,
  })
}
