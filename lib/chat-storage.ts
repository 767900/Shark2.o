import type { Message } from "@/types/chat"

export interface ChatSession {
  id: string
  timestamp: Date
  messages: Message[]
}

const STORAGE_KEY = "xylogen_chat_sessions"
const MAX_SESSIONS = 50 // Limit stored sessions

export function saveSession(messages: Message[]): void {
  try {
    if (!messages || messages.length === 0) {
      console.log("📚 No messages to save")
      return
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session: ChatSession = {
      id: sessionId,
      timestamp: new Date(),
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
      })),
    }

    // Load existing sessions
    const existingSessions = loadAllSessions()

    // Add new session at the beginning
    const updatedSessions = [session, ...existingSessions]

    // Keep only the most recent sessions
    const limitedSessions = updatedSessions.slice(0, MAX_SESSIONS)

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSessions))

    console.log(`📚 Saved session ${sessionId} with ${messages.length} messages`)
  } catch (error) {
    console.error("❌ Error saving session:", error)
  }
}

export function loadAllSessions(): ChatSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      console.log("📚 No stored sessions found")
      return []
    }

    const sessions = JSON.parse(stored) as ChatSession[]

    // Convert timestamp strings back to Date objects
    const processedSessions = sessions.map((session) => ({
      ...session,
      timestamp: new Date(session.timestamp),
      messages: session.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }))

    console.log(`📚 Loaded ${processedSessions.length} sessions`)
    return processedSessions
  } catch (error) {
    console.error("❌ Error loading sessions:", error)
    return []
  }
}

export function deleteSession(sessionId: string): void {
  try {
    const sessions = loadAllSessions()
    const filteredSessions = sessions.filter((session) => session.id !== sessionId)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions))
    console.log(`🗑️ Deleted session ${sessionId}`)
  } catch (error) {
    console.error("❌ Error deleting session:", error)
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log("🗑️ Cleared all chat sessions")
  } catch (error) {
    console.error("❌ Error clearing sessions:", error)
  }
}

export function getSessionById(sessionId: string): ChatSession | null {
  try {
    const sessions = loadAllSessions()
    const session = sessions.find((s) => s.id === sessionId)

    if (session) {
      console.log(`📖 Found session ${sessionId}`)
      return session
    } else {
      console.log(`❌ Session ${sessionId} not found`)
      return null
    }
  } catch (error) {
    console.error("❌ Error getting session:", error)
    return null
  }
}
