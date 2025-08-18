import type { Message } from "@/types/chat"

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  isVoice?: boolean
  imageUrl?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
}

export class ChatStorage {
  private static readonly STORAGE_KEY = "shark-chat-sessions"
  private static readonly MAX_SESSIONS = 50

  static saveSession(messages: Message[]): void {
    try {
      if (messages.length === 0) return

      const sessions = this.getAllSessions()
      const sessionId = Date.now().toString()
      const title = this.generateSessionTitle(messages)

      const newSession: ChatSession = {
        id: sessionId,
        title,
        messages,
        timestamp: new Date(),
      }

      // Add new session at the beginning
      sessions.unshift(newSession)

      // Keep only the most recent sessions
      const trimmedSessions = sessions.slice(0, this.MAX_SESSIONS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedSessions))
      console.log("💾 Chat session saved:", title)
    } catch (error) {
      console.error("❌ Failed to save chat session:", error)
    }
  }

  static getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const sessions = JSON.parse(stored)
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
      console.error("❌ Failed to get session by ID:", error)
      return null
    }
  }

  private static generateSessionTitle(messages: Message[]): string {
    const userMessages = messages.filter((msg) => msg.role === "user")
    if (userMessages.length === 0) return "New Chat"

    const firstUserMessage = userMessages[0].content
    const words = firstUserMessage.split(" ").slice(0, 6)
    return words.join(" ") + (firstUserMessage.split(" ").length > 6 ? "..." : "")
  }
}

// Individual function exports for easier importing
export const saveSession = (messages: Message[]) => ChatStorage.saveSession(messages)
export const getAllSessions = () => ChatStorage.getAllSessions()
export const deleteSession = (sessionId: string) => ChatStorage.deleteSession(sessionId)
export const clearAllSessions = () => ChatStorage.clearAllSessions()
export const getSessionById = (sessionId: string) => ChatStorage.getSessionById(sessionId)

export const loadChatHistory = (): Message[] => {
  try {
    const sessions = getAllSessions()
    if (sessions.length > 0) {
      // Return the most recent session's messages
      return sessions[0].messages
    }
    return []
  } catch (error) {
    console.error("❌ Failed to load chat history:", error)
    return []
  }
}

export const loadSessionMessages = (sessionId: string): Message[] => {
  try {
    const session = getSessionById(sessionId)
    return session ? session.messages : []
  } catch (error) {
    console.error("❌ Failed to load session messages:", error)
    return []
  }
}
