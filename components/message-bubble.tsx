"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Copy, ThumbsUp, ThumbsDown, Share2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import Citations from "@/components/citations"
import RelatedQuestions from "@/components/related-questions"
import type { Message } from "@/types/chat"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

interface MessageBubbleProps {
  message: Message
  onRelatedQuestionClick?: (question: string) => void
}

export default function MessageBubble({ message, onRelatedQuestionClick }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(feedback === type ? null : type)
  }

  // Format content with better structure
  const formatContent = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim())
    const formattedLines: JSX.Element[] = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      // Skip empty lines
      if (!trimmedLine) return

      // Handle headings (lines ending with : or wrapped in **)
      if (trimmedLine.endsWith(":") || (trimmedLine.startsWith("**") && trimmedLine.endsWith("**"))) {
        const headingText = trimmedLine.replace(/\*\*/g, "").replace(/:$/, "")
        formattedLines.push(
          <h3 key={index} className="text-white font-bold text-2xl mt-8 mb-4 first:mt-0">
            {headingText}
          </h3>,
        )
      }
      // Handle bullet points
      else if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
        const bulletContent = trimmedLine.replace(/^[•\-*]\s*/, "")

        // Check if it's a definition (contains :)
        if (bulletContent.includes(":")) {
          const [term, ...descParts] = bulletContent.split(":")
          const description = descParts.join(":").trim()
          formattedLines.push(
            <div key={index} className="flex gap-3 mb-4">
              <span className="text-cyan-300 text-xl mt-1 flex-shrink-0">•</span>
              <p className="text-lg leading-relaxed">
                <span className="text-white font-bold">{term.trim()}:</span>{" "}
                <span className="text-gray-100">{description}</span>
              </p>
            </div>,
          )
        } else {
          formattedLines.push(
            <div key={index} className="flex gap-3 mb-4">
              <span className="text-cyan-300 text-xl mt-1 flex-shrink-0">•</span>
              <p className="text-gray-100 text-lg leading-relaxed">{bulletContent}</p>
            </div>,
          )
        }
      }
      // Handle regular paragraphs
      else {
        formattedLines.push(
          <p key={index} className="text-gray-100 text-lg leading-relaxed mb-6">
            {trimmedLine}
          </p>,
        )
      }
    })

    return formattedLines
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="bg-cyan-500/30 backdrop-blur-sm border border-cyan-400/50 rounded-2xl px-6 py-4 shadow-lg">
            <p className="text-white font-medium text-lg">{message.content}</p>
            {message.timestamp && (
              <p className="text-cyan-100 text-sm mt-2 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-lg font-medium text-white flex-shrink-0 shadow-lg border-2 border-white/20">
            👤
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      {/* AI Response Header */}
      <div className="flex items-center gap-4 mb-6 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <motion.div
          className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg border-2 border-white/20"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          🦈
        </motion.div>
        <div className="flex-1">
          <h2 className="text-white font-bold text-xl">𝕏𝕪𝕝𝕠𝔾𝕖𝕟</h2>
          <p className="text-gray-300 text-sm">AI Assistant</p>
        </div>
        {message.timestamp && (
          <p className="text-gray-400 text-sm">{new Date(message.timestamp).toLocaleTimeString()}</p>
        )}
      </div>

      {/* Full-screen content area */}
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10 shadow-xl">
        <div className="prose prose-invert max-w-none">{formatContent(message.content)}</div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback("up")}
            className={`transition-colors ${
              feedback === "up" ? "text-green-400 bg-green-400/10" : "text-gray-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Good
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback("down")}
            className={`transition-colors ${
              feedback === "down" ? "text-red-400 bg-red-400/10" : "text-gray-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            Poor
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        {/* Citations and related questions */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
            <Citations citations={message.citations} />
          </div>
        )}

        {message.relatedQuestions && message.relatedQuestions.length > 0 && (
          <div className="mt-6">
            <RelatedQuestions questions={message.relatedQuestions} onQuestionClick={onRelatedQuestionClick} />
          </div>
        )}
      </div>
    </div>
  )
}
