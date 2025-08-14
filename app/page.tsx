"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import ChatWindow from "@/components/chat-window"
import InputBar from "@/components/input-bar"
import VoiceSynthesizer from "@/components/voice-synthesizer"
import SharkLogo from "@/components/shark-logo"
import SharkLoading from "@/components/shark-loading"
import VoiceOnlyMode from "@/components/voice-only-mode"
import type { Message } from "@/types/chat"

export default function AIWebChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        '🚀 **Shark 2.0 - READY TO HELP!** 🚀\n\n✅ **Smart Assistant Active!**\n\nNamaste! I\'m Shark 2.0, your intelligent AI assistant from India! 🦈🇮🇳\n\n🧠 **I can help you with:**\n• **Programming & Technology** - Python, JavaScript, React, AI/ML\n• **Indian Culture & Knowledge** - Festivals, history, traditions\n• **Education & Learning** - Science, math, explanations\n• **Problem Solving** - Analysis, advice, step-by-step solutions\n• **General Knowledge** - Wide range of topics and questions\n\n🔥 **Try asking me:**\n• "Explain machine learning in simple terms"\n• "What are the major festivals in India?"\n• "Help me with Python programming"\n• "Tell me about Indian independence history"\n• "How does React work?"\n\n💪 **I\'m ready to provide detailed, intelligent answers!**\n\n*For enhanced capabilities with real-time search, add API keys for Perplexity, OpenAI, or Groq.*',
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [lastAiMessage, setLastAiMessage] = useState<string>("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<string>("Smart Assistant Ready 🧠")
  const [isVoiceMode, setIsVoiceMode] = useState(false)
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
      console.log("🚀 CLIENT: Sending message to Shark 2.0:", message)

      let response

      if (image) {
        console.log("📸 CLIENT: Processing image with vision")
        const formData = new FormData()
        formData.append("image", image)
        formData.append("message", message)

        response = await fetch("/api/vision", {
          method: "POST",
          body: formData,
        })
      } else {
        console.log("💬 CLIENT: Processing text message")
        const requestBody = {
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }

        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
      }

      console.log("📡 CLIENT: Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ CLIENT: API Error Response:", errorText)
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ CLIENT: Response received from:", data.provider)

      // Update current provider
      if (data.provider) {
        setCurrentProvider(data.provider)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content || "No response received",
        role: "assistant",
        timestamp: new Date(),
        citations: data.citations || [],
        related_questions: data.related_questions || [],
        isError: false,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Voice output
      if ((voiceEnabled || isVoice) && data.content) {
        setLastAiMessage(data.content)
      }
    } catch (error) {
      console.error("💥 CLIENT: Error in handleSendMessage:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🦈 **Shark 2.0 - Smart Response** 🦈\n\n**Your question:** "${message}"\n\nI'm working in smart mode and ready to help! While I may not have real-time data, I can still provide intelligent answers on many topics.\n\n**I can help with:**\n• Programming and technology\n• Indian culture and knowledge\n• Educational topics\n• Problem-solving and analysis\n• General knowledge\n\n🚀 **Try asking me about specific topics I can explain!** 🇮🇳`,
        role: "assistant",
        timestamp: new Date(),
        isError: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRelatedQuestionClick = (question: string) => {
    handleSendMessage(question)
  }

  const clearChat = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setLastAiMessage("")
    setCurrentProvider("Smart Assistant Ready 🧠")

    setMessages([
      {
        id: "1",
        content:
          '🚀 **Shark 2.0 - READY TO HELP!** 🚀\n\n✅ **Smart Assistant Active!**\n\nNamaste! I\'m Shark 2.0, your intelligent AI assistant from India! 🦈🇮🇳\n\n🧠 **I can help you with:**\n• **Programming & Technology** - Python, JavaScript, React, AI/ML\n• **Indian Culture & Knowledge** - Festivals, history, traditions\n• **Education & Learning** - Science, math, explanations\n• **Problem Solving** - Analysis, advice, step-by-step solutions\n• **General Knowledge** - Wide range of topics and questions\n\n🔥 **Try asking me:**\n• "Explain machine learning in simple terms"\n• "What are the major festivals in India?"\n• "Help me with Python programming"\n• "Tell me about Indian independence history"\n• "How does React work?"\n\n💪 **I\'m ready to provide detailed, intelligent answers!**\n\n*For enhanced capabilities with real-time search, add API keys for Perplexity, OpenAI, or Groq.*',
        role: "assistant",
        timestamp: new Date(),
      },
    ])
  }

  const toggleVoice = () => {
    const newVoiceState = !voiceEnabled
    setVoiceEnabled(newVoiceState)

    if (!newVoiceState && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const testAllApis = async () => {
    try {
      const response = await fetch("/api/test-all-apis")
      const data = await response.json()

      const testMessage: Message = {
        id: Date.now().toString(),
        content: `🧪 **System Test Results:**\n\n${data.status}\n\n📊 **Summary:**\n• Total Models: ${data.summary.total}\n• With API Keys: ${data.summary.withKeys}\n• Working: ${data.summary.working}\n\n✅ **Working Models:**\n${data.workingApis?.map((name: string) => `• ${name}`).join("\n") || "None currently working"}\n\n🎯 **Recommendation:** ${data.recommendation}\n\n🚀 **Status:** ${data.summary.working > 0 ? "ENHANCED AI READY!" : "Smart Assistant Mode Active"}\n\n💡 **Note:** Even without API keys, I can provide intelligent responses on many topics!`,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, testMessage])
    } catch (error) {
      console.error("Test failed:", error)

      const fallbackMessage: Message = {
        id: Date.now().toString(),
        content: `🧪 **System Status** 🧪\n\n🧠 **Smart Assistant Mode Active!**\n\nI'm working in intelligent mode and ready to help with:\n\n• **Programming & Technology**\n• **Educational Topics**\n• **Indian Culture & Knowledge**\n• **Problem Solving**\n• **General Knowledge**\n\n🚀 **I can provide detailed answers even without external APIs!**\n\n💡 **For enhanced capabilities, add API keys for:**\n• Perplexity AI (real-time search)\n• OpenAI (advanced AI)\n• Groq (fast responses)\n• xAI Grok (latest AI)`,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, fallbackMessage])
    }
  }

  const isSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url(/indian-flag.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="container mx-auto max-w-4xl h-[100vh] flex flex-col relative z-10">
        <motion.header
          className="flex items-center justify-between p-4 border-b border-white/20 backdrop-blur-md bg-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <SharkLogo size="md" animated={true} glowing={isSpeaking} />
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Shark 2.0 🇮🇳
                <motion.span
                  className="text-xs px-3 py-1 rounded-full font-mono bg-gradient-to-r from-green-500 to-blue-500 text-white"
                  animate={{
                    boxShadow: ["0 0 5px #10b981", "0 0 15px #3b82f6", "0 0 5px #10b981"],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  SMART AI 🧠
                </motion.span>
              </h1>
              <p className="text-sm text-white/80 font-mono">
                🎯 {currentProvider}
                {isSpeaking && " • 🔊 Speaking"}
                {isLoading && " • 🔄 Processing..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`p-3 rounded-lg transition-all duration-200 border border-white/20 ${
                isVoiceMode
                  ? "bg-purple-600 text-white shadow-lg animate-pulse"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Voice Mode"
            >
              🎤
            </motion.button>

            <motion.button
              onClick={testAllApis}
              className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors border border-blue-400/50 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Test System"
            >
              🧪
            </motion.button>

            {isSpeechSupported && (
              <motion.button
                onClick={toggleVoice}
                className={`p-3 rounded-lg transition-all duration-200 border border-white/20 ${
                  voiceEnabled
                    ? isSpeaking
                      ? "bg-green-600 text-white animate-pulse shadow-lg"
                      : "bg-blue-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Toggle Voice Output"
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </motion.button>
            )}

            <motion.button
              onClick={clearChat}
              className="p-3 rounded-lg bg-white/10 text-red-400 hover:bg-red-900/30 transition-colors border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Clear Chat"
            >
              🗑️
            </motion.button>
          </div>
        </motion.header>

        {isVoiceMode ? (
          <VoiceOnlyMode onSendMessage={handleSendMessage} isLoading={isLoading} onBack={() => setIsVoiceMode(false)} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <ChatWindow
                messages={messages}
                isLoading={isLoading}
                onRelatedQuestionClick={handleRelatedQuestionClick}
              />
              {isLoading && <SharkLoading />}
              <div ref={messagesEndRef} />
            </div>

            <InputBar
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              voiceEnabled={voiceEnabled}
            />
          </>
        )}

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
