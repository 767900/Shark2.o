"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2, Clock, MessageSquare, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatStorage } from "@/lib/chat-storage"
import type { Message } from "@/types/chat"

interface ChatHistoryProps {
  isOpen: boolean
  onClose: () => void
  onLoadSession: (messages: Message[]) => void
}

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  messages: Message[]
  messageCount: number
}

export default function ChatHistory({ isOpen, onClose, onLoadSession }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([])

  // Load sessions on component mount
  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  // Filter sessions based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = sessions.filter(
        (session) =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredSessions(filtered)
    } else {
      setFilteredSessions(sessions)
    }
  }, [searchQuery, sessions])

  const loadSessions = () => {
    const loadedSessions = ChatStorage.getAllSessions()
    setSessions(loadedSessions)
  }

  const deleteSession = (sessionId: string) => {
    ChatStorage.deleteSession(sessionId)
    loadSessions()
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null)
    }
  }

  const clearAllSessions = () => {
    ChatStorage.clearAllSessions()
    setSessions([])
    setSelectedSession(null)
  }

  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const handleLoadSession = (session: ChatSession) => {
    // Ensure all message timestamps are proper Date objects
    const messagesWithDates = session.messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
    }))

    onLoadSession(messagesWithDates)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-6xl h-[80vh] flex overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Panel - Sessions List */}
          <div className="w-1/3 border-r border-white/20 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">Chat History</h2>
                  <span className="text-sm text-white/60">({sessions.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={clearAllSessions}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    title="Clear All History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-4 text-center text-white/60">
                  {searchQuery ? "No conversations found" : "No chat history yet"}
                </div>
              ) : (
                <div className="p-2">
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                        selectedSession?.id === session.id
                          ? "bg-cyan-500/20 border border-cyan-500/30"
                          : "bg-white/5 hover:bg-white/10 border border-transparent"
                      }`}
                      onClick={() => setSelectedSession(session)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">{session.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MessageSquare className="w-3 h-3 text-white/40" />
                            <span className="text-xs text-white/60">{session.messageCount} messages</span>
                            <span className="text-xs text-white/40">•</span>
                            <span className="text-xs text-white/40">{formatRelativeTime(session.timestamp)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 ml-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Chat Preview */}
          <div className="flex-1 flex flex-col">
            {selectedSession ? (
              <>
                {/* Preview Header */}
                <div className="p-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedSession.title}</h3>
                      <p className="text-sm text-white/60">
                        {selectedSession.messageCount} messages • {formatRelativeTime(selectedSession.timestamp)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleLoadSession(selectedSession)}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                    >
                      Load Chat
                    </Button>
                  </div>
                </div>

                {/* Messages Preview */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedSession.messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-600/20 text-white border border-blue-500/30"
                              : "bg-white/10 text-white border border-white/20"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.content.length > 200 ? `${message.content.substring(0, 200)}...` : message.content}
                          </p>
                          <p className="text-xs text-white/60 mt-2">
                            {formatRelativeTime(
                              message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp),
                            )}
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
