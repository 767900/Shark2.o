export async function GET() {
  try {
    console.log("🔍 DEBUGGING Perplexity API...")

    // Step 1: Check if API key exists
    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) {
      return Response.json({
        step: "1",
        status: "❌ FAILED - No API Key",
        message: "PERPLEXITY_API_KEY environment variable not found",
        solution: "Add your Perplexity API key to environment variables",
      })
    }

    console.log("✅ Step 1: API Key found")

    // Step 2: Validate API key format
    if (!apiKey.startsWith("pplx-")) {
      return Response.json({
        step: "2",
        status: "❌ FAILED - Invalid API Key Format",
        message: `API key should start with 'pplx-' but yours starts with '${apiKey.substring(0, 4)}...'`,
        keyLength: apiKey.length,
        solution: "Get a new API key from https://www.perplexity.ai/settings/api",
      })
    }

    console.log("✅ Step 2: API Key format is correct")

    // Step 3: Test with simplest possible request
    console.log("🧪 Step 3: Testing basic API connection...")

    const testPayload = {
      model: "llama-3.1-sonar-large-128k-online",
      messages: [
        {
          role: "user",
          content: "Hello, just say 'API test successful' please.",
        },
      ],
      max_tokens: 50,
    }

    console.log("📤 Sending request to Perplexity...")

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    })

    console.log("📡 Response received:", response.status, response.statusText)

    // Step 4: Check response status
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API Error Response:", errorText)

      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = { raw: errorText }
      }

      return Response.json({
        step: "4",
        status: `❌ FAILED - HTTP ${response.status}`,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        errorDetails: errorDetails,
        possibleCauses: {
          400: "Bad request - Invalid model or parameters",
          401: "Unauthorized - Invalid API key",
          403: "Forbidden - API key doesn't have permission",
          429: "Rate limited - Too many requests",
          500: "Server error - Perplexity API issue",
        },
        solution:
          response.status === 401
            ? "Your API key is invalid. Get a new one from https://www.perplexity.ai/settings/api"
            : response.status === 400
              ? "The model name or request format is wrong"
              : response.status === 429
                ? "You've hit the rate limit. Wait a few minutes and try again"
                : "Check Perplexity API status or try again later",
      })
    }

    console.log("✅ Step 4: HTTP response is OK")

    // Step 5: Parse response
    const data = await response.json()
    console.log("✅ Step 5: Response parsed successfully")

    return Response.json({
      step: "5",
      status: "✅ SUCCESS - Perplexity API Working!",
      apiKey: {
        present: true,
        format: "Valid (starts with pplx-)",
        length: apiKey.length,
        prefix: apiKey.substring(0, 8) + "...",
      },
      response: {
        content: data.choices?.[0]?.message?.content || "No content",
        model: data.model || "Unknown",
        usage: data.usage || {},
        citations: data.citations || [],
        hasContent: !!data.choices?.[0]?.message?.content,
      },
      timestamp: new Date().toISOString(),
      message: "🎉 Your Perplexity API is working perfectly!",
    })
  } catch (error) {
    console.error("💥 Debug test error:", error)

    return Response.json({
      step: "ERROR",
      status: "❌ FAILED - Network/System Error",
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack?.split("\n").slice(0, 3), // First 3 lines only
      },
      possibleCauses: [
        "Network connection issue",
        "Firewall blocking the request",
        "DNS resolution problem",
        "System/server error",
      ],
      solution: "Check your internet connection and try again",
      timestamp: new Date().toISOString(),
    })
  }
}
