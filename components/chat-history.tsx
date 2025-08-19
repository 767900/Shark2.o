"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, Trash2, Search, MessageSquare } from "lucide-react"
import { loadAllSessions, deleteSession, clearAllSessions } from "@/lib/chat-storage"
import type { Message } from "@/types/chat"

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  messages: Message[]
  messageCount: number
}

interface ChatHistoryProps {
  isOpen: boolean
  onClose: () => void
  onLoadSession: (messages: Message[]) => void
}

export default function ChatHistory({ isOpen, onClose, onLoadSession }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      console.log("📚 Loading chat sessions...")

      const allSessions = loadAllSessions()
      console.log("📚 Raw sessions loaded:", allSessions.length)

      const formattedSessions: ChatSession[] = allSessions.map((session, index) => {
        // Generate title from first user message
        const firstUserMessage = session.messages.find((msg) => msg.role === "user")
        const title = firstUserMessage
          ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
          : `Chat Session ${index + 1}`

        // Ensure timestamp is a Date object
        const timestamp = session.timestamp instanceof Date ? session.timestamp : new Date(session.timestamp)

        return {
          id: session.id || `session-${Date.now()}-${index}`,
          title,
          timestamp,
          messages: session.messages || [],
          messageCount: session.messages?.length || 0,
        }
      })

      // Sort by timestamp (newest first)
      formattedSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

      console.log("📚 Formatted sessions:", formattedSessions.length)
      setSessions(formattedSessions)
    } catch (error) {
      console.error("❌ Error loading sessions:", error)
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadSession = (session: ChatSession) => {
    console.log("📖 Loading session:", session.title)
    onLoadSession(session.messages)
    onClose()
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      console.log("🗑️ Deleted session:", sessionId)
    } catch (error) {
      console.error("❌ Error deleting session:", error)
    }
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all chat history?")) {
      try {
        clearAllSessions()
        setSessions([])
        console.log("🗑️ Cleared all sessions")
      } catch (error) {
        console.error("❌ Error clearing sessions:", error)
      }
    }
  }

  const filteredSessions = sessions.filter((session) => session.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Chat History</h2>
                <span className="text-sm text-gray-400">({sessions.length} sessions)</span>
              </div>
              <div className="flex items-center gap-2">
                {sessions.length > 0 && (
                  <motion.button
                    onClick={handleClearAll}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Clear All History"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                )}
                <motion.button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Search */}
            {sessions.length > 0 && (
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-96">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-400">Loading chat history...</div>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">
                    {searchTerm ? "No matching conversations" : "No chat history yet"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {searchTerm
                      ? "Try a different search term"
                      : "Start a conversation with XyloGen to see your chat history here"}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      className="group bg-gray-800 hover:bg-gray-750 rounded-lg p-4 cursor-pointer border border-gray-700 hover:border-gray-600 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLoadSession(session)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate mb-1">{session.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{formatDate(session.timestamp)}</span>
                            <span>{session.messageCount} messages</span>
                          </div>
                        </div>
                        <motion.button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all ml-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
