"use client"

import { motion } from "framer-motion"
import { MessageCircle, Sparkles } from "lucide-react"

interface RelatedQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
}

export default function RelatedQuestions({ questions, onQuestionClick }: RelatedQuestionsProps) {
  if (!questions || questions.length === 0) return null

  return (
    <motion.div
      className="mt-4 pt-3 border-t border-current/20"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="text-xs font-semibold mb-3 opacity-80 flex items-center gap-2">
        <Sparkles className="w-3 h-3" />🔥 EXPLORE MORE:
      </h4>
      <div className="space-y-2">
        {questions.slice(0, 3).map((question, index) => (
          <motion.button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="block w-full text-left p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-pink-900/20 hover:from-purple-900/30 hover:to-pink-900/30 transition-all border border-current/10 backdrop-blur-sm"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-200">{question}</p>
                <p className="text-xs opacity-60 mt-1 text-pink-300">Click to explore this topic</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      <div className="mt-3 text-xs opacity-60 text-center">
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">
          💡 AI-suggested questions based on your topic
        </span>
      </div>
    </motion.div>
  )
}
