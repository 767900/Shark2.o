"use client"

import { motion } from "framer-motion"

interface SharkAvatarProps {
  size?: "sm" | "md" | "lg"
  isActive?: boolean
  isSpeaking?: boolean
  className?: string
}

export default function SharkAvatar({
  size = "md",
  isActive = false,
  isSpeaking = false,
  className = "",
}: SharkAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center relative overflow-hidden ${className}`}
      animate={{
        scale: isSpeaking ? [1, 1.1, 1] : 1,
        boxShadow: isActive
          ? ["0 0 0 0 rgba(59, 130, 246, 0.7)", "0 0 0 10px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"]
          : "0 0 0 0 rgba(59, 130, 246, 0)",
      }}
      transition={{
        scale: { duration: 0.6, repeat: isSpeaking ? Number.POSITIVE_INFINITY : 0 },
        boxShadow: { duration: 2, repeat: isActive ? Number.POSITIVE_INFINITY : 0 },
      }}
    >
      {/* Animated background waves */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-400/30"
        animate={{
          x: [-20, 20, -20],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Shark emoji with glow effect */}
      <motion.span
        className="text-white font-bold relative z-10"
        style={{
          fontSize: size === "sm" ? "14px" : size === "md" ? "18px" : "22px",
          filter: "drop-shadow(0 0 4px rgba(0, 245, 255, 0.5))",
        }}
        animate={{
          textShadow: isActive
            ? ["0 0 4px rgba(0, 245, 255, 0.5)", "0 0 8px rgba(0, 245, 255, 0.8)", "0 0 4px rgba(0, 245, 255, 0.5)"]
            : "0 0 4px rgba(0, 245, 255, 0.5)",
        }}
        transition={{
          duration: 1.5,
          repeat: isActive ? Number.POSITIVE_INFINITY : 0,
        }}
      >
        🦈
      </motion.span>

      {/* Tech circuit overlay */}
      <motion.div
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 0.3 : 0.1 }}
        transition={{ duration: 0.5 }}
      >
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <path
            d="M5 20 L15 20 M25 20 L35 20 M20 5 L20 15 M20 25 L20 35"
            stroke="rgba(0, 245, 255, 0.6)"
            strokeWidth="0.5"
            strokeDasharray="1,2"
          />
          <circle cx="20" cy="20" r="2" fill="rgba(0, 245, 255, 0.4)" />
        </svg>
      </motion.div>
    </motion.div>
  )
}
