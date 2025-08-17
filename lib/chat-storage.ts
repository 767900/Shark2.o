import type { Message } from "@/types/chat"

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  messages: Message[]
  messageCount: number
}

const STORAGE_KEY = "shark-chat-history"
const MAX_SESSIONS = 100

export class ChatStorage {
  static saveSession(messages: Message[]): void {
    try {
      if (messages.length < 2) return // Don't save sessions with less than 2 messages

      const sessions = this.getAllSessions()
      const sessionId = Date.now().toString()

      // Generate title from first user message
      const firstUserMessage = messages.find((msg) => msg.role === "user")
      const title = firstUserMessage
        ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
        : "New Conversation"

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

      // Add new session to the beginning
      sessions.unshift(newSession)

      // Keep only the latest MAX_SESSIONS
      const limitedSessions = sessions.slice(0, MAX_SESSIONS)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSessions))
    } catch (error) {
      console.error("Error saving chat session:", error)
    }
  }

  static getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const sessions = JSON.parse(stored)
      return sessions.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
        })),
      }))
    } catch (error) {
      console.error("Error loading chat sessions:", error)
      return []
    }
  }

  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions()
      const filteredSessions = sessions.filter((session) => session.id !== sessionId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions))
    } catch (error) {
      console.error("Error deleting chat session:", error)
    }
  }

  static clearAllSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing chat sessions:", error)
    }
  }

  static getSessionCount(): number {
    return this.getAllSessions().length
  }
}
