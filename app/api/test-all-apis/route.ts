import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const results = {
    perplexity: { available: false, status: "Not tested", error: null },
    groq: { available: false, status: "Not tested", error: null },
    openai: { available: false, status: "Not tested", error: null },
    gemini: { available: false, status: "Not tested", error: null },
  }

  // Test Perplexity API
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [{ role: "user", content: "Hello, test message" }],
          max_tokens: 50,
        }),
      })

      if (response.ok) {
        results.perplexity = { available: true, status: "✅ Working", error: null }
      } else {
        results.perplexity = { available: false, status: "❌ Failed", error: `HTTP ${response.status}` }
      }
    } catch (error) {
      results.perplexity = { available: false, status: "❌ Error", error: error.message }
    }
  } else {
    results.perplexity = { available: false, status: "❌ No API Key", error: "PERPLEXITY_API_KEY not found" }
  }

  // Test Groq API
  if (process.env.GROQ_API_KEY) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [{ role: "user", content: "Hello, test message" }],
          max_tokens: 50,
        }),
      })

      if (response.ok) {
        results.groq = { available: true, status: "✅ Working", error: null }
      } else {
        results.groq = { available: false, status: "❌ Failed", error: `HTTP ${response.status}` }
      }
    } catch (error) {
      results.groq = { available: false, status: "❌ Error", error: error.message }
    }
  } else {
    results.groq = { available: false, status: "❌ No API Key", error: "GROQ_API_KEY not found" }
  }

  // Test OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Hello, test message" }],
          max_tokens: 50,
        }),
      })

      if (response.ok) {
        results.openai = { available: true, status: "✅ Working", error: null }
      } else {
        results.openai = { available: false, status: "❌ Failed", error: `HTTP ${response.status}` }
      }
    } catch (error) {
      results.openai = { available: false, status: "❌ Error", error: error.message }
    }
  } else {
    results.openai = { available: false, status: "❌ No API Key", error: "OPENAI_API_KEY not found" }
  }

  // Test Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: "Hello, test message" }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 50,
            },
          }),
        },
      )

      if (response.ok) {
        results.gemini = { available: true, status: "✅ Working", error: null }
      } else {
        results.gemini = { available: false, status: "❌ Failed", error: `HTTP ${response.status}` }
      }
    } catch (error) {
      results.gemini = { available: false, status: "❌ Error", error: error.message }
    }
  } else {
    results.gemini = { available: false, status: "❌ No API Key", error: "GEMINI_API_KEY not found" }
  }

  return NextResponse.json({
    status: "API Test Complete",
    results,
    available_apis: Object.entries(results)
      .filter(([_, result]) => result.available)
      .map(([name]) => name),
    environment_variables: Object.keys(process.env).filter((key) => key.includes("API_KEY")),
    timestamp: new Date().toISOString(),
  })
}
