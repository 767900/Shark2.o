"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Search, ExternalLink } from "lucide-react"

interface SearchResult {
  title: string
  link: string
  snippet: string
}

interface SearchEngineProps {
  results: SearchResult[]
}

export default function SearchEngine({ results }: SearchEngineProps) {
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
            <Search className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-400">SEARCH RESULTS</h3>
          </div>
          <div className="space-y-4">
            {results?.slice(0, 5).map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-l-2 border-cyan-400/30 pl-4"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <h4 className="text-cyan-300 font-medium mb-1">{result.title}</h4>
                    <p className="text-cyan-100/80 text-sm mb-2">{result.snippet}</p>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center gap-1"
                    >
                      {result.link}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
