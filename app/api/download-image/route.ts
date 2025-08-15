export async function POST(request: Request) {
  try {
    console.log("📥 Download image API called...")

    const body = await request.json()
    const { imageUrl, filename } = body

    if (!imageUrl) {
      return Response.json({ error: "No image URL provided" }, { status: 400 })
    }

    console.log("🖼️ Downloading image from:", imageUrl)

    // Fetch the image with redirect handling
    const imageResponse = await fetch(imageUrl, {
      method: "GET",
      redirect: "follow", // Follow redirects automatically
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImageDownloader/1.0)",
        Accept: "image/*,*/*;q=0.8",
      },
    })

    if (!imageResponse.ok) {
      console.error(`Image fetch failed: ${imageResponse.status} ${imageResponse.statusText}`)
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    if (imageBuffer.byteLength === 0) {
      throw new Error("Empty image data received")
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"
    console.log("📄 Content type:", contentType, "Size:", imageBuffer.byteLength)

    // Determine file extension
    let extension = "jpg"
    if (contentType.includes("png")) extension = "png"
    else if (contentType.includes("gif")) extension = "gif"
    else if (contentType.includes("webp")) extension = "webp"
    else if (contentType.includes("svg")) extension = "svg"

    const finalFilename = filename || `shark-ai-generated-${Date.now()}.${extension}`

    console.log("✅ Image downloaded successfully! Size:", imageBuffer.byteLength, "bytes")

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${finalFilename}"`,
        "Content-Length": imageBuffer.byteLength.toString(),
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("💥 Download error:", error)
    return Response.json(
      {
        error: "Failed to download image",
        details: error.message,
        suggestion: "Try right-clicking the image and selecting 'Save image as...'",
      },
      { status: 500 },
    )
  }
}
