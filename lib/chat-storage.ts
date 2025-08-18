export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
  lastActivity: Date
}

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isVoice?: boolean
  hasImage?: boolean
  citations?: Array<{ title: string; url: string }>
  related_questions?: string[]
  isError?: boolean
}

export class ChatStorage {
  private static readonly STORAGE_KEY = "shark-chat-sessions"
  private static readonly CURRENT_SESSION_KEY = "shark-current-session"
  private static readonly MAX_SESSIONS = 50

  static saveSession(messages: Message[]): string {
    try {
      if (!messages || messages.length === 0) return ""

      const sessions = this.getAllSessions()
      const sessionId = Date.now().toString()

      // Create session title from first user message
      const firstUserMessage = messages.find((m) => m.role === "user")
      const title = firstUserMessage
        ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
        : "New Chat"

      const session: ChatSession = {
        id: sessionId,
        title,
        messages,
        timestamp: new Date(),
        lastActivity: new Date(),
      }

      sessions.unshift(session)

      // Keep only the most recent sessions
      if (sessions.length > this.MAX_SESSIONS) {
        sessions.splice(this.MAX_SESSIONS)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions))
      localStorage.setItem(this.CURRENT_SESSION_KEY, sessionId)

      console.log("💾 Chat session saved:", sessionId, "with", messages.length, "messages")
      return sessionId
    } catch (error) {
      console.error("❌ Failed to save chat session:", error)
      return ""
    }
  }

  static getAllSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const sessions = JSON.parse(stored) as ChatSession[]
      return sessions.map((session) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        lastActivity: new Date(session.lastActivity),
        messages: session.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))
    } catch (error) {
      console.error("❌ Failed to load chat sessions:", error)
      return []
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

  static deleteSession(sessionId: string): boolean {
    try {
      const sessions = this.getAllSessions()
      const filteredSessions = sessions.filter((session) => session.id !== sessionId)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions))

      // Clear current session if it was deleted
      const currentSessionId = localStorage.getItem(this.CURRENT_SESSION_KEY)
      if (currentSessionId === sessionId) {
        localStorage.removeItem(this.CURRENT_SESSION_KEY)
      }

      console.log("🗑️ Chat session deleted:", sessionId)
      return true
    } catch (error) {
      console.error("❌ Failed to delete chat session:", error)
      return false
    }
  }

  static clearAllSessions(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.CURRENT_SESSION_KEY)
      console.log("🧹 All chat sessions cleared")
      return true
    } catch (error) {
      console.error("❌ Failed to clear all sessions:", error)
      return false
    }
  }

  static getCurrentSessionId(): string | null {
    try {
      return localStorage.getItem(this.CURRENT_SESSION_KEY)
    } catch (error) {
      console.error("❌ Failed to get current session ID:", error)
      return null
    }
  }

  static loadCurrentSession(): Message[] {
    try {
      const currentSessionId = this.getCurrentSessionId()
      if (!currentSessionId) return []

      const session = this.getSessionById(currentSessionId)
      return session ? session.messages : []
    } catch (error) {
      console.error("❌ Failed to load current session:", error)
      return []
    }
  }
}

// Individual function exports for easier importing
export const saveSession = (messages: Message[]): string => {
  return ChatStorage.saveSession(messages)
}

export const getAllSessions = (): ChatSession[] => {
  return ChatStorage.getAllSessions()
}

export const getSessionById = (sessionId: string): ChatSession | null => {
  return ChatStorage.getSessionById(sessionId)
}

export const deleteSession = (sessionId: string): boolean => {
  return ChatStorage.deleteSession(sessionId)
}

export const clearAllSessions = (): boolean => {
  return ChatStorage.clearAllSessions()
}

export const getCurrentSessionId = (): string | null => {
  return ChatStorage.getCurrentSessionId()
}

export const loadCurrentSession = (): Message[] => {
  return ChatStorage.loadCurrentSession()
}

export const loadChatHistory = (): Message[] => {
  return ChatStorage.loadCurrentSession()
}

export const loadSessionMessages = (sessionId: string): Message[] => {
  const session = ChatStorage.getSessionById(sessionId)
  return session ? session.messages : []
}
