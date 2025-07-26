"use client"

import { motion } from "framer-motion"

export default function SharkLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* Swimming shark */}
        <motion.div
          className="text-4xl"
          animate={{
            x: [-20, 20, -20],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          🦈
        </motion.div>

        {/* Bubble trail */}
        <div className="absolute -right-8 top-2 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full opacity-60"
              animate={{
                y: [-10, -20, -10],
                opacity: [0.6, 0.2, 0.6],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Water ripples */}
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <div className="w-16 h-2 bg-blue-400/20 rounded-full" />
        </motion.div>
      </div>
    </div>
  )
}
