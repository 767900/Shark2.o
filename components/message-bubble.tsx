"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Citations from "@/components/citations"
import RelatedQuestions from "@/components/related-questions"
import type { Message } from "@/types/chat"
import type { JSX } from "react/jsx-runtime"

interface MessageBubbleProps {
  message: Message
  onRelatedQuestionClick?: (question: string) => void
}

// Safe timestamp formatting function
const formatTimestamp = (timestamp: any): string => {
  try {
    let date: Date

    if (timestamp instanceof Date) {
      date = timestamp
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp)
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp)
    } else {
      return "Now"
    }

    if (isNaN(date.getTime())) {
      return "Now"
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    console.warn("Error formatting timestamp:", error)
    return "Now"
  }
}

// Function to format AI response content with proper structure and improved colors
const formatAIContent = (content: string) => {
  const lines = content.split("\n")
  const formattedElements: JSX.Element[] = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      formattedElements.push(<div key={`space-${index}`} className="h-6" />)
      return
    }

    // Main headings (lines that end with colon or are in **bold**)
    if (trimmedLine.endsWith(":") || (trimmedLine.startsWith("**") && trimmedLine.endsWith("**"))) {
      const headingText = trimmedLine.replace(/\*\*/g, "").replace(":", "")
      formattedElements.push(
        <h2
          key={`heading-${index}`}
          className="text-2xl md:text-3xl font-bold text-white mb-6 mt-8 first:mt-0 leading-tight"
        >
          {headingText}
        </h2>,
      )
      return
    }

    // Numbered headings (like "1. Early Life and Influences")
    if (/^\d+\.\s/.test(trimmedLine)) {
      formattedElements.push(
        <h2
          key={`numbered-heading-${index}`}
          className="text-xl md:text-2xl font-bold text-white mb-6 mt-8 first:mt-0 leading-tight"
        >
          {trimmedLine}
        </h2>,
      )
      return
    }

    // Bullet points
    if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ") || trimmedLine.startsWith("**•")) {
      const bulletText = trimmedLine.replace(/^\*\*•\s*/, "").replace(/^[•-]\s*/, "")
      const parts = bulletText.split(":")

      if (parts.length > 1) {
        // Format as "Term: Description"
        const term = parts[0].replace(/\*\*/g, "")
        const description = parts.slice(1).join(":").replace(/\*\*/g, "")

        formattedElements.push(
          <div key={`bullet-${index}`} className="mb-6 flex items-start gap-4">
            <span className="text-cyan-300 text-xl mt-1 font-bold flex-shrink-0">•</span>
            <div className="flex-1">
              <span className="font-bold text-white text-lg md:text-xl">{term}:</span>
              <span className="text-gray-100 text-lg md:text-xl ml-2 leading-relaxed">{description}</span>
            </div>
          </div>,
        )
      } else {
        // Regular bullet point
        formattedElements.push(
          <div key={`bullet-${index}`} className="mb-5 flex items-start gap-4">
            <span className="text-cyan-300 text-xl mt-1 font-bold flex-shrink-0">•</span>
            <span className="text-gray-100 text-lg md:text-xl leading-relaxed flex-1">
              {bulletText.replace(/\*\*/g, "")}
            </span>
          </div>,
        )
      }
      return
    }

    // Regular paragraphs
    formattedElements.push(
      <p key={`para-${index}`} className="text-gray-100 text-lg md:text-xl leading-relaxed mb-6 font-normal">
        {trimmedLine}
      </p>,
    )
  })

  return formattedElements
}

export default function MessageBubble({ message, onRelatedQuestionClick }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type)
    console.log(`Feedback: ${type} for message:`, message.id)
  }

  const isUser = message.role === "user"
  const isError = message.isError

  // For user messages, keep the bubble format with improved colors
  if (isUser) {
    return (
      <motion.div
        className="flex gap-3 justify-end mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-end max-w-[85%] md:max-w-[80%]">
          <motion.div
            className="relative px-4 md:px-5 py-3 md:py-4 rounded-2xl backdrop-blur-sm border shadow-lg bg-cyan-500/30 border-cyan-400/50 text-white rounded-br-md"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="prose prose-invert max-w-none">
              <p className="text-white font-medium mb-0 leading-relaxed text-base md:text-lg">{message.content}</p>
            </div>

            {message.hasImage && (
              <div className="mt-3 text-sm text-cyan-100 flex items-center gap-2 bg-cyan-400/20 rounded-lg px-3 py-1">
                📸 <span>Image attached</span>
              </div>
            )}

            {message.isVoice && (
              <div className="mt-3 text-sm text-cyan-100 flex items-center gap-2 bg-cyan-400/20 rounded-lg px-3 py-1">
                🎤 <span>Voice message</span>
              </div>
            )}

            <div className="text-sm mt-3 text-cyan-100 font-medium">{formatTimestamp(message.timestamp)}</div>
          </motion.div>
        </div>

        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-xl flex-shrink-0 shadow-lg border-2 border-white/20"
          animate={{
            boxShadow: [
              "0 0 15px rgba(6, 182, 212, 0.4)",
              "0 0 25px rgba(147, 51, 234, 0.6)",
              "0 0 15px rgba(6, 182, 212, 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          👤
        </motion.div>
      </motion.div>
    )
  }

  // For AI messages, use full-screen book-like format - NO CONTAINERS ON MOBILE
  return (
    <motion.div
      className="w-full mb-8 md:mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* AI Avatar and Header - Minimal on mobile */}
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 md:bg-black/30 md:backdrop-blur-sm md:rounded-xl md:p-4 md:border md:border-white/10">
        <motion.div
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center text-xl md:text-2xl flex-shrink-0 shadow-lg border-2 border-white/20"
          animate={{
            boxShadow: [
              "0 0 15px rgba(34, 197, 94, 0.4)",
              "0 0 25px rgba(20, 184, 166, 0.6)",
              "0 0 15px rgba(34, 197, 94, 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          🦈
        </motion.div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg md:text-xl">𝕏𝕪𝕝𝕠𝔾𝕖𝕟</h3>
          <p className="text-gray-300 text-sm font-medium">{formatTimestamp(message.timestamp)}</p>
        </div>
      </div>

      {/* Full-screen content area - NO BACKGROUND/BORDERS ON MOBILE */}
      <div className="w-full md:bg-black/20 md:backdrop-blur-sm md:rounded-xl md:p-6 md:border md:border-white/10">
        {/* Main content with book-like formatting */}
        <div className="prose prose-invert prose-lg max-w-none">
          {isError ? (
            <div className="bg-red-500/30 border border-red-400/50 rounded-xl p-4 md:p-6">
              <p className="text-red-100 text-lg md:text-xl leading-relaxed font-medium">{message.content}</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">{formatAIContent(message.content)}</div>
          )}
        </div>

        {/* Image indicator with better visibility */}
        {message.hasImage && (
          <div className="mt-6 text-base text-green-200 flex items-center gap-3 bg-green-400/20 rounded-xl px-4 py-3 w-fit border border-green-400/30">
            📸 <span className="font-medium">Image analyzed</span>
          </div>
        )}

        {/* Voice indicator with better visibility */}
        {message.isVoice && (
          <div className="mt-6 text-base text-blue-200 flex items-center gap-3 bg-blue-400/20 rounded-xl px-4 py-3 w-fit border border-blue-400/30">
            🎤 <span className="font-medium">Voice response</span>
          </div>
        )}

        {/* Action Buttons - Hidden on mobile, shown on desktop */}
        {!isError && (
          <div className="hidden md:flex items-center gap-4 mt-8 pt-6 border-t border-white/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-gray-200 hover:text-white hover:bg-white/20 px-4 py-3 rounded-xl border border-white/10 font-medium"
              title="Copy response"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback("up")}
              className={`px-4 py-3 rounded-xl border font-medium ${
                feedback === "up"
                  ? "text-green-200 hover:text-green-100 bg-green-400/20 border-green-400/30"
                  : "text-gray-200 hover:text-white hover:bg-white/20 border-white/10"
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Good
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback("down")}
              className={`px-4 py-3 rounded-xl border font-medium ${
                feedback === "down"
                  ? "text-red-200 hover:text-red-100 bg-red-400/20 border-red-400/30"
                  : "text-gray-200 hover:text-white hover:bg-white/20 border-white/10"
              }`}
              title="Poor response"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Poor
            </Button>
          </div>
        )}

        {/* Citations with better visibility */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/10">
            <Citations citations={message.citations} />
          </div>
        )}

        {/* Related Questions with better visibility */}
        {message.related_questions && message.related_questions.length > 0 && onRelatedQuestionClick && (
          <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/10">
            <RelatedQuestions questions={message.related_questions} onQuestionClick={onRelatedQuestionClick} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
