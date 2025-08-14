export async function GET() {
  try {
    console.log("🏥 Health check - Verifying Perplexity API integration...")

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
      },
      apis: {
        perplexity: {
          configured: !!process.env.PERPLEXITY_API_KEY,
          keyLength: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.length : 0,
          keyPrefix: process.env.PERPLEXITY_API_KEY
            ? process.env.PERPLEXITY_API_KEY.substring(0, 8) + "..."
            : "Not found",
        },
      },
      features: ["real-time-search", "voice-input-output", "image-analysis", "citations", "related-questions"],
    }

    // Test Perplexity API if key is available
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log("🧪 Quick Perplexity API test...")

        const testResponse = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 10,
          }),
        })

        healthStatus.apis.perplexity.testStatus = testResponse.ok ? "✅ Working" : `❌ Error ${testResponse.status}`
        healthStatus.apis.perplexity.lastTested = new Date().toISOString()

        if (testResponse.ok) {
          console.log("✅ Perplexity API health check passed!")
        } else {
          console.log("❌ Perplexity API health check failed:", testResponse.status)
        }
      } catch (error) {
        healthStatus.apis.perplexity.testStatus = `❌ Network Error: ${error.message}`
        console.log("💥 Perplexity health check error:", error.message)
      }
    }

    return Response.json(healthStatus)
  } catch (error) {
    console.error("💥 Health check system error:", error)
    return Response.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
