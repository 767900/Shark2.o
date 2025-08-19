"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import SharkLogo from "@/components/shark-logo"

const searchActivities = [
  "🔍 Searching knowledge base...",
  "📚 Analyzing academic sources...",
  "🌐 Gathering web insights...",
  "🧠 Processing information...",
  "📊 Cross-referencing data...",
  "🔬 Verifying facts...",
  "💡 Synthesizing insights...",
  "🎯 Curating best answers...",
  "🌟 Finalizing response...",
  "✨ Almost ready...",
]

export default function TypingIndicator() {
  const [currentActivity, setCurrentActivity] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const activity = searchActivities[currentActivity]
    let currentIndex = 0
    setDisplayText("")
    setIsTyping(true)

    const typingInterval = setInterval(() => {
      if (currentIndex <= activity.length) {
        setDisplayText(activity.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)

        // Wait a bit then move to next activity
        setTimeout(() => {
          setCurrentActivity((prev) => (prev + 1) % searchActivities.length)
        }, 1000)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [currentActivity])

  return (
    <motion.div
      className="flex flex-col gap-3 px-4 py-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Main thinking indicator */}
      <div className="flex items-center gap-3 text-white/90">
        <SharkLogo size="sm" animated={true} glowing={true} />
        <span className="font-medium">𝕏𝕪𝕝𝕠𝔾𝕖𝕟 is thinking...</span>
      </div>

      {/* Dynamic search activity */}
      <motion.div
        className="ml-12 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="text-cyan-400"
          >
            🔍
          </motion.div>

          <div className="flex-1">
            <span className="text-gray-200 font-mono text-sm">
              {displayText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                  className="text-cyan-400"
                >
                  |
                </motion.span>
              )}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500"
            animate={{
              x: ["-100%", "100%"],
              backgroundPosition: ["0% 50%", "100% 50%"],
            }}
            transition={{
              x: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              backgroundPosition: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            }}
            style={{ backgroundSize: "200% 200%" }}
          />
        </div>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
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
    </motion.div>
  )
}
