"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

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
      <h4 className="text-xs font-semibold mb-2 opacity-80 flex items-center gap-1">
        <MessageCircle className="w-3 h-3" />
        RELATED QUESTIONS:
      </h4>
      <div className="space-y-1">
        {questions.slice(0, 3).map((question, index) => (
          <motion.button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="block w-full text-left p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors border border-current/10 text-xs"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            💭 {question}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
