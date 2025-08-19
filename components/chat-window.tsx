"use client"

import { motion, AnimatePresence } from "framer-motion"
import MessageBubble from "@/components/message-bubble"
import TypingIndicator from "@/components/typing-indicator"
import type { Message } from "@/types/chat"

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  onRelatedQuestionClick?: (question: string) => void
}

export default function ChatWindow({ messages, isLoading, onRelatedQuestionClick }: ChatWindowProps) {
  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Content container with proper padding and better background */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MessageBubble message={message} onRelatedQuestionClick={onRelatedQuestionClick} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-start gap-4 px-4"
          >
            {/* Main thinking header */}
            <div className="flex items-center gap-4 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg border-2 border-white/20"
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
              <div>
                <h3 className="text-white font-bold text-xl mb-1">𝕏𝕪𝕝𝕠𝔾𝕖𝕟 is thinking...</h3>
                <p className="text-gray-300 text-sm">Preparing comprehensive response</p>
              </div>
            </div>

            {/* Dynamic search indicator */}
            <div className="ml-16">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
