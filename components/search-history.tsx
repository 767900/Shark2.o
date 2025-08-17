"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { History, X, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchHistoryItem {
  id: string
  query: string
  timestamp: Date
}

interface SearchHistoryProps {
  onSelectHistory: (query: string) => void
  currentQuery: string
}

export default function SearchHistory({ onSelectHistory, currentQuery }: SearchHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<SearchHistoryItem[]>([])

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("shark-search-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(historyWithDates)
      } catch (error) {
        console.error("Error loading search history:", error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shark-search-history", JSON.stringify(history))
  }, [history])

  // Add new search to history
  const addToHistory = (query: string) => {
    if (!query.trim()) return

    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
    }

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase())
      // Add new item at the beginning and limit to 50 items
      return [newItem, ...filtered].slice(0, 50)
    })
  }

  // Remove specific item from history
  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  // Clear all history
  const clearAllHistory = () => {
    setHistory([])
    setIsOpen(false)
  }

  // Handle selecting a history item
  const handleSelectHistory = (query: string) => {
    onSelectHistory(query)
    setIsOpen(false)
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  // Expose addToHistory function globally
  useEffect(() => {
    ;(window as any).addToSearchHistory = addToHistory
  }, [])

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <>
      {/* History Button */}
      <Button
        onClick={() => setIsOpen(true)}
        disabled={history.length === 0}
        className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all shadow-lg disabled:opacity-50"
        title={`Search History (${history.length})`}
      >
        <History className="w-5 h-5" />
      </Button>

      {/* History Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* History Panel */}
            <motion.div
              className={`fixed ${isMobile ? "inset-x-4 top-20 bottom-20" : "right-4 top-20 bottom-20 w-96"} bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 z-50 flex flex-col`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Search History</h3>
                  <span className="text-sm text-gray-500">({history.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <Button
                      onClick={clearAllHistory}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                      title="Clear All History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-2">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Search className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-center">No search history yet</p>
                    <p className="text-sm text-center mt-2">Your searches will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {history.map((item) => (
                      <motion.div
                        key={item.id}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleSelectHistory(item.query)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 truncate font-medium">{item.query}</p>
                          <p className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromHistory(item.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-red-100 hover:bg-red-200 text-red-600 transition-all"
                          title="Remove from history"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {history.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50/50">
                  <p className="text-xs text-gray-500 text-center">
                    Click any search to use it again • History is saved locally
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
