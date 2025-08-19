"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const searchActivities = [
  { icon: "🔍", text: "Searching knowledge base" },
  { icon: "📚", text: "Analyzing academic sources" },
  { icon: "🌐", text: "Gathering web insights" },
  { icon: "🧠", text: "Processing information" },
  { icon: "📊", text: "Cross-referencing data" },
  { icon: "🔬", text: "Verifying facts" },
  { icon: "💡", text: "Synthesizing insights" },
  { icon: "🎯", text: "Curating best answers" },
  { icon: "🌟", text: "Finalizing response" },
  { icon: "✨", text: "Almost ready" },
]

export default function TypingIndicator() {
  const [currentActivity, setCurrentActivity] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const activity = searchActivities[currentActivity]
    const fullText = activity.text

    if (isTyping) {
      let currentIndex = 0
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          setIsTyping(false)
          setTimeout(() => {
            setCurrentActivity((prev) => (prev + 1) % searchActivities.length)
            setIsTyping(true)
          }, 1500)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [currentActivity, isTyping])

  return (
    <motion.div
      className="flex items-center gap-4 p-6 bg-gray-900/50 rounded-xl border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Animated icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="text-2xl"
      >
        {searchActivities[currentActivity].icon}
      </motion.div>

      {/* Dynamic text */}
      <div className="flex-1">
        <div className="text-white font-medium mb-2">𝕏𝕪𝕝𝕠𝔾𝕖𝕟 is thinking...</div>
        <div className="text-gray-300 text-sm">
          {displayText}
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
              className="ml-1 text-cyan-400"
            >
              |
            </motion.span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ width: "50%" }}
          />
        </div>
      </div>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-cyan-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
