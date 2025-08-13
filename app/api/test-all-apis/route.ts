export async function GET() {
  try {
    const apiConfigs = [
      {
        name: "OpenAI GPT-4",
        apiKey: process.env.OPENAI_API_KEY,
        url: "https://api.openai.com/v1/chat/completions",
        model: "gpt-4",
      },
      {
        name: "OpenAI GPT-3.5",
        apiKey: process.env.OPENAI_API_KEY,
        url: "https://api.openai.com/v1/chat/completions",
        model: "gpt-3.5-turbo",
      },
      {
        name: "Groq Llama",
        apiKey: process.env.GROQ_API_KEY,
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama3-8b-8192",
      },
      {
        name: "xAI Grok",
        apiKey: process.env.XAI_API_KEY,
        url: "https://api.x.ai/v1/chat/completions",
        model: "grok-beta",
      },
    ]

    const results = []
    const workingApis = []

    for (const config of apiConfigs) {
      const result = {
        name: config.name,
        model: config.model,
        hasApiKey: !!config.apiKey,
        status: "unknown",
        error: null,
      }

      if (!config.apiKey) {
        result.status = "no_api_key"
        result.error = "API key not configured"
      } else {
        try {
          const response = await fetch(config.url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: config.model,
              messages: [{ role: "user", content: "Test message" }],
              max_tokens: 10,
            }),
          })

          if (response.ok) {
            result.status = "working"
            workingApis.push(config.name)
          } else {
            result.status = "error"
            result.error = `HTTP ${response.status}`
          }
        } catch (error) {
          result.status = "error"
          result.error = error.message
        }
      }

      results.push(result)
    }

    const summary = {
      total: results.length,
      withKeys: results.filter((r) => r.hasApiKey).length,
      working: workingApis.length,
    }

    let recommendation = ""
    if (summary.working === 0) {
      recommendation = "No APIs are working. Check your API keys and internet connection."
    } else if (summary.working === 1) {
      recommendation = `${workingApis[0]} is working. Consider adding backup API keys.`
    } else {
      recommendation = `${summary.working} APIs are working. System is fully operational!`
    }

    const status = results
      .map(
        (r) =>
          `• ${r.name}: ${r.status === "working" ? "✅ Working" : r.status === "no_api_key" ? "🔑 No API Key" : `❌ ${r.error}`}`,
      )
      .join("\n")

    return Response.json({
      results,
      summary,
      workingApis,
      recommendation,
      status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      {
        error: error.message,
        status: "System test failed",
        summary: { total: 0, withKeys: 0, working: 0 },
        recommendation: "Unable to test APIs due to system error",
      },
      { status: 500 },
    )
  }
}
