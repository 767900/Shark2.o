"use client"

import { useEffect, useRef } from "react"
import MessageBubble from "@/components/message-bubble"
import TypingIndicator from "@/components/typing-indicator"
import type { Message } from "@/types/chat"

interface ChatWindowProps {
  messages: Message[]
  isLoading: boolean
  onRelatedQuestionClick?: (question: string) => void
}

export default function ChatWindow({ messages, isLoading, onRelatedQuestionClick }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onRelatedQuestionClick={onRelatedQuestionClick} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
