// Multi-provider AI chat API with xAI integration
export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    // Try xAI first (Grok)
    if (process.env.XAI_API_KEY) {
      try {
        const { xai } = await import("@ai-sdk/xai")
        const { generateText } = await import("ai")

        const { text } = await generateText({
          model: xai("grok-beta"),
          system:
            "You are Shark2.0, a helpful AI assistant. Be conversational, friendly, and provide clear, concise responses with a bit of personality.",
          messages: messages,
        })

        return Response.json({ content: text, provider: "xAI (Grok)" })
      } catch (error) {
        console.log("xAI failed, trying alternatives...", error.message)
      }
    }

    // Try OpenAI as backup
    if (process.env.OPENAI_API_KEY) {
      try {
        const { openai } = await import("@ai-sdk/openai")
        const { generateText } = await import("ai")

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          system:
            "You are Shark2.0, a helpful AI assistant. Be conversational, friendly, and provide clear, concise responses.",
          messages: messages,
        })

        return Response.json({ content: text, provider: "OpenAI" })
      } catch (error) {
        console.log("OpenAI failed, trying alternatives...", error.message)
      }
    }

    // Try Groq as backup
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
            messages: [
              {
                role: "system",
                content:
                  "You are Shark2.0, a helpful AI assistant. Be conversational, friendly, and provide clear, concise responses.",
              },
              ...messages,
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return Response.json({
            content: data.choices[0].message.content,
            provider: "Groq (Llama3)",
          })
        }
      } catch (error) {
        console.log("Groq failed, using mock...", error.message)
      }
    }

    // Enhanced mock responses with Shark2.0 personality
    const sharkResponses = {
      greetings: [
        "Hey there! I'm Shark2.0, ready to dive into any topic you'd like to discuss! 🦈",
        "Hello! Shark2.0 here - swimming through the digital ocean to help you out! What's on your mind?",
        "Hi! I'm Shark2.0, your AI companion. Let's make some waves with our conversation! 🌊",
      ],
      questions: [
        "That's a fin-tastic question! Let me think about that... 🦈",
        "Great question! As Shark2.0, I love diving deep into interesting topics like this.",
        "Interesting! Let me swim through my knowledge to give you a good answer.",
      ],
      general: [
        "I'm Shark2.0, and I find that topic quite fascinating! Let me share my thoughts...",
        "As your AI shark companion, I'd say that's worth exploring further!",
        "Swimming through that idea, I think there are several angles to consider...",
      ],
      technology: [
        "Technology is like the ocean - vast, deep, and full of amazing discoveries! As Shark2.0, I love exploring tech topics.",
        "Tech talk with Shark2.0! I'm always excited to discuss the latest innovations and digital trends.",
      ],
      help: [
        "I'm Shark2.0, and I'm here to help you navigate any challenge! What do you need assistance with?",
        "Need help? You've got the right shark for the job! I'm Shark2.0, ready to assist.",
      ],
    }

    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

    let responseArray = sharkResponses.general
    if (lastMessage.includes("hello") || lastMessage.includes("hi") || lastMessage.includes("hey")) {
      responseArray = sharkResponses.greetings
    } else if (lastMessage.includes("?")) {
      responseArray = sharkResponses.questions
    } else if (lastMessage.includes("technology") || lastMessage.includes("tech")) {
      responseArray = sharkResponses.technology
    } else if (lastMessage.includes("help")) {
      responseArray = sharkResponses.help
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500))

    return Response.json({
      content: responseArray[Math.floor(Math.random() * responseArray.length)],
      provider: "Shark2.0 Demo",
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({
      content: "Oops! Shark2.0 encountered some rough waters. Let me try again! 🦈",
      provider: "Error",
    })
  }
}
