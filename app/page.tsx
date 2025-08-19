"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Bookmark, Share2, Clock } from "lucide-react"
import InputBar from "@/components/input-bar"
import SharkLogo from "@/components/shark-logo"
import VoiceOnlyMode from "@/components/voice-only-mode"
import DiscoverPage from "@/components/discover-page"
import ImaginePage from "@/components/imagine-page"
import ChatHistory from "@/components/chat-history"
import TypingIndicator from "@/components/typing-indicator"
import { saveSession } from "@/lib/chat-storage"
import type { Message } from "@/types/chat"
import type { JSX } from "react"

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
    "Hello! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, your intelligent assistant ready for any adventure in knowledge.",
    "𝕏𝕪𝕝𝕠𝔾𝕖𝕟 online and ready! Let's turn your questions into fascinating discoveries.",
    "Greetings! I'm 𝕏𝕪𝕝𝕠𝔾𝕖𝕟, your AI partner in learning and exploration. What intrigues you?",
    "Hi! 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 here - think of me as your personal research assistant and friend combined!",
  ]
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
}

// Format AI content for full-screen reading
const formatAIContent = (content: string): JSX.Element[] => {
  const lines = content.split("\n")
  const formattedElements: JSX.Element[] = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      formattedElements.push(<div key={`space-${index}`} className="h-4 md:h-6" />)
      return
    }

    // Main headings
    if (trimmedLine.endsWith(":") || (trimmedLine.startsWith("**") && trimmedLine.endsWith("**"))) {
      const headingText = trimmedLine.replace(/\*\*/g, "").replace(":", "")
      formattedElements.push(
        <h2
          key={`heading-${index}`}
          className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 mt-6 md:mt-8 first:mt-0 leading-tight"
        >
          {headingText}
        </h2>,
      )
      return
    }

    // Numbered headings
    if (/^\d+\.\s/.test(trimmedLine)) {
      formattedElements.push(
        <h3
          key={`numbered-${index}`}
          className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 mt-4 md:mt-6 leading-tight"
        >
          {trimmedLine}
        </h3>,
      )
      return
    }

    // Bullet points
    if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ")) {
      const bulletText = trimmedLine.substring(2)
      const parts = bulletText.split(":")

      if (parts.length > 1) {
        const term = parts[0].trim()
        const description = parts.slice(1).join(":").trim()
        formattedElements.push(
          <div key={`bullet-${index}`} className="mb-4 md:mb-6 flex items-start gap-3 md:gap-4">
            <span className="text-cyan-400 text-base md:text-lg mt-1 md:mt-2 flex-shrink-0">•</span>
            <p className="text-base md:text-lg leading-relaxed">
              <span className="font-semibold text-white">{term}:</span>{" "}
              <span className="text-gray-200">{description}</span>
            </p>
          </div>,
        )
      } else {
        formattedElements.push(
          <div key={`bullet-${index}`} className="mb-3 md:mb-4 flex items-start gap-3 md:gap-4">
            <span className="text-cyan-400 text-base md:text-lg mt-1 md:mt-2 flex-shrink-0">•</span>
            <p className="text-gray-200 text-base md:text-lg leading-relaxed">{bulletText}</p>
          </div>,
        )
      }
      return
    }

    // Regular paragraphs
    formattedElements.push(
      <p key={`para-${index}`} className="text-gray-200 text-base md:text-lg leading-relaxed mb-4 md:mb-6">
        {trimmedLine}
      </p>,
    )
  })

  return formattedElements
}

export default function AIWebChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isAnswerMode, setIsAnswerMode] = useState(false)
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentAnswer])

  const handleSendMessage = async (message: string, isVoice = false, image?: File) => {
    if ((!message.trim() && !image) || isLoading) return

    // Switch to answer mode with smooth transition
    setCurrentQuestion(message)
    setCurrentAnswer("")
    setIsAnswerMode(true)
    setIsLoading(true)
    setInputText("")

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message || (image ? "Please analyze this image" : ""),
      role: "user",
      timestamp: new Date(),
      isVoice,
      hasImage: !!image,
    }

    try {
      console.log("🚀 CLIENT: Sending message to 𝕏𝕪𝕝𝕠𝔾𝕖𝕟:", message)

      let response

      if (image) {
        const formData = new FormData()
        formData.append("image", image)
        formData.append("message", message || "What do you see in this image?")

        response = await fetch("/api/vision", {
          method: "POST",
          body: formData,
        })
      } else {
        const requestBody = {
          messages: [userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          message: message,
        }

        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
      }

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`)
      }

      const data = await response.json()
      setCurrentAnswer(data.content || "No response received")

      // Save to history
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content || "No response received",
        role: "assistant",
        timestamp: new Date(),
        citations: data.citations || [],
        related_questions: data.related_questions || [],
        isError: false,
      }

      const sessionMessages = [userMessage, aiMessage]
      setMessages(sessionMessages)

      // Save session to chat history
      saveSession(sessionMessages)
      console.log("💾 Chat session saved with", sessionMessages.length, "messages")
    } catch (error) {
      console.error("💥 CLIENT: Error:", error)
      setCurrentAnswer(
        `I'm working in smart mode and ready to help! While I may not have real-time data, I can still provide intelligent answers on many topics.\n\n**I can help with:**\n• Programming and technology\n• Indian culture and knowledge\n• Educational topics\n• Problem-solving and analysis\n• General knowledge\n• Image analysis\n\n🚀 **Try asking me about specific topics I can explain!** 🇮🇳`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    setIsAnswerMode(false)
    setCurrentQuestion("")
    setCurrentAnswer("")
    setMessages([])
  }

  const handleDiscoverClick = () => setIsDiscoverMode(true)
  const handleVoiceModeClick = () => setIsVoiceMode(true)
  const handleImageGenerationClick = () => setIsImagineMode(true)

  // Special modes
  if (isImagineMode) {
    return (
      <div className="min-h-screen bg-black">
        <ImaginePage onBack={() => setIsImagineMode(false)} />
      </div>
    )
  }

  if (isDiscoverMode) {
    return (
      <div className="min-h-screen bg-black">
        <DiscoverPage onBack={() => setIsDiscoverMode(false)} />
      </div>
    )
  }

  if (isVoiceMode) {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundImage: "url(/indian-flag.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <VoiceOnlyMode onSendMessage={handleSendMessage} isLoading={isLoading} onBack={() => setIsVoiceMode(false)} />
      </div>
    )
  }

  // Answer Mode - Full Screen Reading Experience
  if (isAnswerMode) {
    return (
      <motion.div
        className="min-h-screen bg-black text-white overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 z-10">
          <div className="flex items-center justify-between p-3 md:p-4">
            <motion.button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center gap-3 md:gap-4">
              <motion.button
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content - Mobile: Full Width, Desktop: Centered */}
        <div className={isMobile ? "w-full" : "max-w-4xl mx-auto"}>
          {/* Question */}
          <motion.div
            className="px-4 md:px-8 py-4 md:py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-xl md:text-2xl lg:text-3xl font-normal text-white mb-6 md:mb-8 leading-relaxed">
              {currentQuestion}
            </h1>

            {/* Filter Buttons */}
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto pb-2">
              <div className="px-3 md:px-4 py-2 bg-white/10 rounded-full text-xs md:text-sm text-white border border-white/20 whitespace-nowrap">
                🦈 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 Pro
              </div>
              <div className="px-3 md:px-4 py-2 bg-white/5 rounded-full text-xs md:text-sm text-gray-400 border border-white/10 whitespace-nowrap">
                📚 Sources
              </div>
              <div className="px-3 md:px-4 py-2 bg-white/5 rounded-full text-xs md:text-sm text-gray-400 border border-white/10 whitespace-nowrap">
                🇮🇳 Indian Context
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 md:px-8 mb-6 md:mb-8">
              <TypingIndicator />
            </motion.div>
          )}

          {/* Answer Content */}
          {currentAnswer && (
            <motion.div
              className="px-4 md:px-8 prose prose-invert max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {formatAIContent(currentAnswer)}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input */}
        <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm border-t border-gray-800 p-3 md:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask follow-up..."
                className="w-full bg-gray-900 border border-gray-700 rounded-full px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors text-sm md:text-base"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && inputText.trim()) {
                    handleSendMessage(inputText.trim())
                  }
                }}
              />
              <motion.button
                className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎤
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Homepage - Clean and Minimal
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url(/tech-background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: isMobile ? "scroll" : "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between p-3 md:p-4 lg:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <SharkLogo size={isMobile ? "sm" : "md"} animated={true} />
            <div>
              <motion.h1
                className="text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center gap-1 md:gap-2"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <span
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-extrabold tracking-wider"
                  style={{
                    backgroundSize: "200% 200%",
                    textShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
                    filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))",
                  }}
                >
                  𝕏𝕪𝕝𝕠𝔾𝕖𝕟
                </span>
                🇮🇳
              </motion.h1>
            </div>
          </div>

          <motion.button
            onClick={() => setIsHistoryOpen(true)}
            className="text-white/60 hover:text-white transition-colors p-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Chat History"
          >
            <Clock className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-3 md:px-4 pb-24 md:pb-32">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 md:mb-8 text-4xl md:text-6xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              🦈
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-6xl font-light text-white mb-4 md:mb-6 leading-tight px-2">
              Everything
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                you can
              </span>
              <br />
              imagine is
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">real</span>
            </h2>
          </motion.div>
        </div>

        {/* Bottom Input */}
        <motion.div
          className="sticky bottom-0 p-3 md:p-4 lg:p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
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
        </motion.div>
      </div>

      {/* Chat History Modal */}
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadSession={(sessionMessages) => {
          console.log("📖 Loading session with", sessionMessages.length, "messages")

          // Set the messages
          setMessages(sessionMessages)

          // Find the first user message for the question
          const firstUserMessage = sessionMessages.find((msg) => msg.role === "user")
          const lastAssistantMessage = sessionMessages.find((msg) => msg.role === "assistant")

          if (firstUserMessage && lastAssistantMessage) {
            // Set up the answer mode with the loaded conversation
            setCurrentQuestion(firstUserMessage.content)
            setCurrentAnswer(lastAssistantMessage.content)
            setIsAnswerMode(true)
          }

          // Close the history modal
          setIsHistoryOpen(false)
        }}
      />
    </div>
  )
}
