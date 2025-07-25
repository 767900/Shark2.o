"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

interface HUDProps {
  isAwake: boolean
  currentMode: string
  isListening: boolean
  isSpeaking: boolean
}

export default function HUD({ isAwake, currentMode, isListening, isSpeaking }: HUDProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Status Panel */}
      <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-black/50 border-cyan-400/30 backdrop-blur-sm h-48">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">SYSTEM STATUS</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Power:</span>
                <span className="text-green-400">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className={isAwake ? "text-green-400" : "text-yellow-400"}>{isAwake ? "ACTIVE" : "STANDBY"}</span>
              </div>
              <div className="flex justify-between">
                <span>Audio:</span>
                <span className={isListening ? "text-green-400 animate-pulse" : "text-gray-400"}>
                  {isListening ? "LISTENING" : "IDLE"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Voice:</span>
                <span className={isSpeaking ? "text-blue-400 animate-pulse" : "text-gray-400"}>
                  {isSpeaking ? "SPEAKING" : "READY"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Waveform Visualization */}
      <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-black/50 border-cyan-400/30 backdrop-blur-sm h-48">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">AUDIO WAVEFORM</h3>
            <div className="flex items-end justify-center h-24 gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-cyan-400 w-2"
                  animate={{
                    height: isListening || isSpeaking ? [Math.random() * 60 + 10, Math.random() * 60 + 10] : 4,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isListening || isSpeaking ? Number.POSITIVE_INFINITY : 0,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Command Center */}
      <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-black/50 border-cyan-400/30 backdrop-blur-sm h-48">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">COMMAND CENTER</h3>
            <div className="space-y-2 text-sm">
              <div className="text-cyan-300">• Say "Jervis" to activate</div>
              <div className="text-cyan-300">• Ask questions for chat</div>
              <div className="text-cyan-300">• Say "search for..." to search</div>
              <div className="text-cyan-300">• Voice responses enabled</div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-cyan-400/60">
                Current Mode: <span className="text-cyan-400">{currentMode.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
