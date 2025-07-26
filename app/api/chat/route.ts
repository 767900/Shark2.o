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
            "You are Shark2.0, a helpful AI assistant. Be conversational, friendly, and provide clear, concise responses with a bit of personality. Keep responses brief for voice conversations.",
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
            "You are Shark2.0, a helpful AI assistant. Be conversational, friendly, and provide clear, concise responses. Keep responses brief for voice conversations.",
          messages: messages,
        })

        return Response.json({ content: text, provider: "OpenAI" })
      } catch (error) {
        console.log("OpenAI failed, trying alternatives...", error.message)
      }
    }

    // Enhanced mock responses with Shark2.0 personality - optimized for voice
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ""

    // Voice-optimized responses (shorter and more conversational)
    const voiceResponses = {
      greetings: [
        "Hi there! I'm Shark2.0, your AI assistant. How can I help you today?",
        "Hello! Shark2.0 here, ready to assist you. What's on your mind?",
        "Hey! I'm Shark2.0. Great to meet you! What can I do for you?",
      ],
      questions: [
        "That's a great question! Let me think about that for you.",
        "Interesting question! Here's what I think about that.",
        "Good question! I'd be happy to help you with that.",
      ],
      general: [
        "I'm Shark2.0, and I find that quite interesting! Let me share my thoughts.",
        "As your AI assistant, I'd be happy to help you with that!",
        "That's a fascinating topic! I'd love to discuss that with you.",
      ],
      help: [
        "I'm Shark2.0, and I'm here to help! What do you need assistance with?",
        "I'm your AI assistant, ready to help with whatever you need.",
        "Of course! I'm Shark2.0, and helping you is what I do best!",
      ],
    }

    let responseArray = voiceResponses.general
    if (lastMessage.includes("hello") || lastMessage.includes("hi") || lastMessage.includes("hey")) {
      responseArray = voiceResponses.greetings
    } else if (lastMessage.includes("?")) {
      responseArray = voiceResponses.questions
    } else if (lastMessage.includes("help")) {
      responseArray = voiceResponses.help
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    return Response.json({
      content: responseArray[Math.floor(Math.random() * responseArray.length)],
      provider: "Shark2.0 Demo",
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({
      content: "Sorry, I encountered some rough waters. Let me try again!",
      provider: "Error",
    })
  }
}
