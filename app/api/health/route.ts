import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    available_apis: [],
    api_status: {},
  }

  // Check which API keys are available
  const apiKeys = {
    perplexity: !!process.env.PERPLEXITY_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  }

  healthCheck.available_apis = Object.entries(apiKeys)
    .filter(([_, available]) => available)
    .map(([name]) => name)

  healthCheck.api_status = apiKeys

  return NextResponse.json(healthCheck)
}
