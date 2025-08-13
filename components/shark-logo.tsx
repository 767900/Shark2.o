"use client"

import { motion } from "framer-motion"

interface SharkLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  glowing?: boolean
  className?: string
}

export default function SharkLogo({ size = "md", animated = true, glowing = false, className = "" }: SharkLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const SharkSVG = () => (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: glowing
            ? [
                "0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff",
                "0 0 15px #ff0080, 0 0 25px #ff0080, 0 0 35px #ff0080",
                "0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff",
              ]
            : "0 0 5px #00ffff, 0 0 10px #00ffff",
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* Main shark container */}
      <motion.div
        className="relative w-full h-full rounded-full bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 flex items-center justify-center border-2 border-cyan-400/50"
        animate={{
          background: glowing
            ? [
                "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
                "linear-gradient(135deg, #ec4899, #f59e0b, #06b6d4)",
                "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
              ]
            : "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
        }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        {/* Shark emoji with glow */}
        <motion.span
          className="text-white font-bold relative z-10"
          style={{
            fontSize: size === "sm" ? "16px" : size === "md" ? "24px" : size === "lg" ? "32px" : "40px",
            filter: "drop-shadow(0 0 8px rgba(0, 255, 255, 0.8))",
          }}
          animate={{
            textShadow: glowing
              ? [
                  "0 0 10px #00ffff, 0 0 20px #00ffff",
                  "0 0 15px #ff0080, 0 0 25px #ff0080, 0 0 35px #ff0080",
                  "0 0 10px #00ffff, 0 0 20px #00ffff",
                ]
              : "0 0 8px rgba(0, 255, 255, 0.6)",
            scale: glowing ? [1, 1.1, 1] : 1,
          }}
          transition={{
            textShadow: { duration: 2, repeat: Number.POSITIVE_INFINITY },
            scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
          }}
        >
          🦈
        </motion.span>

        {/* Animated particles around shark */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                top: "20%",
                left: "50%",
                transformOrigin: "0 200%",
                transform: `rotate(${i * 90}deg)`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.div>

        {/* Inner tech circuit pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 40 40">
          <motion.circle
            cx="20"
            cy="20"
            r="15"
            fill="none"
            stroke="rgba(0, 255, 255, 0.4)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            animate={{ strokeDashoffset: [0, -8] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <motion.circle
            cx="20"
            cy="20"
            r="10"
            fill="none"
            stroke="rgba(255, 0, 128, 0.4)"
            strokeWidth="0.3"
            strokeDasharray="1,3"
            animate={{ strokeDashoffset: [0, 8] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </svg>
      </motion.div>
    </div>
  )

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <SharkSVG />
      </motion.div>
    )
  }

  return <SharkSVG />
}
