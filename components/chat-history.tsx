"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Trash2, MessageSquare, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatStorage } from "@/lib/chat-storage"
import type { Message } from "@/types/chat"

interface ChatHistoryProps {
  isOpen: boolean
  onClose: () => void
  onLoadSession: (messages: Message[]) => void
}

export default function ChatHistory({ isOpen, onClose, onLoadSession }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [filteredSessions, setFilteredSessions] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = sessions.filter(
        (session) =>
          session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.messages?.some((msg: Message) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredSessions(filtered)
    } else {
      setFilteredSessions(sessions)
    }
  }, [searchQuery, sessions])

  const loadSessions = () => {
    const allSessions = ChatStorage.getAllSessions()
    setSessions(allSessions)
    setFilteredSessions(allSessions)
  }

  const handleLoadSession = (sessionMessages: Message[]) => {
    onLoadSession(sessionMessages)
    handleClose()
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    ChatStorage.deleteSession(sessionId)
    loadSessions()
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all chat history?")) {
      ChatStorage.clearAllSessions()
      loadSessions()
    }
  }

  const handleClose = () => {
    setSelectedSession(null)
    setSearchQuery("")
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const formatDate = (timestamp: any): string => {
    try {
      let date: Date
      if (timestamp instanceof Date) {
        date = timestamp
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp)
      } else if (typeof timestamp === "number") {
        date = new Date(timestamp)
      } else {
        return "Unknown date"
      }

      if (isNaN(date.getTime())) {
        return "Unknown date"
      }

      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        return "Today"
      } else if (diffDays === 2) {
        return "Yesterday"
      } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`
      } else {
        return date.toLocaleDateString()
      }
    } catch (error) {
      return "Unknown date"
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Chat History</h2>
              <span className="text-sm text-white/60 bg-white/10 px-2 py-1 rounded-full">
                {filteredSessions.length} conversations
              </span>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-2"
              title="Close History"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search and Controls */}
          <div className="p-4 border-b border-white/20 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-white/60">
                {searchQuery ? `Found ${filteredSessions.length} results` : `${sessions.length} total conversations`}
              </p>
              {sessions.length > 0 && (
                <Button
                  onClick={handleClearAll}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-16 h-16 text-white/30 mb-4" />
                <h3 className="text-lg font-semibold text-white/70 mb-2">
                  {searchQuery ? "No conversations found" : "No chat history yet"}
                </h3>
                <p className="text-white/50">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Start a conversation to see your chat history here"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg p-4 cursor-pointer transition-all duration-200"
                    onClick={() => handleLoadSession(session.messages)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate mb-1">
                          {session.title || "Untitled Conversation"}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(session.timestamp)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {session.messages?.length || 0} messages
                          </div>
                        </div>
                        {session.messages && session.messages.length > 0 && (
                          <p className="text-xs text-white/50 mt-2 line-clamp-2">
                            {session.messages[session.messages.length - 1]?.content?.substring(0, 100)}
                            {(session.messages[session.messages.length - 1]?.content?.length || 0) > 100 && "..."}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 bg-black/50">
            <div className="flex items-center justify-between text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>History is saved locally in your browser</span>
              </div>
              <span>🦈 Shark 2.0</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
