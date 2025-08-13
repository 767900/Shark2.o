export async function POST(request: Request) {
  try {
    console.log("🚀 CHAT API: Request received")

    const body = await request.json()
    const { messages } = body

    console.log("📝 CHAT API: Messages received:", messages?.length)

    if (!messages || !Array.isArray(messages)) {
      console.error("❌ CHAT API: Invalid messages format")
      return Response.json(
        {
          error: "Invalid messages format",
          content: "🦈 **Error:** Invalid message format. Please try again! 🇮🇳",
        },
        { status: 400 },
      )
    }

    // Multiple API keys and models to try
    const apiConfigs = [
      {
        name: "OpenAI GPT-4",
        apiKey: process.env.OPENAI_API_KEY,
        url: "https://api.openai.com/v1/chat/completions",
        model: "gpt-4",
        headers: (key: string) => ({
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        }),
      },
      {
        name: "OpenAI GPT-3.5",
        apiKey: process.env.OPENAI_API_KEY,
        url: "https://api.openai.com/v1/chat/completions",
        model: "gpt-3.5-turbo",
        headers: (key: string) => ({
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        }),
      },
      {
        name: "Groq Llama",
        apiKey: process.env.GROQ_API_KEY,
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama3-8b-8192",
        headers: (key: string) => ({
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        }),
      },
      {
        name: "xAI Grok",
        apiKey: process.env.XAI_API_KEY,
        url: "https://api.x.ai/v1/chat/completions",
        model: "grok-beta",
        headers: (key: string) => ({
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        }),
      },
    ]

    // Try each API configuration
    for (const config of apiConfigs) {
      if (!config.apiKey) {
        console.log(`⏭️ CHAT API: Skipping ${config.name} - no API key`)
        continue
      }

      try {
        console.log(`🔍 CHAT API: Trying ${config.name}...`)

        const requestBody = {
          model: config.model,
          messages: [
            {
              role: "system",
              content:
                "You are Shark 2.0, a helpful AI assistant from India. Provide accurate, helpful information. Be friendly and informative, and always end responses with relevant emojis.",
            },
            ...messages,
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }

        const response = await fetch(config.url, {
          method: "POST",
          headers: config.headers(config.apiKey),
          body: JSON.stringify(requestBody),
        })

        console.log(`📡 CHAT API: ${config.name} response status:`, response.status)

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ CHAT API: ${config.name} success!`)

          return Response.json({
            content: data.choices[0].message.content,
            provider: config.name,
            model: config.model,
            status: "success",
          })
        } else {
          const errorText = await response.text()
          console.log(`❌ CHAT API: ${config.name} failed:`, response.status, errorText.substring(0, 100))
        }
      } catch (error) {
        console.log(`💥 CHAT API: ${config.name} error:`, error.message)
      }
    }

    // If all APIs fail, provide intelligent fallback
    const userQuestion = messages[messages.length - 1]?.content || ""
    let fallbackResponse = "🦈 **Shark 2.0 - Offline Mode** 🦈\n\n"

    // Smart responses based on question type
    if (userQuestion.toLowerCase().includes("time")) {
      const currentTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      fallbackResponse += `🕐 **Current Time in India:** ${currentTime}\n\n`
    } else if (userQuestion.toLowerCase().includes("hello") || userQuestion.toLowerCase().includes("hi")) {
      fallbackResponse += `🙏 **Namaste!** Hello there!\n\n`
    } else if (userQuestion.toLowerCase().includes("weather")) {
      fallbackResponse += `🌤️ I'd love to help with weather information!\n\n`
    } else if (userQuestion.toLowerCase().includes("news")) {
      fallbackResponse += `📰 I'd be happy to help with news updates!\n\n`
    } else {
      fallbackResponse += `I understand you're asking: "${userQuestion}"\n\n`
    }

    fallbackResponse += `**🔧 System Status:**\n• AI models are currently unavailable\n• This is a smart fallback response\n\n**💡 Solutions:**\n• Check your internet connection\n• Try again in a few moments\n• Contact support if issues persist\n\nI'm still here to help once the connection is restored! 🇮🇳✨`

    return Response.json({
      content: fallbackResponse,
      provider: "Smart Fallback",
      status: "fallback",
      debug: {
        attempted: apiConfigs.map((c) => ({ name: c.name, hasKey: !!c.apiKey })),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("💥 CHAT API: Unexpected error:", error)

    return Response.json(
      {
        error: error.message,
        content: `🦈 **System Error** 🦈\n\nSomething unexpected happened:\n\n**Error:** ${error.message}\n\nI'm still here to help! Please try asking your question again. 🇮🇳`,
      },
      { status: 500 },
    )
  }
}
