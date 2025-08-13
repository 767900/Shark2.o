"use client"

import { motion } from "framer-motion"
import Citations from "@/components/citations"
import RelatedQuestions from "@/components/related-questions"
import type { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
  onRelatedQuestionClick?: (question: string) => void
}

export default function MessageBubble({ message, onRelatedQuestionClick }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isError = message.isError

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex items-start gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        {isUser ? (
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold border border-white/20"
            whileHover={{ scale: 1.1 }}
          >
            👤
          </motion.div>
        ) : (
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-lg border border-white/20"
            animate={{
              boxShadow: isError
                ? ["0 0 5px #ff0000", "0 0 15px #ff0000", "0 0 5px #ff0000"]
                : ["0 0 5px #00ffff", "0 0 15px #ff0080", "0 0 5px #00ffff"],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            🦈
          </motion.div>
        )}

        {/* Message Content */}
        <motion.div
          className={`rounded-2xl px-6 py-4 border ${
            isUser
              ? "bg-gradient-to-r from-cyan-600/20 to-purple-600/20 text-cyan-100 border-cyan-400/50"
              : isError
                ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 text-red-200 border-red-400/50"
                : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-100 border-purple-400/50"
          }`}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{message.content}</p>

          {/* Citations */}
          {message.citations && <Citations citations={message.citations} />}

          {/* Related Questions */}
          {message.related_questions && onRelatedQuestionClick && (
            <RelatedQuestions questions={message.related_questions} onQuestionClick={onRelatedQuestionClick} />
          )}

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/20">
            <span className="text-xs opacity-70 font-mono">
              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="flex items-center gap-2">
              {message.isVoice && <span className="text-xs opacity-70">🎤 VOICE</span>}
              {message.hasImage && <span className="text-xs opacity-70">📸 IMAGE</span>}
              {!isUser && !isError && (
                <span className="text-xs opacity-70 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  🦈 SHARK 2.0
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
