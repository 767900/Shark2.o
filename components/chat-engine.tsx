"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

interface ChatEngineProps {
  reply: string
}

export default function ChatEngine({ reply }: ChatEngineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="mb-8"
    >
      <Card className="bg-black/50 border-cyan-400/30 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-400">JERVIS RESPONSE</h3>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-cyan-100 leading-relaxed"
          >
            {reply}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
