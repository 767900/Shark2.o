"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

const searchingTexts = [
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
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const currentText = searchingTexts[currentTextIndex]
    let charIndex = 0
    setDisplayText("")
    setIsTyping(true)

    // Typing animation
    const typingInterval = setInterval(() => {
      if (charIndex < currentText.length) {
        setDisplayText(currentText.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)

        // Wait before moving to next text
        setTimeout(() => {
          setCurrentTextIndex((prev) => (prev + 1) % searchingTexts.length)
        }, 1500)
      }
    }, 80)

    return () => clearInterval(typingInterval)
  }, [currentTextIndex])

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 min-w-[280px]">
      <div className="flex items-center gap-3">
        {/* Animated search icon */}
        <motion.div
          className="w-6 h-6 text-cyan-400"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
          }}
        >
          🔍
        </motion.div>

        {/* Dynamic text with typing effect */}
        <div className="flex-1">
          <motion.span
            className="text-white/90 text-sm font-medium"
            key={currentTextIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayText}
            {isTyping && (
              <motion.span
                className="text-cyan-400 ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
              >
                |
              </motion.span>
            )}
          </motion.span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-white/10 rounded-full h-1 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  )
}
