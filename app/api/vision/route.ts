export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const message = formData.get("message") as string

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mimeType = image.type

    // Try OpenAI Vision first
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: message || "What do you see in this image? Describe it in detail.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1000,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return Response.json({
            content: data.choices[0].message.content,
            provider: "OpenAI Vision",
          })
        }
      } catch (error) {
        console.log("OpenAI Vision failed:", error.message)
      }
    }

    // Enhanced fallback response
    const imageAnalysisResponses = [
      `🖼️ **Image Analysis - Shark 2.0** 🖼️\n\nI can see you've uploaded an image! While my vision capabilities are currently limited, I'm working on analyzing it for you.\n\n📸 **What I can tell you:**\n• Image received successfully\n• File type: ${mimeType}\n• Ready for analysis\n\n🔧 **For full image analysis, I need OpenAI Vision API access.**\n\nTry asking me about something else in the meantime! 🦈🇮🇳`,

      `📷 **Shark 2.0 - Image Processing** 📷\n\nGreat! I've received your image. While I'm currently swimming in demo mode for image analysis, I can see that you've shared something with me!\n\n🎯 **Next Steps:**\n• Configure OpenAI API for full vision\n• I'll be able to describe, analyze, and answer questions about images\n\n💡 **In the meantime, ask me anything else!** 🦈✨`,
    ]

    return Response.json({
      content: imageAnalysisResponses[Math.floor(Math.random() * imageAnalysisResponses.length)],
      provider: "Shark 2.0 Vision (Demo)",
    })
  } catch (error) {
    console.error("Vision API error:", error)
    return Response.json(
      {
        error: "Failed to process image",
        content:
          "🦈 **Image Processing Error** 🦈\n\nSorry, I had trouble processing that image. Please try again or ask me something else! 🇮🇳",
      },
      { status: 500 },
    )
  }
}
