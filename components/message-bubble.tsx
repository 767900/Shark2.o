"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Citations from "@/components/citations"
import RelatedQuestions from "@/components/related-questions"
import type { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
  onRelatedQuestionClick?: (question: string) => void
}

export default function MessageBubble({ message, onRelatedQuestionClick }: MessageBubbleProps) {
  const [isMobile, setIsMobile] = useState(false)
  const isUser = message.role === "user"
  const isError = message.isError

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 ${isMobile ? "px-2" : ""}`}>
      <div
        className={`flex items-start gap-${isMobile ? "3" : "4"} max-w-[${isMobile ? "95%" : "85%"}] ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        {isUser ? (
          <motion.div
            className={`${isMobile ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white flex items-center justify-center ${isMobile ? "text-xs" : "text-sm"} font-bold border border-white/20`}
            whileHover={{ scale: 1.1 }}
          >
            👤
          </motion.div>
        ) : (
          <motion.div
            className={`${isMobile ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center ${isMobile ? "text-sm" : "text-lg"} border border-white/20`}
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
          className={`rounded-2xl ${isMobile ? "px-4 py-3" : "px-6 py-4"} border ${
            isUser
              ? "bg-gradient-to-r from-cyan-600/20 to-purple-600/20 text-cyan-100 border-cyan-400/50"
              : isError
                ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 text-red-200 border-red-400/50"
                : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-100 border-purple-400/50"
          }`}
          whileHover={{ scale: isMobile ? 1.01 : 1.02, y: isMobile ? -1 : -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className={`${isMobile ? "text-base" : "text-lg"} leading-relaxed whitespace-pre-wrap font-semibold text-white`}
          >
            {message.content}
          </div>

          {/* Citations */}
          {message.citations && <Citations citations={message.citations} />}

          {/* Related Questions */}
          {message.related_questions && onRelatedQuestionClick && (
            <RelatedQuestions questions={message.related_questions} onQuestionClick={onRelatedQuestionClick} />
          )}

          <div
            className={`flex items-center justify-between mt-3 pt-2 border-t border-current/20 ${isMobile ? "flex-col gap-2" : ""}`}
          >
            <span className={`${isMobile ? "text-xs" : "text-xs"} opacity-70 font-medium`}>
              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className={`flex items-center gap-2 ${isMobile ? "text-xs" : ""}`}>
              {message.isVoice && <span className="text-xs opacity-70 font-medium">🎤 VOICE</span>}
              {message.hasImage && <span className="text-xs opacity-70 font-medium">📸 IMAGE</span>}
              {!isUser && !isError && (
                <span
                  className={`${isMobile ? "text-xs" : "text-xs"} opacity-70 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold`}
                >
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
