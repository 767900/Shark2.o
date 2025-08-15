export async function GET() {
  try {
    console.log("🧪 Testing Perplexity API specifically...")

    if (!process.env.PERPLEXITY_API_KEY) {
      return Response.json({
        status: "❌ No Perplexity API Key",
        message: "PERPLEXITY_API_KEY environment variable not found",
        hasKey: false,
      })
    }

    console.log("🔑 API Key found, testing connection...")

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [
          {
            role: "user",
            content: "What's the current time and date? Also tell me one recent news headline from today.",
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
        return_citations: true,
        return_related_questions: true,
      }),
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Perplexity API Error:", errorText)

      return Response.json({
        status: "❌ API Error",
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText,
        hasKey: true,
        keyPrefix: process.env.PERPLEXITY_API_KEY.substring(0, 8) + "...",
      })
    }

    const data = await response.json()
    console.log("✅ Perplexity API Success!")

    return Response.json({
      status: "✅ Perplexity API Working Perfectly!",
      hasKey: true,
      keyPrefix: process.env.PERPLEXITY_API_KEY.substring(0, 8) + "...",
      response: {
        content: data.choices?.[0]?.message?.content || "No content received",
        citations: data.citations || [],
        related_questions: data.related_questions || [],
        model: "llama-3.1-sonar-large-128k-online",
        usage: data.usage || {},
      },
      timestamp: new Date().toISOString(),
      message: "🌐 Real-time search is working! You're getting live information with citations!",
    })
  } catch (error) {
    console.error("💥 Perplexity test error:", error)

    return Response.json({
      status: "❌ Network/Connection Error",
      error: error.message,
      hasKey: !!process.env.PERPLEXITY_API_KEY,
      timestamp: new Date().toISOString(),
    })
  }
}
