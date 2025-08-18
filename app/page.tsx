"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, Clock } from "lucide-react"
import ChatWindow from "@/components/chat-window"
import InputBar from "@/components/input-bar"
import SharkLogo from "@/components/shark-logo"
import SharkLoading from "@/components/shark-loading"
import VoiceOnlyMode from "@/components/voice-only-mode"
import DiscoverPage from "@/components/discover-page"
import ImaginePage from "@/components/imagine-page"
import ChatHistory from "@/components/chat-history"
import { saveSession } from "@/lib/chat-storage"
import type { Message } from "@/types/chat"

const getRandomWelcomeMessage = () => {
  const welcomeMessages = [
    "Hello! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟. What would you like to explore today?",
    "𝕏𝕪𝕝𝕠𝔾𝕖𝕟 is always ready for you, would you like to dive into it?",
    "Hi there! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 here, your intelligent companion. How can I assist you?",
    "Namaste! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, ready to unlock knowledge with you. What's on your mind?",
    "Welcome to 𝕏𝕪𝕝𝕠𝔾𝕖𝕟! Let's embark on a journey of discovery together.",
    "Greetings! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 at your service. What fascinating topic shall we explore?",
    "Hey! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 here, powered by curiosity and ready for any challenge!",
    "Hello friend! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, your AI guide. Where shall our conversation take us?",
    "𝕏𝕪𝕝𝕠𝔾𝕖𝕟 reporting for duty! What mysteries would you like to unravel today?",
    "Hi! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, your digital companion from India. How may I enlighten you?",
    "Welcome aboard! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 is here to make your day more interesting. What's up?",
    "Salutations! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, ready to dive deep into any topic you choose.",
    "Hello there! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 at your fingertips, eager to help and learn with you.",
    "𝕏𝕪𝕝𝕠𝔾𝕖𝕟 here! Think of me as your personal knowledge navigator. Where to?",
    "Greetings, explorer! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, ready to venture into the unknown with you.",
    "Hi! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 speaking - your AI friend who's always excited to chat and help!",
    "Welcome! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, designed to make every conversation meaningful. Let's begin!",
    "Hello! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 here, your intelligent assistant ready for any adventure in knowledge.",
    "𝕏𝕪𝕝𝕠𝔾𝕖𝕟 at your service! Ready to transform curiosity into understanding. What's your question?",
    "Hey there! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, your AI companion who loves exploring ideas with you.",
    "Namaste! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 here, blending technology with wisdom. How can I serve you today?",
    "Hello! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, your digital guide through the vast landscape of knowledge.",
    "𝕏𝕪𝕝𝕠𝔾𝕖𝕟 online and ready! Let's turn your questions into fascinating discoveries.",
    "Greetings! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, your AI partner in learning and exploration. What intrigues you?",
    "Hi! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 here - think of me as your personal research assistant and friend combined!",
  ]
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
}

export default function AIWebChat() {
  // Always start with a fresh welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-" + Date.now(),
      content: getRandomWelcomeMessage(),
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastAiMessage, setLastAiMessage] = useState<string>("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentProvider, setCurrentProvider] = useState<string>("𝕏𝕪𝕝𝕠𝔾𝕖𝕟 Ready 🧠")
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isDiscoverMode, setIsDiscoverMode] = useState(false)
  const [isImagineMode, setIsImagineMode] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Always start fresh - no loading of previous chat history
  useEffect(() => {
    console.log("🚀 Starting fresh 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 session")
    // We intentionally don't load chat history here to always start fresh
  }, [])

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
      content: message || (image ? "Please analyze this image" : ""),
      role: "user",
      timestamp: new Date(),
      isVoice,
      hasImage: !!image,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    // Clear any previous speech when sending new message
    setLastAiMessage("")
    setIsSpeaking(false)

    try {
      console.log("🚀 CLIENT: Sending message to 𝕏𝕪𝕝𝕠𝔾𝕖𝕟:", message)
      if (image) {
        console.log("📸 CLIENT: Including image:", image.name, image.type, Math.round(image.size / 1024) + "KB")
      }

      let response

      if (image) {
        console.log("📸 CLIENT: Processing image with vision")
        const formData = new FormData()
        formData.append("image", image)
        formData.append("message", message || "What do you see in this image?")

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

      const updatedMessages = [...messages, userMessage, aiMessage]
      setMessages(updatedMessages)

      // Save to chat history after successful conversation
      try {
        saveSession(updatedMessages)
        console.log("💾 Chat session saved successfully")
      } catch (saveError) {
        console.error("❌ Failed to save chat session:", saveError)
      }
    } catch (error) {
      console.error("💥 CLIENT: Error in handleSendMessage:", error)

      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `🔮 **𝕏𝕪𝕝𝕠𝔾𝕖𝕟 - Smart Response** 🔮\n\n**Your question:** "${message}"\n\nI'm working in smart mode and ready to help! While I may not have real-time data, I can still provide intelligent answers on many topics.\n\n**I can help with:**\n• Programming and technology\n• Indian culture and knowledge\n• Educational topics\n• Problem-solving and analysis\n• General knowledge\n• Image analysis (with SERP API integration)\n\n🚀 **Try asking me about specific topics I can explain!** 🇮🇳`,
        role: "assistant",
        timestamp: new Date(),
        isError: false,
      }

      const updatedMessages = [...messages, userMessage, errorMessage]
      setMessages(updatedMessages)

      // Save even error conversations to history
      try {
        saveSession(updatedMessages)
      } catch (saveError) {
        console.error("❌ Failed to save error conversation:", saveError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRelatedQuestionClick = (question: string) => {
    handleSendMessage(question)
  }

  const clearChat = () => {
    // Stop any speech synthesis if running
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setLastAiMessage("")
    setCurrentProvider("𝕏𝕪𝕝𝕠𝔾𝕖𝕟 Ready 🧠")

    setMessages([
      {
        id: "welcome-" + Date.now(),
        content: getRandomWelcomeMessage(),
        role: "assistant",
        timestamp: new Date(),
      },
    ])
  }

  const handleLoadHistorySession = (sessionMessages: Message[]) => {
    setMessages(sessionMessages)
    setIsHistoryOpen(false)
    console.log("📚 Loaded chat session with", sessionMessages.length, "messages")
  }

  const handleDiscoverClick = () => {
    console.log("🟣 Discover button clicked - switching to discover mode")
    setIsDiscoverMode(true)
  }

  const handleVoiceModeClick = () => {
    console.log("🟠 Voice button clicked - switching to voice mode")
    setIsVoiceMode(true)
  }

  const handleImageGenerationClick = () => {
    console.log("🟣 Imagine button clicked - switching to imagine mode")
    setIsImagineMode(true)
  }

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

      <div
        className={`container mx-auto ${isMobile ? "max-w-full px-0" : "max-w-4xl"} h-screen flex flex-col relative z-10`}
      >
        <motion.header
          className={`flex items-center justify-between ${isMobile ? "p-1.5" : "p-2"} border-b border-white/20 backdrop-blur-md bg-white/10 relative`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <SharkLogo size={isMobile ? "sm" : "md"} animated={true} glowing={isSpeaking} />
            <div>
              <h1 className={`${isMobile ? "text-base" : "text-xl"} font-bold text-white flex items-center gap-2`}>
                <motion.span
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-extrabold tracking-wider"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                    textShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
                    filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))",
                  }}
                >
                  𝕏𝕪𝕝𝕠𝔾𝕖𝕟
                </motion.span>
                🇮🇳
                <motion.span
                  className={`${isMobile ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1"} rounded-full font-mono bg-gradient-to-r from-purple-500 to-cyan-500 text-white`}
                  animate={{
                    boxShadow: ["0 0 5px #a855f7", "0 0 15px #06b6d4", "0 0 5px #a855f7"],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  SMART AI 🧠
                </motion.span>
              </h1>
              {!isMobile && (
                <p className="text-xs text-white/80 font-mono">
                  ✨ "Everything you can imagine is real."
                  {isLoading && " • 🔄 Processing..."}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Controls - Clean Icons Only */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsHistoryOpen(true)}
                className="text-white hover:text-cyan-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Chat History"
              >
                <Clock className="w-6 h-6" />
              </motion.button>

              <motion.button
                onClick={clearChat}
                className="text-red-400 hover:text-red-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Clear Chat"
              >
                <Trash2 className="w-6 h-6" />
              </motion.button>
            </div>
          )}

          {/* Mobile Controls - Clean Icons Only */}
          {isMobile && (
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setIsHistoryOpen(true)}
                className="text-white hover:text-cyan-300 transition-colors"
                whileTap={{ scale: 0.95 }}
                title="History"
              >
                <Clock className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={clearChat}
                className="text-red-400 hover:text-red-300 transition-colors"
                whileTap={{ scale: 0.95 }}
                title="Clear Chat"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </motion.header>

        {/* Mobile Status Bar - More Compact */}
        {isMobile && (
          <div className="px-2 py-0.5 bg-black/20 border-b border-white/10">
            <p className="text-xs text-white/80 font-mono text-center">
              ✨ "Everything you can imagine is real."
              {isLoading && " • 🔄 Processing..."}
            </p>
          </div>
        )}

        {isImagineMode ? (
          <div className="flex-1 min-h-0">
            <ImaginePage onBack={() => setIsImagineMode(false)} />
          </div>
        ) : isDiscoverMode ? (
          <div className="flex-1 min-h-0">
            <DiscoverPage onBack={() => setIsDiscoverMode(false)} />
          </div>
        ) : isVoiceMode ? (
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
              voiceEnabled={false}
              onDiscoverClick={handleDiscoverClick}
              onVoiceModeClick={handleVoiceModeClick}
              onImageGenerationClick={handleImageGenerationClick}
            />
          </>
        )}
      </div>

      {/* Chat History Modal */}
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadSession={handleLoadHistorySession}
      />
    </div>
  )
}
