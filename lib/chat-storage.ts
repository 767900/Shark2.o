import type { Message } from "@/types/chat"

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

export class ChatStorage {
  private static readonly STORAGE_KEY = "shark2_chat_sessions"
  private static readonly MAX_SESSIONS = 50

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static saveSession(messages: Message[]): void {
    if (!messages || messages.length === 0) return

    try {
      const sessions = this.getAllSessions()
      const sessionId = this.generateSessionId()

      // Generate title from first user message
      const firstUserMessage = messages.find((msg) => msg.role === "user")
      const title =
        firstUserMessage?.content.slice(0, 50) + (firstUserMessage?.content.length > 50 ? "..." : "") ||
        "New Conversation"

      const newSession: ChatSession = {
        id: sessionId,
        title,
        messages,
        timestamp: new Date(),
      }

      // Add new session at the beginning
      sessions.unshift(newSession)

      // Keep only the most recent sessions
      const limitedSessions = sessions.slice(0, this.MAX_SESSIONS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedSessions))
      console.log("💾 Chat session saved:", sessionId)
    } catch (error) {
      console.error("❌ Failed to save chat session:", error)
    }
  }

  static getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const sessions = JSON.parse(stored)

      // Convert timestamp strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
    } catch (error) {
      console.error("❌ Failed to load chat sessions:", error)
      return []
    }
  }

  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions()
      const filteredSessions = sessions.filter((session) => session.id !== sessionId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions))
      console.log("🗑️ Chat session deleted:", sessionId)
    } catch (error) {
      console.error("❌ Failed to delete chat session:", error)
    }
  }

  static clearAllSessions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log("🧹 All chat sessions cleared")
    } catch (error) {
      console.error("❌ Failed to clear chat sessions:", error)
    }
  }

  static getSessionById(sessionId: string): ChatSession | null {
    try {
      const sessions = this.getAllSessions()
      return sessions.find((session) => session.id === sessionId) || null
    } catch (error) {
      console.error("❌ Failed to get chat session:", error)
      return null
    }
  }
}
