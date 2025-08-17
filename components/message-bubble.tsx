"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Citations from "@/components/citations"
import RelatedQuestions from "@/components/related-questions"
import type { Message } from "@/types/chat"

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
    // Here you could send feedback to your analytics
    console.log(`Feedback: ${type} for message:`, message.id)
  }

  const isUser = message.role === "user"
  const isError = message.isError

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-lg flex-shrink-0 shadow-lg"
          animate={{
            boxShadow: [
              "0 0 10px rgba(34, 197, 94, 0.3)",
              "0 0 20px rgba(20, 184, 166, 0.5)",
              "0 0 10px rgba(34, 197, 94, 0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          🦈
        </motion.div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        {/* Message Bubble */}
        <motion.div
          className={`relative px-4 py-3 rounded-2xl backdrop-blur-sm border shadow-lg ${
            isUser
              ? "bg-cyan-500/20 border-cyan-400/30 text-white"
              : isError
                ? "bg-red-500/20 border-red-400/30 text-red-100"
                : "bg-black/80 border-white/20 text-white"
          } ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Message Text */}
          <div className="prose prose-invert max-w-none">
            {message.content.split("\n").map((line, index) => {
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <h3 key={index} className="text-lg font-bold text-cyan-300 mb-2">
                    {line.replace(/\*\*/g, "")}
                  </h3>
                )
              }
              if (line.startsWith("• ")) {
                return (
                  <li key={index} className="text-white/90 mb-1 list-none">
                    <span className="text-cyan-400 mr-2">•</span>
                    {line.substring(2)}
                  </li>
                )
              }
              if (line.trim() === "") {
                return <br key={index} />
              }
              return (
                <p key={index} className="text-white/90 mb-2 last:mb-0 leading-relaxed">
                  {line}
                </p>
              )
            })}
          </div>

          {/* Image indicator */}
          {message.hasImage && (
            <div className="mt-2 text-xs text-white/60 flex items-center gap-1">
              📸 <span>Image attached</span>
            </div>
          )}

          {/* Voice indicator */}
          {message.isVoice && (
            <div className="mt-2 text-xs text-white/60 flex items-center gap-1">
              🎤 <span>Voice message</span>
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${isUser ? "text-cyan-200" : "text-white/50"}`}>
            {formatTimestamp(message.timestamp)}
          </div>
        </motion.div>

        {/* Action Buttons (only for AI messages) */}
        {!isUser && !isError && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
              title="Copy message"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback("up")}
              className={`p-1 h-auto ${
                feedback === "up"
                  ? "text-green-400 hover:text-green-300"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback("down")}
              className={`p-1 h-auto ${
                feedback === "down"
                  ? "text-red-400 hover:text-red-300"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              title="Poor response"
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 w-full">
            <Citations citations={message.citations} />
          </div>
        )}

        {/* Related Questions */}
        {message.related_questions && message.related_questions.length > 0 && onRelatedQuestionClick && (
          <div className="mt-3 w-full">
            <RelatedQuestions questions={message.related_questions} onQuestionClick={onRelatedQuestionClick} />
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-lg flex-shrink-0 shadow-lg"
          animate={{
            boxShadow: [
              "0 0 10px rgba(6, 182, 212, 0.3)",
              "0 0 20px rgba(147, 51, 234, 0.5)",
              "0 0 10px rgba(6, 182, 212, 0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          👤
        </motion.div>
      )}
    </motion.div>
  )
}
