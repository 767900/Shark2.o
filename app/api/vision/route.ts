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
        const { openai } = await import("@ai-sdk/openai")
        const { generateText } = await import("ai")

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: message || "What do you see in this image? Describe it in detail.",
                },
                {
                  type: "image",
                  image: `data:${mimeType};base64,${base64}`,
                },
              ],
            },
          ],
        })

        return Response.json({
          content: text,
          provider: "OpenAI Vision",
        })
      } catch (error) {
        console.log("OpenAI Vision failed:", error.message)
      }
    }

    // Fallback response for demo
    const mockVisionResponses = [
      "I can see an image has been uploaded! However, I'm currently running in demo mode. To analyze images, please add your OpenAI API key for vision capabilities.",
      "Image received! In demo mode, I can't actually see the image content. Add an OpenAI API key to unlock real image analysis with Shark2.0! 🦈",
      "Got your image! For real AI vision analysis, you'll need to configure an OpenAI API key. Until then, I'm swimming blind! 🦈👀",
    ]

    return Response.json({
      content: mockVisionResponses[Math.floor(Math.random() * mockVisionResponses.length)],
      provider: "Shark2.0 Demo Vision",
    })
  } catch (error) {
    console.error("Vision API error:", error)
    return Response.json(
      {
        error: "Failed to process image",
        content: "Sorry, I had trouble processing that image. Please try again! 🦈",
      },
      { status: 500 },
    )
  }
}
