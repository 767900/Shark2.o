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
    <svg
      viewBox="0 0 100 100"
      className={`${sizeClasses[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow effect */}
      {glowing && (
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Main shark body */}
      <motion.path
        d="M15 50 Q25 35 45 40 Q65 45 85 50 Q75 65 55 60 Q35 55 15 50 Z"
        fill="url(#sharkGradient)"
        stroke="url(#strokeGradient)"
        strokeWidth="1.5"
        filter={glowing ? "url(#glow)" : undefined}
        initial={animated ? { pathLength: 0, opacity: 0 } : {}}
        animate={animated ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Shark fin */}
      <motion.path
        d="M45 25 Q50 15 55 25 Q52 35 45 35 Z"
        fill="url(#finGradient)"
        stroke="url(#strokeGradient)"
        strokeWidth="1"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.5 }}
      />

      {/* Tail fin */}
      <motion.path
        d="M80 45 Q90 35 95 45 Q90 55 85 50 Q82 47 80 45 Z"
        fill="url(#tailGradient)"
        stroke="url(#strokeGradient)"
        strokeWidth="1"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.7 }}
      />

      {/* Eye */}
      <motion.circle
        cx="35"
        cy="45"
        r="3"
        fill="#00f5ff"
        initial={animated ? { scale: 0 } : {}}
        animate={animated ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 1 }}
      />

      {/* Eye glow */}
      <motion.circle
        cx="35"
        cy="45"
        r="5"
        fill="none"
        stroke="#00f5ff"
        strokeWidth="0.5"
        opacity="0.6"
        initial={animated ? { scale: 0, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 0.6 } : {}}
        transition={{ duration: 0.5, delay: 1.2 }}
      />

      {/* Tech lines/circuits */}
      <motion.path
        d="M25 48 L35 48 M40 48 L50 48 M55 48 L65 48"
        stroke="url(#techGradient)"
        strokeWidth="1"
        strokeDasharray="2,2"
        initial={animated ? { pathLength: 0, opacity: 0 } : {}}
        animate={animated ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 2, delay: 1.5 }}
      />

      <motion.path
        d="M30 52 L40 52 M45 52 L55 52"
        stroke="url(#techGradient)"
        strokeWidth="0.8"
        strokeDasharray="1,3"
        initial={animated ? { pathLength: 0, opacity: 0 } : {}}
        animate={animated ? { pathLength: 1, opacity: 0.6 } : {}}
        transition={{ duration: 2, delay: 1.7 }}
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="sharkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <linearGradient id="finGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="tailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>

        <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#00f5ff" />
        </linearGradient>
      </defs>
    </svg>
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
