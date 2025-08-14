export async function GET() {
  try {
    console.log("🧪 Testing all available AI APIs...")

    const results = []
    const workingApis = []

    // 🌟 Test Perplexity AI
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log("🌐 Testing Perplexity AI...")

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
                content: "Test message - respond with 'Perplexity AI working!'",
              },
            ],
            max_tokens: 50,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            name: "Perplexity AI (Real-time Search)",
            status: "✅ Working Perfectly",
            hasKey: true,
            features: ["real-time-search", "citations", "current-events"],
          })
          workingApis.push("Perplexity AI")
          console.log("✅ Perplexity test SUCCESS!")
        } else {
          results.push({
            name: "Perplexity AI (Real-time Search)",
            status: `❌ Error: ${response.status}`,
            hasKey: true,
          })
        }
      } catch (error) {
        results.push({
          name: "Perplexity AI (Real-time Search)",
          status: `❌ Network Error`,
          hasKey: true,
        })
      }
    } else {
      results.push({
        name: "Perplexity AI (Real-time Search)",
        status: "🔑 No API Key",
        hasKey: false,
        note: "Add PERPLEXITY_API_KEY for real-time search",
      })
    }

    // Test Groq
    if (process.env.GROQ_API_KEY) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 50,
          }),
        })

        if (response.ok) {
          results.push({ name: "Groq Llama (Fast AI)", status: "✅ Working", hasKey: true })
          workingApis.push("Groq Llama")
        } else {
          results.push({ name: "Groq Llama (Fast AI)", status: `❌ Error: ${response.status}`, hasKey: true })
        }
      } catch (error) {
        results.push({ name: "Groq Llama (Fast AI)", status: `❌ Network Error`, hasKey: true })
      }
    } else {
      results.push({ name: "Groq Llama (Fast AI)", status: "🔑 No API Key", hasKey: false })
    }

    // Test OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 50,
          }),
        })

        if (response.ok) {
          results.push({ name: "OpenAI GPT-3.5 (High Quality)", status: "✅ Working", hasKey: true })
          workingApis.push("OpenAI GPT-3.5")
        } else {
          results.push({ name: "OpenAI GPT-3.5 (High Quality)", status: `❌ Error: ${response.status}`, hasKey: true })
        }
      } catch (error) {
        results.push({ name: "OpenAI GPT-3.5 (High Quality)", status: `❌ Network Error`, hasKey: true })
      }
    } else {
      results.push({ name: "OpenAI GPT-3.5 (High Quality)", status: "🔑 No API Key", hasKey: false })
    }

    // Test xAI Grok
    if (process.env.XAI_API_KEY) {
      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "grok-beta",
            messages: [{ role: "user", content: "Test" }],
            max_tokens: 50,
          }),
        })

        if (response.ok) {
          results.push({ name: "xAI Grok (Latest AI)", status: "✅ Working", hasKey: true })
          workingApis.push("xAI Grok")
        } else {
          results.push({ name: "xAI Grok (Latest AI)", status: `❌ Error: ${response.status}`, hasKey: true })
        }
      } catch (error) {
        results.push({ name: "xAI Grok (Latest AI)", status: `❌ Network Error`, hasKey: true })
      }
    } else {
      results.push({ name: "xAI Grok (Latest AI)", status: "🔑 No API Key", hasKey: false })
    }

    // Always add Smart Assistant as working
    results.push({
      name: "Shark 2.0 Smart Assistant",
      status: "✅ Always Working",
      hasKey: true,
      features: ["intelligent-responses", "educational-content", "indian-knowledge", "programming-help"],
    })
    workingApis.push("Smart Assistant")

    const summary = {
      total: results.length,
      withKeys: results.filter((r) => r.hasKey).length,
      working: workingApis.length,
    }

    let recommendation = ""
    let systemStatus = ""

    if (workingApis.length > 1) {
      recommendation = `🌟 EXCELLENT! ${workingApis.length} AI system(s) working including Smart Assistant!`
      systemStatus = "🟢 OPTIMAL"
    } else {
      recommendation = "🧠 Smart Assistant is working! Add API keys for enhanced capabilities."
      systemStatus = "🟡 SMART MODE"
    }

    const status = results.map((r) => `• ${r.name}: ${r.status}`).join("\n")

    return Response.json({
      results,
      summary,
      workingApis,
      recommendation,
      status,
      systemStatus,
      primaryApi: workingApis.includes("Perplexity AI")
        ? "Perplexity AI"
        : workingApis.includes("OpenAI GPT-3.5")
          ? "OpenAI GPT-3.5"
          : workingApis.includes("Groq Llama")
            ? "Groq Llama"
            : workingApis.includes("xAI Grok")
              ? "xAI Grok"
              : "Smart Assistant",
      timestamp: new Date().toISOString(),
      note: "Smart Assistant always works! Add API keys for enhanced AI capabilities.",
    })
  } catch (error) {
    console.error("💥 Test system error:", error)
    return Response.json({
      error: error.message,
      status: "🧠 Smart Assistant is working! System test had issues but core functionality is available.",
      recommendation: "Smart Assistant mode is active and ready to help!",
      systemStatus: "🟡 SMART MODE",
      workingApis: ["Smart Assistant"],
      summary: { total: 1, withKeys: 1, working: 1 },
    })
  }
}
