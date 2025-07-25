export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isVoice?: boolean
  isError?: boolean
  hasImage?: boolean
}
