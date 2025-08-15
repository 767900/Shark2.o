export async function POST(request: Request) {
  try {
    console.log("📥 Download image API called...")

    const body = await request.json()
    const { imageUrl, filename } = body

    if (!imageUrl) {
      return Response.json({ error: "No image URL provided" }, { status: 400 })
    }

    console.log("🖼️ Downloading image from:", imageUrl)

    // Fetch the image
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"

    // Determine file extension
    let extension = "jpg"
    if (contentType.includes("png")) extension = "png"
    else if (contentType.includes("gif")) extension = "gif"
    else if (contentType.includes("webp")) extension = "webp"

    const finalFilename = filename || `shark-ai-generated-${Date.now()}.${extension}`

    console.log("✅ Image downloaded successfully!")

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${finalFilename}"`,
        "Content-Length": imageBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("💥 Download error:", error)
    return Response.json({ error: "Failed to download image" }, { status: 500 })
  }
}
