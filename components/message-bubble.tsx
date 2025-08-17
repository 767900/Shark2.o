"use client"

import { motion } from "framer-motion"
import { User, Bot, AlertCircle } from "lucide-react"
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
    console.warn("Error formatting timestamp:", error)
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

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-3 max-w-[85%]`}>
        {/* Avatar */}
        <motion.div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-purple-500"
              : isError
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : "bg-gradient-to-r from-green-500 to-teal-500"
          } text-white shadow-lg`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {isUser ? (
            <User className="w-4 h-4" />
          ) : isError ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </motion.div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          {/* Message Bubble */}
          <motion.div
            className={`relative px-4 py-3 rounded-2xl shadow-lg backdrop-blur-md border ${
              isUser
                ? "bg-black/80 text-white border-white/20 rounded-br-md"
                : isError
                  ? "bg-black/85 text-red-100 border-red-500/30 rounded-bl-md"
                  : "bg-black/85 text-white border-white/20 rounded-bl-md"
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Message Text */}
            <div className="prose prose-invert max-w-none">
              {message.content.split("\n").map((line, index) => (
                <p key={index} className="mb-2 last:mb-0 text-sm leading-relaxed">
                  {line}
                </p>
              ))}
            </div>

            {/* Image indicator */}
            {message.hasImage && (
              <div className="mt-2 text-xs opacity-70 flex items-center gap-1">📷 Image attached</div>
            )}

            {/* Voice indicator */}
            {message.isVoice && <div className="mt-2 text-xs opacity-70 flex items-center gap-1">🎤 Voice message</div>}
          </motion.div>

          {/* Timestamp */}
          <div className={`text-xs text-white/60 mt-1 ${isUser ? "text-right" : "text-left"}`}>
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
