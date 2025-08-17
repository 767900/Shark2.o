"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Trash2, MessageSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatStorage } from "@/lib/chat-storage"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  const loadSessions = () => {
    const allSessions = ChatStorage.getAllSessions()
    setSessions(allSessions)
  }

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    ChatStorage.deleteSession(sessionId)
    loadSessions()
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null)
    }
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      ChatStorage.clearAllSessions()
      setSessions([])
      setSelectedSession(null)
    }
  }

  const handleLoadSession = (session: ChatSession) => {
    onLoadSession(session.messages)
    handleClose()
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

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Panel - Session List */}
          <div className="w-1/3 border-r border-white/20 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat History
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/10 p-1"
                  title="Close History"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-sm"
                />
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-4 text-center text-white/60">
                  {searchQuery ? "No matching conversations found" : "No chat history yet"}
                </div>
              ) : (
                <div className="p-2">
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      className={`p-3 rounded-lg cursor-pointer mb-2 border transition-all ${
                        selectedSession?.id === session.id
                          ? "bg-cyan-500/20 border-cyan-400/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => setSelectedSession(session)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">{session.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-white/40" />
                            <span className="text-xs text-white/60">{formatDate(session.timestamp)}</span>
                            <span className="text-xs text-white/40">•</span>
                            <span className="text-xs text-white/40">{session.messageCount} messages</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 ml-2"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {sessions.length > 0 && (
              <div className="p-4 border-t border-white/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All History
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Session Preview */}
          <div className="flex-1 flex flex-col">
            {selectedSession ? (
              <>
                {/* Preview Header */}
                <div className="p-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedSession.title}</h3>
                      <p className="text-sm text-white/60">
                        {formatDate(selectedSession.timestamp)} • {selectedSession.messageCount} messages
                      </p>
                    </div>
                    <Button
                      onClick={() => handleLoadSession(selectedSession)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                    >
                      Load Chat
                    </Button>
                  </div>
                </div>

                {/* Messages Preview */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {selectedSession.messages.map((message, index) => (
                      <div
                        key={`${message.id}-${index}`}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === "user" ? "bg-cyan-500/20 text-white" : "bg-white/10 text-white"
                          }`}
                        >
                          <p className="text-sm">
                            {message.content.substring(0, 200)}
                            {message.content.length > 200 && "..."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-white/60">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to preview</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
