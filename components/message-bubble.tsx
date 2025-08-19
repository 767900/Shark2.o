"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import SharkLogo from "@/components/shark-logo"
import Citations from "@/components/citations"
import RelatedQuestions from "@/components/related-questions"
import type { Message } from "@/types/chat"
import type { JSX } from "react/jsx-runtime"

interface MessageBubbleProps {
  message: Message
  onRelatedQuestionClick?: (question: string) => void
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

  const formatContent = (content: string) => {
    const lines = content.split("\n")
    const formattedLines: JSX.Element[] = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) {
        formattedLines.push(<div key={index} className="h-3 md:h-4" />)
        return
      }

      // Check for headings (lines ending with : or wrapped in **)
      if (trimmedLine.endsWith(":") || (trimmedLine.startsWith("**") && trimmedLine.endsWith("**"))) {
        const headingText = trimmedLine.replace(/\*\*/g, "").replace(/:$/, "")
        formattedLines.push(
          <h3
            key={index}
            className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 md:mb-4 mt-4 md:mt-6 first:mt-0"
          >
            {headingText}
          </h3>,
        )
        return
      }

      // Check for bullet points
      if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ")) {
        const bulletContent = trimmedLine.substring(2)

        // Check if it's a definition format (Term: Description)
        const colonIndex = bulletContent.indexOf(":")
        if (colonIndex > 0 && colonIndex < 50) {
          const term = bulletContent.substring(0, colonIndex)
          const description = bulletContent.substring(colonIndex + 1).trim()

          formattedLines.push(
            <div key={index} className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
              <span className="text-cyan-300 mt-1 text-sm md:text-lg">•</span>
              <div className="flex-1">
                <span className="font-bold text-white text-sm md:text-base">{term}:</span>
                <span className="text-gray-100 ml-1 text-sm md:text-base">{description}</span>
              </div>
            </div>,
          )
        } else {
          formattedLines.push(
            <div key={index} className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
              <span className="text-cyan-300 mt-1 text-sm md:text-lg">•</span>
              <span className="text-gray-100 flex-1 text-sm md:text-base">{bulletContent}</span>
            </div>,
          )
        }
        return
      }

      // Regular paragraph
      formattedLines.push(
        <p key={index} className="text-sm md:text-lg lg:text-xl text-gray-100 mb-3 md:mb-4 leading-relaxed">
          {trimmedLine}
        </p>,
      )
    })

    return formattedLines
  }

  if (message.role === "user") {
    return (
      <motion.div
        className="flex justify-end mb-3 md:mb-4 px-3 md:px-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-[85%] md:max-w-[80%] bg-cyan-500/30 backdrop-blur-sm border border-cyan-400/50 rounded-2xl px-3 md:px-4 py-2 md:py-3">
          <p className="text-white font-medium text-sm md:text-base">{message.content}</p>
          {message.hasImage && (
            <div className="mt-2 text-xs text-cyan-100 flex items-center gap-1">📸 Image attached</div>
          )}
          <div className="text-xs text-cyan-100 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mb-4 md:mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* AI Response - Full Screen Format */}
      <div className="px-3 md:px-4 lg:px-6">
        {/* Header - Minimal on mobile, container on desktop */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 md:bg-black/30 md:backdrop-blur-sm md:border md:border-white/10 md:rounded-xl md:p-4">
          <SharkLogo size="sm" animated={true} />
          <div>
            <h4 className="font-bold text-white text-sm md:text-base">𝕏𝕪𝕝𝕠𝔾𝕖𝕟</h4>
            <p className="text-xs text-gray-300">AI Assistant</p>
          </div>
          <div className="ml-auto text-xs text-gray-400">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>

        {/* Content - Full screen on mobile, container on desktop */}
        <div className="md:bg-black/20 md:backdrop-blur-sm md:border md:border-white/10 md:rounded-xl md:p-6">
          <div className="prose prose-invert max-w-none">{formatContent(message.content)}</div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 md:mt-6 md:bg-white/5 md:rounded-lg md:p-4">
              <Citations citations={message.citations} />
            </div>
          )}

          {/* Related Questions */}
          {message.related_questions && message.related_questions.length > 0 && (
            <div className="mt-4 md:mt-6 md:bg-white/5 md:rounded-lg md:p-4">
              <RelatedQuestions questions={message.related_questions} onQuestionClick={onRelatedQuestionClick} />
            </div>
          )}

          {/* Action Buttons - Hidden on mobile for cleaner reading */}
          <div className="hidden md:flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-gray-200 hover:text-white hover:bg-white/10"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback("up")}
              className={`text-gray-200 hover:text-white hover:bg-white/10 ${
                feedback === "up" ? "bg-green-500/20 text-green-300" : ""
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="ml-2">Good</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback("down")}
              className={`text-gray-200 hover:text-white hover:bg-white/10 ${
                feedback === "down" ? "bg-red-500/20 text-red-300" : ""
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="ml-2">Needs work</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
