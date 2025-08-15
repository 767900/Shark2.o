export async function GET() {
  try {
    console.log("📋 Getting available Perplexity models...")

    if (!process.env.PERPLEXITY_API_KEY) {
      return Response.json({
        error: "No Perplexity API key found",
        solution: "Add PERPLEXITY_API_KEY to your environment variables",
      })
    }

    // Test multiple model names to find working ones
    const modelsToTest = [
      "llama-3.1-sonar-large-128k-online",
      "llama-3.1-sonar-small-128k-online",
      "llama-3.1-sonar-huge-128k-online",
      "sonar-small-online",
      "sonar-medium-online",
      "sonar-large-online",
    ]

    const results = []

    for (const model of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${model}`)

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 10,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            model: model,
            status: "✅ Working",
            response: data.choices?.[0]?.message?.content || "No content",
          })
          console.log(`✅ ${model} works!`)
        } else {
          const errorText = await response.text()
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { raw: errorText }
          }

          results.push({
            model: model,
            status: `❌ Error ${response.status}`,
            error: errorData.error?.message || errorText,
          })
          console.log(`❌ ${model} failed:`, errorData.error?.message)
        }
      } catch (error) {
        results.push({
          model: model,
          status: "❌ Network Error",
          error: error.message,
        })
      }
    }

    const workingModels = results.filter((r) => r.status.includes("✅"))
    const recommendedModel = workingModels.length > 0 ? workingModels[0].model : null

    return Response.json({
      timestamp: new Date().toISOString(),
      totalTested: modelsToTest.length,
      workingModels: workingModels.length,
      recommendedModel: recommendedModel,
      results: results,
      summary:
        workingModels.length > 0
          ? `✅ Found ${workingModels.length} working model(s)! Use: ${recommendedModel}`
          : "❌ No working models found. Check your API key or Perplexity documentation.",
    })
  } catch (error) {
    console.error("💥 Model test error:", error)
    return Response.json({
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
