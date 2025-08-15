"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import ChatWindow from "@/components/chat-window"
import InputBar from "@/components/input-bar"
import VoiceSynthesizer from "@/components/voice-synthesizer"
import SharkLogo from "@/components/shark-logo"
import SharkLoading from "@/components/shark-loading"
import VoiceOnlyMode from "@/components/voice-only-mode"
import DiscoverPage from "@/components/discover-page"
import ImaginePage from "@/components/imagine-page"
import type { Message } from "@/types/chat"

const getRandomWelcomeMessage = () => {
  const welcomeMessages = [
    "Hello! I'm Shark 2.0. How can I help you today?",
    "Hi there! I'm ready to assist you. What would you like to know?",
    "Namaste! I'm Shark 2.0, your AI assistant. What can I do for you?",
    "Welcome! I'm here to help with any questions you have.",
    "Hey! I'm Shark 2.0. Ready to help you with anything!",
    "Hi! I'm your AI assistant. What would you like to explore today?",
    "Hello! I'm Shark 2.0 from India. How may I assist you?",
    "Greetings! I'm ready to help. What's on your mind?",
  ]
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
}

export default function AIWebChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: getRandomWelcomeMessage(),
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
  const [isDiscoverMode, setIsDiscoverMode] = useState(false)
  const [isImagineMode, setIsImagineMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
        id: Date.now().toString(),
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
        content: getRandomWelcomeMessage(),
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

  const isSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window

  // Mobile Menu Component
  const MobileMenu = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/20 z-50"
    >
      <div className="p-4 space-y-3">
        <motion.button
          onClick={() => {
            setIsImagineMode(!isImagineMode)
            setShowMobileMenu(false)
          }}
          className={`w-full p-4 rounded-xl transition-all duration-200 border ${
            isImagineMode
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400"
              : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border-purple-400/50 hover:from-purple-600/30 hover:to-pink-600/30"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div className="text-left">
              <div className="font-semibold">AI Image Generation</div>
              <div className="text-sm opacity-80">Create amazing artwork with AI</div>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => {
            setIsVoiceMode(!isVoiceMode)
            setShowMobileMenu(false)
          }}
          className={`w-full p-4 rounded-xl transition-all duration-200 border ${
            isVoiceMode
              ? "bg-purple-600 text-white border-purple-400"
              : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border-purple-400/50 hover:from-purple-600/30 hover:to-pink-600/30"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎤</span>
            <div className="text-left">
              <div className="font-semibold">Voice Mode</div>
              <div className="text-sm opacity-80">Talk with Shark 2.0 using voice</div>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => {
            setIsDiscoverMode(!isDiscoverMode)
            setShowMobileMenu(false)
          }}
          className={`w-full p-4 rounded-xl transition-all duration-200 border ${
            isDiscoverMode
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400"
              : "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-white border-cyan-400/50 hover:from-cyan-600/30 hover:to-blue-600/30"
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            <div className="text-left">
              <div className="font-semibold">Discover News</div>
              <div className="text-sm opacity-80">Latest news and updates</div>
            </div>
          </div>
        </motion.button>

        {isSpeechSupported && (
          <motion.button
            onClick={() => {
              toggleVoice()
              setShowMobileMenu(false)
            }}
            className={`w-full p-4 rounded-xl transition-all duration-200 border ${
              voiceEnabled
                ? isSpeaking
                  ? "bg-green-600 text-white border-green-400 animate-pulse"
                  : "bg-blue-600 text-white border-blue-400"
                : "bg-white/10 text-gray-300 border-white/20"
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{voiceEnabled ? "🔊" : "🔇"}</span>
              <div className="text-left">
                <div className="font-semibold">Voice Output</div>
                <div className="text-sm opacity-80">
                  {voiceEnabled ? "Voice responses enabled" : "Voice responses disabled"}
                </div>
              </div>
            </div>
          </motion.button>
        )}

        <motion.button
          onClick={() => {
            clearChat()
            setShowMobileMenu(false)
          }}
          className="w-full p-4 rounded-xl bg-red-600/20 text-red-400 border border-red-400/50 hover:bg-red-600/30 transition-all"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗑️</span>
            <div className="text-left">
              <div className="font-semibold">Clear Chat</div>
              <div className="text-sm opacity-80">Start a new conversation</div>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  )

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
          className={`flex items-center justify-between ${isMobile ? "p-3" : "p-4"} border-b border-white/20 backdrop-blur-md bg-white/10 relative`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <SharkLogo size={isMobile ? "sm" : "md"} animated={true} glowing={isSpeaking} />
            <div>
              <h1 className={`${isMobile ? "text-lg" : "text-2xl"} font-bold text-white flex items-center gap-2`}>
                Shark 2.0 🇮🇳
                <motion.span
                  className={`${isMobile ? "text-xs px-2 py-1" : "text-xs px-3 py-1"} rounded-full font-mono bg-gradient-to-r from-green-500 to-blue-500 text-white`}
                  animate={{
                    boxShadow: ["0 0 5px #10b981", "0 0 15px #3b82f6", "0 0 5px #10b981"],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  SMART AI 🧠
                </motion.span>
              </h1>
              {!isMobile && (
                <p className="text-sm text-white/80 font-mono">
                  🎯 {currentProvider}
                  {isSpeaking && " • 🔊 Speaking"}
                  {isLoading && " • 🔄 Processing..."}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Controls */}
          {!isMobile && (
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setIsImagineMode(!isImagineMode)}
                className={`p-3 rounded-lg transition-all duration-200 border border-white/20 ${
                  isImagineMode
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg animate-pulse"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="AI Image Generation"
              >
                🎨
              </motion.button>

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
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-3 rounded-lg transition-all duration-200 border border-white/20 ${
                showMobileMenu ? "bg-white/20 text-white" : "bg-white/10 text-white hover:bg-white/20"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col gap-1">
                <div
                  className={`w-5 h-0.5 bg-current transition-transform ${showMobileMenu ? "rotate-45 translate-y-1.5" : ""}`}
                ></div>
                <div className={`w-5 h-0.5 bg-current transition-opacity ${showMobileMenu ? "opacity-0" : ""}`}></div>
                <div
                  className={`w-5 h-0.5 bg-current transition-transform ${showMobileMenu ? "-rotate-45 -translate-y-1.5" : ""}`}
                ></div>
              </div>
            </motion.button>
          )}

          {/* Mobile Menu */}
          {isMobile && showMobileMenu && <MobileMenu />}
        </motion.header>

        {/* Mobile Status Bar */}
        {isMobile && (
          <div className="px-3 py-2 bg-black/20 border-b border-white/10">
            <p className="text-xs text-white/80 font-mono text-center">
              🎯 {currentProvider}
              {isSpeaking && " • 🔊 Speaking"}
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
              voiceEnabled={voiceEnabled}
              onDiscoverClick={() => setIsDiscoverMode(true)}
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
