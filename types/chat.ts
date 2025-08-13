export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  isVoice?: boolean
  isError?: boolean
  hasImage?: boolean
  citations?: Array<{
    url: string
    title?: string
    snippet?: string
  }>
  related_questions?: string[]
}
