"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import ChatWindow from "@/components/chat-window"
import InputBar from "@/components/input-bar"
import VoiceSynthesizer from "@/components/voice-synthesizer"
import VoiceChat from "@/components/voice-chat"
import type { Message } from "@/types/chat"

export default function AIWebChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Shark2.0, your AI assistant. I can chat, analyze images, and have voice conversations! 🦈",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<string>("Initializing...")
  const [lastAiMessage, setLastAiMessage] = useState<string>("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showVoiceChat, setShowVoiceChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string, isVoice = false, image?: File) => {
    if ((!message.trim() && !image) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date(),
      isVoice,
      hasImage: !!image,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    try {
      let response

      if (image) {
        // Handle image analysis
        const formData = new FormData()
        formData.append("image", image)
        formData.append("message", message)

        response = await fetch("/api/vision", {
          method: "POST",
          body: formData,
        })
      } else {
        // Handle regular chat
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setCurrentProvider(data.provider || "Unknown")

      // Trigger voice synthesis if enabled
      if (voiceEnabled) {
        setLastAiMessage(data.content)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered some rough waters. Please try again! 🦈",
        role: "assistant",
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceMessage = async (transcript: string) => {
    await handleSendMessage(transcript, true)
  }

  const clearChat = () => {
    // Stop speech
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setLastAiMessage("")

    setMessages([
      {
        id: "1",
        content: "Hello! I'm Shark2.0, your AI assistant. I can chat, analyze images, and have voice conversations! 🦈",
        role: "assistant",
        timestamp: new Date(),
      },
    ])
  }

  const toggleVoice = () => {
    const newVoiceState = !voiceEnabled
    setVoiceEnabled(newVoiceState)

    // Stop speech if disabling
    if (!newVoiceState && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }

    // If enabling and there's a recent message, speak it
    if (newVoiceState && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        setLastAiMessage(lastMessage.content)
      }
    }
  }

  const getStatusColor = () => {
    if (currentProvider.includes("xAI") || currentProvider.includes("Grok")) return "text-purple-400"
    if (currentProvider.includes("OpenAI")) return "text-green-400"
    if (currentProvider.includes("Groq")) return "text-blue-400"
    if (currentProvider.includes("Demo")) return "text-cyan-400"
    return "text-yellow-400"
  }

  const getStatusIcon = () => {
    if (currentProvider.includes("xAI") || currentProvider.includes("Grok")) return "🟣"
    if (currentProvider.includes("OpenAI")) return "🟢"
    if (currentProvider.includes("Groq")) return "🔵"
    if (currentProvider.includes("Demo")) return "🦈"
    return "🟡"
  }

  // Check if speech synthesis is available
  const isSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-4xl h-[100vh] flex flex-col">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🦈</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Shark2.0</h1>
              <p className={`text-sm ${getStatusColor()}`}>
                {getStatusIcon()} {currentProvider}
                {isSpeaking && " • 🔊 Speaking"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceChat(!showVoiceChat)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                showVoiceChat ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title="Toggle voice chat mode"
            >
              🎙️
            </button>
            {isSpeechSupported && (
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  voiceEnabled
                    ? isSpeaking
                      ? "bg-green-600 text-white animate-pulse"
                      : "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
                title={voiceEnabled ? "Voice enabled - click to disable" : "Voice disabled - click to enable"}
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </button>
            )}
            <button
              onClick={clearChat}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              title="Clear chat"
            >
              🗑️
            </button>
          </div>
        </motion.header>

        {/* Voice Chat Mode */}
        {showVoiceChat ? (
          <div className="flex-1 flex items-center justify-center">
            <VoiceChat onVoiceMessage={handleVoiceMessage} isLoading={isLoading} />
          </div>
        ) : (
          <>
            {/* Chat Window */}
            <div className="flex-1 overflow-y-auto">
              <ChatWindow messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <InputBar
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              voiceEnabled={voiceEnabled}
            />
          </>
        )}

        {/* Voice Synthesizer */}
        {isSpeechSupported && (
          <VoiceSynthesizer
            text={lastAiMessage}
            isEnabled={voiceEnabled}
            onStart={() => setIsSpeaking(true)}
            onEnd={() => {
              setIsSpeaking(false)
              setLastAiMessage("")
            }}
          />
        )}
      </div>
    </div>
  )
}
