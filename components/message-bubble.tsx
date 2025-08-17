"use client"

import { motion } from "framer-motion"
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react"
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
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      date = new Date(timestamp)
    } else {
      date = new Date()
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      date = new Date()
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }
}

export default function MessageBubble({ message, onRelatedQuestionClick }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isError = message.isError

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
            isUser
              ? "bg-gradient-to-r from-cyan-500 to-purple-500"
              : isError
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : "bg-gradient-to-r from-green-500 to-teal-500"
          }`}
          animate={
            !isUser && !isError
              ? {
                  boxShadow: [
                    "0 0 5px rgba(20, 184, 166, 0.5)",
                    "0 0 20px rgba(20, 184, 166, 0.8)",
                    "0 0 5px rgba(20, 184, 166, 0.5)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {isUser ? "👤" : isError ? "⚠️" : "🦈"}
        </motion.div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <motion.div
            className={`px-4 py-3 rounded-2xl backdrop-blur-md border shadow-lg ${
              isUser
                ? "bg-black/80 text-white border-white/20 rounded-br-md"
                : isError
                  ? "bg-black/85 text-red-200 border-red-400/30 rounded-bl-md"
                  : "bg-black/85 text-white border-white/20 rounded-bl-md"
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {/* Message Text */}
            <div className="prose prose-invert max-w-none">
              {message.content.split("\n").map((line, index) => (
                <p key={index} className="mb-2 last:mb-0 text-sm leading-relaxed">
                  {line}
                </p>
              ))}
            </div>

            {/* Voice Indicator */}
            {message.isVoice && (
              <div className="flex items-center gap-1 mt-2 text-xs text-white/60">
                <span>🎤</span>
                <span>Voice message</span>
              </div>
            )}

            {/* Image Indicator */}
            {message.hasImage && (
              <div className="flex items-center gap-1 mt-2 text-xs text-white/60">
                <span>📸</span>
                <span>Image attached</span>
              </div>
            )}

            {/* Action Buttons */}
            {!isUser && (
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
                  title="Good response"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
                  title="Poor response"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            )}
          </motion.div>

          {/* Timestamp */}
          <div className={`text-xs text-white/50 mt-1 px-1 ${isUser ? "text-right" : "text-left"}`}>
            {formatTimestamp(message.timestamp)}
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2 max-w-full">
              <Citations citations={message.citations} />
            </div>
          )}

          {/* Related Questions */}
          {message.related_questions && message.related_questions.length > 0 && onRelatedQuestionClick && (
            <div className="mt-3 max-w-full">
              <RelatedQuestions questions={message.related_questions} onQuestionClick={onRelatedQuestionClick} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
