import type { ChatSession, Message } from "@/types/chat"

export class ChatStorage {
  private static readonly STORAGE_KEY = "shark-chat-sessions"
  private static readonly MAX_SESSIONS = 50

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static saveSession(messages: Message[]): void {
    if (typeof window === "undefined" || messages.length < 2) return

    try {
      const sessions = this.getAllSessions()
      const sessionId = Date.now().toString()

      // Generate title from first user message
      const firstUserMessage = messages.find((msg) => msg.role === "user")
      const title = firstUserMessage
        ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
        : "New Chat"

      const newSession: ChatSession = {
        id: sessionId,
        title,
        timestamp: new Date(),
        messages: messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
        })),
        messageCount: messages.length,
      }

      // Add new session at the beginning
      sessions.unshift(newSession)

      // Keep only the most recent sessions
      const trimmedSessions = sessions.slice(0, this.MAX_SESSIONS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedSessions))
    } catch (error) {
      console.error("Failed to save chat session:", error)
    }
  }

  static getAllSessions(): ChatSession[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const sessions = JSON.parse(stored) as ChatSession[]

      // Ensure timestamps are Date objects
      return sessions.map((session) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
        })),
      }))
    } catch (error) {
      console.error("Failed to load chat sessions:", error)
      return []
    }
  }

  static getSession(sessionId: string): ChatSession | null {
    try {
      const sessions = this.getAllSessions()
      return sessions.find((session) => session.id === sessionId) || null
    } catch (error) {
      console.error("Error getting chat session:", error)
      return null
    }
  }

  static deleteSession(sessionId: string): void {
    if (typeof window === "undefined") return

    try {
      const sessions = this.getAllSessions()
      const filteredSessions = sessions.filter((session) => session.id !== sessionId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions))
    } catch (error) {
      console.error("Failed to delete chat session:", error)
    }
  }

  static clearAllSessions(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear chat sessions:", error)
    }
  }
}
