"use client"

import { motion } from "framer-motion"
import type { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isError = message.isError

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              : isError
                ? "bg-red-500 text-white"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
          }`}
        >
          {isUser ? "U" : isError ? "!" : "🦈"}
        </div>

        {/* Message Content */}
        <motion.div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              : isError
                ? "bg-red-500/20 border border-red-500/30 text-red-200"
                : "bg-white/10 backdrop-blur-sm border border-white/20 text-white"
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <div className="flex items-center gap-2">
              {message.isVoice && <span className="text-xs opacity-70">🎤</span>}
              {!isUser && !isError && <span className="text-xs opacity-70">🦈 Shark2.0</span>}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
