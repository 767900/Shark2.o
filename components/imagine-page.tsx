"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Wand2, Download, Share, Copy, Sparkles, ImageIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  timestamp: number
  isGenerating?: boolean
  category?: string
  seed?: number
}

interface ImaginePageProps {
  onBack: () => void
}

export default function ImaginePage({ onBack }: ImaginePageProps) {
  const [prompt, setPrompt] = useState("")
  const [images, setImages] = useState<GeneratedImage[]>([
    {
      id: "demo-1",
      prompt: "Astronaut dancing ballet on the moon with Earth in background",
      imageUrl: "https://picsum.photos/seed/space123/400/400?grayscale&blur=1",
      timestamp: Date.now() - 300000,
      category: "space",
    },
    {
      id: "demo-2",
      prompt: "Beautiful paper craft flowers with dimensional layering and vibrant colors",
      imageUrl: "https://picsum.photos/seed/flower456/400/400",
      timestamp: Date.now() - 240000,
      category: "nature",
    },
    {
      id: "demo-3",
      prompt: "Majestic whale jumping out of vintage bathtub in elegant bathroom",
      imageUrl: "https://picsum.photos/seed/ocean789/400/400?blur=1",
      timestamp: Date.now() - 180000,
      category: "nature",
    },
    {
      id: "demo-4",
      prompt: "Victorian cat in elegant dress holding ornate umbrella in garden",
      imageUrl: "https://picsum.photos/seed/cat321/400/400",
      timestamp: Date.now() - 120000,
      category: "animal",
    },
    {
      id: "demo-5",
      prompt: "Magical fairy tale scene with crescent moon and twinkling stars",
      imageUrl: "https://picsum.photos/seed/art654/400/400?blur=2",
      timestamp: Date.now() - 60000,
      category: "abstract",
    },
    {
      id: "demo-6",
      prompt: "Serene nature scene with morning dew and soft sunlight filtering through leaves",
      imageUrl: "https://picsum.photos/seed/forest987/400/400",
      timestamp: Date.now() - 30000,
      category: "nature",
    },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)

    // Create a new generating image
    const newImage: GeneratedImage = {
      id: `gen-${Date.now()}`,
      prompt: prompt.trim(),
      imageUrl: "", // Will be set after generation
      timestamp: Date.now(),
      isGenerating: true,
    }

    // Add to images with generating state
    setImages((prev) => [newImage, ...prev])
    const currentPrompt = prompt.trim()
    setPrompt("")

    try {
      console.log("🎨 Generating image for prompt:", currentPrompt)

      // Call the image generation API
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentPrompt,
          imageId: newImage.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Image generated successfully!")

        // Update the image with the generated result
        setImages((prev) =>
          prev.map((img) =>
            img.id === newImage.id
              ? {
                  ...img,
                  imageUrl: data.imageUrl,
                  isGenerating: false,
                  category: data.category,
                  seed: data.seed,
                }
              : img,
          ),
        )
      } else {
        throw new Error("Failed to generate image")
      }
    } catch (error) {
      console.error("❌ Image generation failed:", error)

      // Update with fallback image
      const fallbackSeed = Math.floor(Math.random() * 1000)
      setImages((prev) =>
        prev.map((img) =>
          img.id === newImage.id
            ? {
                ...img,
                imageUrl: `https://picsum.photos/seed/error${fallbackSeed}/400/400`,
                isGenerating: false,
                category: "fallback",
              }
            : img,
        ),
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async (image: GeneratedImage, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }

    if (!image.imageUrl || downloadingId === image.id) return

    setDownloadingId(image.id)
    setDownloadStatus("Preparing download...")

    try {
      console.log("📥 Downloading image:", image.prompt)

      // Create filename from prompt
      const cleanPrompt = image.prompt
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()
        .substring(0, 50)

      const filename = `shark-ai-${cleanPrompt}-${image.id}.jpg`

      // Method 1: Try API download
      setDownloadStatus("Downloading via API...")
      try {
        const response = await fetch("/api/download-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: image.imageUrl,
            filename: filename,
          }),
        })

        if (response.ok) {
          setDownloadStatus("Processing download...")
          const blob = await response.blob()

          if (blob.size > 0) {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = filename
            a.style.display = "none"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            setDownloadStatus("Download complete!")
            console.log("✅ API download successful!")

            setTimeout(() => setDownloadStatus(""), 2000)
            return
          }
        } else {
          const errorData = await response.json()
          console.log("API download failed:", errorData.error)
          throw new Error(errorData.error || "API download failed")
        }
      } catch (apiError) {
        console.log("API download failed, trying alternative methods...")
        setDownloadStatus("Trying alternative method...")
      }

      // Method 2: Canvas-based download (works with CORS)
      try {
        setDownloadStatus("Processing image...")

        const img = new Image()
        img.crossOrigin = "anonymous"

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = image.imageUrl
        })

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height

        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = filename
              a.style.display = "none"
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              window.URL.revokeObjectURL(url)

              setDownloadStatus("Download complete!")
              console.log("✅ Canvas download successful!")
              setTimeout(() => setDownloadStatus(""), 2000)
            } else {
              throw new Error("Failed to create blob from canvas")
            }
          },
          "image/jpeg",
          0.9,
        )

        return
      } catch (canvasError) {
        console.log("Canvas download failed:", canvasError)
        setDownloadStatus("Trying final method...")
      }

      // Method 3: Direct fetch with proxy
      try {
        setDownloadStatus("Fetching image...")

        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(image.imageUrl)}`
        const response = await fetch(proxyUrl)

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = filename
          a.style.display = "none"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)

          setDownloadStatus("Download complete!")
          console.log("✅ Proxy download successful!")
          setTimeout(() => setDownloadStatus(""), 2000)
          return
        }
      } catch (proxyError) {
        console.log("Proxy download failed:", proxyError)
      }

      // Method 4: Fallback - Open in new tab with download suggestion
      setDownloadStatus("Opening in new tab...")
      const link = document.createElement("a")
      link.href = image.imageUrl
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDownloadStatus("Right-click to save!")
      setTimeout(() => setDownloadStatus(""), 3000)

      console.log("✅ Fallback method - opened in new tab")
    } catch (error) {
      console.error("❌ All download methods failed:", error)
      setDownloadStatus("Download failed - try right-click")
      setTimeout(() => setDownloadStatus(""), 3000)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleCopyPrompt = async (prompt: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }

    try {
      await navigator.clipboard.writeText(prompt)
      console.log("✅ Prompt copied to clipboard!")
      // You could add a toast notification here
    } catch (error) {
      console.error("❌ Failed to copy prompt:", error)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = prompt
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const suggestedPrompts = [
    "A cyberpunk city with neon lights reflecting in rain puddles",
    "A magical forest with glowing mushrooms and fairy lights",
    "A steampunk airship floating above Victorian London",
    "A cozy library with floating books and warm candlelight",
    "A dragon made of cherry blossoms in a Japanese garden",
    "An underwater palace with coral architecture and sea creatures",
  ]

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-purple-400" />
              Imagine
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </h1>
            <p className="text-sm text-gray-400">AI-powered image generation • {images.length} creations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Share className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Download Status */}
      {downloadStatus && (
        <div className="px-4 py-2 bg-blue-900/20 border-b border-blue-700/30">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>{downloadStatus}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {/* Suggested Prompts */}
        {images.length <= 6 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-300">✨ Try these prompts:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedPrompts.slice(0, 4).map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => setPrompt(suggestion)}
                  className="text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-purple-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800 relative">
                  {image.isGenerating ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-3"
                        />
                        <p className="text-sm text-purple-300 font-medium">Creating your masterpiece...</p>
                        <p className="text-xs text-purple-400 mt-1 px-2">"{image.prompt}"</p>
                        <div className="flex justify-center gap-1 mt-2">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-purple-400 rounded-full"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={image.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          const fallbackSeed = Math.floor(Math.random() * 1000)
                          target.src = `https://picsum.photos/seed/error${fallbackSeed}/400/400`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-black/50 text-white hover:bg-black/70"
                            onClick={(e) => handleCopyPrompt(image.prompt, e)}
                            title="Copy prompt"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-black/50 text-white hover:bg-black/70"
                            onClick={(e) => handleDownload(image, e)}
                            disabled={downloadingId === image.id}
                            title="Download image"
                          >
                            {downloadingId === image.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              >
                                <Download className="w-4 h-4" />
                              </motion.div>
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Category Badge */}
                      {image.category && (
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-medium">
                            {image.category}
                          </span>
                        </div>
                      )}

                      {/* Time stamp */}
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs bg-black/50 text-white px-2 py-1 rounded-full">
                          {formatTimeAgo(image.timestamp)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Prompt Preview */}
                <div className="mt-2 px-1">
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{image.prompt}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <div className="text-center py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">Start Creating</h3>
              <p className="text-sm">Describe what you want to see and watch AI bring it to life!</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 bg-gray-800 rounded-2xl p-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you want to create..."
            disabled={isGenerating}
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
          />

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6"
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
          <span>✨ Powered by AI • Press Enter to generate • Multiple download methods available</span>
        </div>
      </div>

      {/* Image Detail Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generated Image</h3>
                <Button
                  onClick={() => setSelectedImage(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <img
                src={selectedImage.imageUrl || "/placeholder.svg"}
                alt={selectedImage.prompt}
                className="w-full rounded-xl mb-4"
              />

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-400">Prompt:</label>
                  <p className="text-white mt-1">{selectedImage.prompt}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Generated {formatTimeAgo(selectedImage.timestamp)}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => handleCopyPrompt(selectedImage.prompt)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => handleDownload(selectedImage)}
                      disabled={downloadingId === selectedImage.id}
                    >
                      {downloadingId === selectedImage.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                        </motion.div>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
