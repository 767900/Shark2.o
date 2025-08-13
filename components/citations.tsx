"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"

interface Citation {
  url: string
  title?: string
  snippet?: string
}

interface CitationsProps {
  citations: Citation[]
}

export default function Citations({ citations }: CitationsProps) {
  if (!citations || citations.length === 0) return null

  return (
    <motion.div
      className="mt-4 pt-3 border-t border-current/20"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="text-xs font-semibold mb-2 opacity-80">📚 SOURCES:</h4>
      <div className="space-y-2">
        {citations.slice(0, 3).map((citation, index) => (
          <motion.a
            key={index}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors border border-current/10"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-2">
              <ExternalLink className="w-3 h-3 mt-0.5 opacity-60 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {citation.title && <p className="text-xs font-medium truncate mb-1">{citation.title}</p>}
                {citation.snippet && <p className="text-xs opacity-70 line-clamp-2">{citation.snippet}</p>}
                <p className="text-xs opacity-50 truncate mt-1">{citation.url}</p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  )
}
