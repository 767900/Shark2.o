"use client"

import { motion } from "framer-motion"
import { ExternalLink, Globe } from "lucide-react"

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
      <h4 className="text-xs font-semibold mb-3 opacity-80 flex items-center gap-2">
        <Globe className="w-3 h-3" />🌐 LIVE SOURCES (Real-time):
      </h4>
      <div className="space-y-2">
        {citations.slice(0, 4).map((citation, index) => (
          <motion.a
            key={index}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-gradient-to-r from-blue-900/20 to-green-900/20 hover:from-blue-900/30 hover:to-green-900/30 transition-all border border-current/10 backdrop-blur-sm"
            whileHover={{ scale: 1.02, x: 4 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                {citation.title && (
                  <p className="text-sm font-medium mb-1 text-blue-200 line-clamp-2">{citation.title}</p>
                )}
                {citation.snippet && (
                  <p className="text-xs opacity-80 mb-2 line-clamp-3 text-gray-300">{citation.snippet}</p>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-xs opacity-60 truncate text-blue-300">{citation.url}</p>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
      <div className="mt-3 text-xs opacity-60 text-center">
        <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent font-medium">
          ✨ Powered by real-time search • Information updated live
        </span>
      </div>
    </motion.div>
  )
}
