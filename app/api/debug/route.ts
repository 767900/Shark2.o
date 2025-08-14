export async function GET() {
  try {
    console.log("🔧 Debug endpoint called")

    const envStatus = {
      PERPLEXITY_API_KEY: {
        present: !!process.env.PERPLEXITY_API_KEY,
        prefix: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.substring(0, 5) + "..." : "Not found",
        length: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.length : 0,
      },
      XAI_API_KEY: {
        present: !!process.env.XAI_API_KEY,
        prefix: process.env.XAI_API_KEY ? process.env.XAI_API_KEY.substring(0, 4) + "..." : "Not found",
        length: process.env.XAI_API_KEY ? process.env.XAI_API_KEY.length : 0,
      },
      GROQ_API_KEY: {
        present: !!process.env.GROQ_API_KEY,
        prefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 4) + "..." : "Not found",
        length: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0,
      },
      OPENAI_API_KEY: {
        present: !!process.env.OPENAI_API_KEY,
        prefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 3) + "..." : "Not found",
        length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      },
    }

    // Test Perplexity API specifically
    let perplexityTest = null
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log("🧪 Testing Perplexity API...")
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [{ role: "user", content: "Hello, this is a test. Please respond with 'Test successful!'" }],
            max_tokens: 50,
          }),
        })

        perplexityTest = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        }

        if (response.ok) {
          const data = await response.json()
          perplexityTest.response = data
          perplexityTest.content = data.choices?.[0]?.message?.content
        } else {
          const errorText = await response.text()
          perplexityTest.error = errorText
        }
      } catch (error) {
        perplexityTest = {
          error: error.message,
          type: error.constructor.name,
        }
      }
    }

    return Response.json({
      timestamp: new Date().toISOString(),
      environment: envStatus,
      perplexityTest,
      nodeVersion: process.version,
      platform: process.platform,
      recommendations: {
        perplexity: process.env.PERPLEXITY_API_KEY
          ? "API key found - check test results above"
          : "Get API key from https://www.perplexity.ai/settings/api",
        xai: process.env.XAI_API_KEY ? "API key found" : "Get API key from https://console.x.ai",
        groq: process.env.GROQ_API_KEY ? "API key found" : "Get API key from https://console.groq.com",
        openai: process.env.OPENAI_API_KEY ? "API key found" : "Get API key from https://platform.openai.com",
      },
    })
  } catch (error) {
    return Response.json(
      {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
