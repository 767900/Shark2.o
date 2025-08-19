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
      {/* Content container - Full width on mobile, constrained on desktop */}
      <div className="w-full md:max-w-5xl md:mx-auto px-3 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8">
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
            className="flex flex-col items-start gap-4 px-3 md:px-4"
          >
            {/* Main thinking header */}
            <div className="flex items-center gap-3 md:gap-4 md:bg-black/30 md:backdrop-blur-sm md:rounded-xl md:p-4 md:border md:border-white/10">
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
              <div>
                <h3 className="text-white font-bold text-lg md:text-xl mb-1">𝕏𝕪𝕝𝕠𝔾𝕖𝕟 is thinking...</h3>
                <p className="text-gray-300 text-sm">Preparing comprehensive response</p>
              </div>
            </div>

            {/* Dynamic search indicator */}
            <div className="ml-13 md:ml-16">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
