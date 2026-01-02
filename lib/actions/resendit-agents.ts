"use server"

import { ResendItClient } from "@/lib/resendit/client"
import { getResendItTokens } from "./resendit-oauth"

async function getClient() {
  const tokens = await getResendItTokens()
  if (!tokens) {
    throw new Error("Not authenticated with Resend-It")
  }
  return new ResendItClient(tokens)
}

export async function executeResendItAgent(params: {
  agentId: string
  prompt: string
  assetIds?: string[]
  dataStreamIds?: string[]
  webhookUrl?: string
  metadata?: Record<string, any>
}) {
  try {
    const client = await getClient()
    const result = await client.executeAgent(params.agentId, {
      prompt: params.prompt,
      assetIds: params.assetIds,
      dataStreamIds: params.dataStreamIds,
      webhookUrl: params.webhookUrl,
      metadata: params.metadata,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("[Resend-It] Agent execution error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function executeResendItWorkflow(params: {
  workflowId: string
  input?: Record<string, any>
  webhookUrl?: string
  metadata?: Record<string, any>
}) {
  try {
    const client = await getClient()
    const result = await client.executeWorkflow(params.workflowId, {
      input: params.input,
      webhookUrl: params.webhookUrl,
      metadata: params.metadata,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("[Resend-It] Workflow execution error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function listResendItAgents() {
  try {
    const client = await getClient()
    const agents = await client.getAgents()
    return { success: true, data: agents }
  } catch (error) {
    console.error("[Resend-It] List agents error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function listResendItWorkflows() {
  try {
    const client = await getClient()
    const workflows = await client.getWorkflows()
    return { success: true, data: workflows }
  } catch (error) {
    console.error("[Resend-It] List workflows error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function listResendItAssets() {
  try {
    const client = await getClient()
    const assets = await client.getAssets()
    return { success: true, data: assets }
  } catch (error) {
    console.error("[Resend-It] List assets error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
