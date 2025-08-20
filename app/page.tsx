"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Bookmark, Share2, Clock, Send } from "lucide-react"
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

// Format AI content for full-screen reading with ultra-premium styling
const formatAIContent = (content: string): JSX.Element[] => {
  const lines = content.split("\n")
  const formattedElements: JSX.Element[] = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      formattedElements.push(<div key={`space-${index}`} className="h-3 sm:h-4 md:h-6" />)
      return
    }

    // Main headings with enhanced styling
    if (trimmedLine.endsWith(":") || (trimmedLine.startsWith("**") && trimmedLine.endsWith("**"))) {
      const headingText = trimmedLine.replace(/\*\*/g, "").replace(":", "")
      formattedElements.push(
        <h2
          key={`heading-${index}`}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6 mt-4 sm:mt-6 md:mt-8 first:mt-0 leading-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
        >
          {headingText}
        </h2>,
      )
      return
    }

    // Layer headings (Layer 1, Layer 2, etc.)
    if (/^Layer \d+/.test(trimmedLine) || /^\*\*Layer \d+/.test(trimmedLine)) {
      const layerText = trimmedLine.replace(/\*\*/g, "")
      formattedElements.push(
        <h3
          key={`layer-${index}`}
          className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-cyan-300 mb-2 sm:mb-3 md:mb-4 mt-6 sm:mt-8 md:mt-10 leading-tight border-l-4 border-cyan-400 pl-4"
        >
          {layerText}
        </h3>,
      )
      return
    }

    // Numbered headings
    if (/^\d+\.\s/.test(trimmedLine)) {
      formattedElements.push(
        <h3
          key={`numbered-${index}`}
          className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 md:mb-4 mt-3 sm:mt-4 md:mt-6 leading-tight"
        >
          {trimmedLine}
        </h3>,
      )
      return
    }

    // Enhanced bullet points with better styling
    if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ")) {
      const bulletText = trimmedLine.substring(2)
      const parts = bulletText.split(":")

      if (parts.length > 1) {
        const term = parts[0].trim()
        const description = parts.slice(1).join(":").trim()
        formattedElements.push(
          <div
            key={`bullet-${index}`}
            className="mb-3 sm:mb-4 md:mb-6 flex items-start gap-2 sm:gap-3 md:gap-4 bg-gray-800/30 rounded-lg p-3 sm:p-4 border-l-2 border-cyan-400"
          >
            <span className="text-cyan-400 text-sm sm:text-base md:text-lg mt-0.5 sm:mt-1 md:mt-2 flex-shrink-0 font-bold">
              •
            </span>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed">
              <span className="font-bold text-cyan-300">{term}:</span>{" "}
              <span className="text-gray-200">{description}</span>
            </p>
          </div>,
        )
      } else {
        formattedElements.push(
          <div
            key={`bullet-${index}`}
            className="mb-2 sm:mb-3 md:mb-4 flex items-start gap-2 sm:gap-3 md:gap-4 bg-gray-800/20 rounded-lg p-2 sm:p-3"
          >
            <span className="text-cyan-400 text-sm sm:text-base md:text-lg mt-0.5 sm:mt-1 md:mt-2 flex-shrink-0 font-bold">
              •
            </span>
            <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed">{bulletText}</p>
          </div>,
        )
      }
      return
    }

    // Interactive elements (questions, challenges)
    if (
      trimmedLine.includes("?") &&
      (trimmedLine.includes("What") || trimmedLine.includes("How") || trimmedLine.includes("Challenge"))
    ) {
      formattedElements.push(
        <div
          key={`interactive-${index}`}
          className="text-white text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-xl p-4 sm:p-6 font-medium"
        >
          🤔 {trimmedLine}
        </div>,
      )
      return
    }

    // Emoji-prefixed sections (🇮🇳, 🚀, etc.)
    if (/^[🌟🚀🇮🇳🎯💡📚🔥⚡🌈✨🎨🧠💎🏆🎪🎭🎨]/u.test(trimmedLine)) {
      formattedElements.push(
        <div
          key={`emoji-section-${index}`}
          className="text-white text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-4 sm:p-6 font-medium"
        >
          {trimmedLine}
        </div>,
      )
      return
    }

    // Regular paragraphs with enhanced styling
    formattedElements.push(
      <p
        key={`para-${index}`}
        className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-6 font-light"
      >
        {trimmedLine}
      </p>,
    )
  })

  return formattedElements
}

export default function AIWebChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [followUpText, setFollowUpText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAnswerMode, setIsAnswerMode] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isDiscoverMode, setIsDiscoverMode] = useState(false)
  const [isImagineMode, setIsImagineMode] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Enhanced device detection for all screen sizes
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize("mobile") // iPhone, small Android
      } else if (width < 1024) {
        setScreenSize("tablet") // iPad, large phones, small tablets
      } else {
        setScreenSize("desktop") // Laptops, desktops
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string, isVoice = false, image?: File) => {
    if ((!message.trim() && !image) || isLoading) return

    // Switch to answer mode with smooth transition
    setIsAnswerMode(true)
    setIsLoading(true)
    setInputText("")
    setFollowUpText("")

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message || (image ? "Please analyze this image" : ""),
      role: "user",
      timestamp: new Date(),
      isVoice,
      hasImage: !!image,
    }

    // Add user message to conversation immediately
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

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
          messages: updatedMessages.map((msg) => ({
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

      // Add AI response to conversation
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content || "No response received",
        role: "assistant",
        timestamp: new Date(),
        citations: data.citations || [],
        related_questions: data.related_questions || [],
        isError: false,
      }

      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)

      // Save session to chat history
      saveSession(finalMessages)
      console.log("💾 Chat session saved with", finalMessages.length, "messages")
    } catch (error) {
      console.error("💥 CLIENT: Error:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `🚀 **I'm XyloGen, your advanced AI companion from India!** 🇮🇳

**Layer 1 - Foundation:**
I'm working in smart mode and ready to provide incredibly detailed, fascinating responses on countless topics!

**Layer 2 - My Capabilities:**
• **🧠 Deep Analysis**: Multi-layered explanations with rich context
• **🇮🇳 Indian Expertise**: Cultural knowledge, tech industry insights, local context
• **💡 Interactive Learning**: Questions, challenges, and thought experiments
• **🎨 Creative Solutions**: Problem-solving with innovative approaches
• **📚 Educational Depth**: Step-by-step breakdowns and real examples

**Layer 3 - What I Excel At:**
• **Programming & Technology**: Python, AI/ML, web development, system design
• **Indian Culture & Knowledge**: Festivals, traditions, languages, philosophy, cuisine
• **Educational Topics**: Science, mathematics, literature, philosophy
• **Problem-Solving**: Analytical thinking, strategic planning, optimization
• **Creative Projects**: Writing, ideation, artistic concepts
• **Image Analysis**: Visual understanding and detailed descriptions

**Layer 4 - Interactive Experience:**
🤔 **What fascinating topic would you like to explore together?**

**Layer 5 - Premium Features:**
• **Ultra-detailed responses**: 6-layer deep analysis
• **Real-world connections**: Specific examples and applications
• **Future implications**: Trends and emerging opportunities
• **Personalized insights**: Tailored to your interests and goals

**🌟 Try asking me about any topic - I'll provide comprehensive, engaging, and interactive responses that rival the best AI assistants!** ✨`,
        role: "assistant",
        timestamp: new Date(),
        isError: true,
      }

      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowUpSend = async () => {
    if (!followUpText.trim() || isLoading) return

    // This will add the follow-up to the existing conversation
    await handleSendMessage(followUpText.trim())
  }

  const handleBackToHome = () => {
    setIsAnswerMode(false)
    setMessages([])
    setFollowUpText("")
  }

  const handleDiscoverClick = () => setIsDiscoverMode(true)
  const handleVoiceModeClick = () => setIsVoiceMode(true)
  const handleImageGenerationClick = () => setIsImagineMode(true)

  // Responsive padding based on screen size
  const getResponsivePadding = () => {
    switch (screenSize) {
      case "mobile":
        return "px-1 py-3" // Minimal padding for mobile
      case "tablet":
        return "px-4 py-6" // Medium padding for tablets
      default:
        return "px-8 py-8" // Full padding for desktop
    }
  }

  const getResponsiveContentWidth = () => {
    switch (screenSize) {
      case "mobile":
        return "w-full" // Full width on mobile
      case "tablet":
        return "w-full max-w-4xl mx-auto" // Constrained on tablet
      default:
        return "max-w-6xl mx-auto" // Large constraint on desktop
    }
  }

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

  // Answer Mode - Full Conversation View with Ultra-Premium Styling
  if (isAnswerMode) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header - Responsive */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-gray-700/50 z-10">
          <div className="flex items-center justify-between p-2 sm:p-3 md:p-4">
            <motion.button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <motion.button
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <motion.button
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Full Conversation Content - Ultra-Premium Design */}
        <div className={getResponsiveContentWidth()}>
          <div className={getResponsivePadding()}>
            {/* Enhanced Filter Buttons */}
            <div className="flex gap-1 sm:gap-2 md:gap-3 mb-4 sm:mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full text-xs sm:text-sm text-white border border-cyan-400/30 whitespace-nowrap backdrop-blur-sm">
                🦈 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 Ultra
              </div>
              <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-white/5 rounded-full text-xs sm:text-sm text-gray-400 border border-white/10 whitespace-nowrap backdrop-blur-sm">
                📚 6-Layer Analysis
              </div>
              <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-white/5 rounded-full text-xs sm:text-sm text-gray-400 border border-white/10 whitespace-nowrap backdrop-blur-sm">
                🇮🇳 Indian Context
              </div>
              <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-white/5 rounded-full text-xs sm:text-sm text-gray-400 border border-white/10 whitespace-nowrap backdrop-blur-sm">
                🎯 Interactive
              </div>
            </div>

            {/* Display Full Conversation - Ultra-Premium Styling */}
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-6 sm:mb-8 md:mb-12"
              >
                {message.role === "user" ? (
                  // User Question - Enhanced Design
                  <div className="mb-4 sm:mb-6 md:mb-8">
                    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-400/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal text-white leading-tight sm:leading-relaxed">
                        {message.content}
                      </h2>
                      {message.hasImage && (
                        <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-cyan-400 flex items-center gap-2">
                          📸 <span>Image uploaded for analysis</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // AI Answer - Ultra-Premium Design
                  <div className="prose prose-invert max-w-none bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/30 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur-sm">
                    {formatAIContent(message.content)}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Enhanced Loading State */}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                  <TypingIndicator />
                  <p className="text-cyan-300 text-sm mt-2">
                    🧠 Analyzing and crafting your ultra-detailed response...
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Bottom Follow-up Input */}
        <div className="sticky bottom-0 bg-black/95 backdrop-blur-md border-t border-gray-700/50 p-2 sm:p-3 md:p-4">
          <div className={getResponsiveContentWidth()}>
            <div className="relative">
              <input
                type="text"
                placeholder="Ask follow-up for even deeper insights..."
                className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/50 rounded-2xl sm:rounded-3xl px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 pr-12 sm:pr-16 md:pr-20 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:bg-gray-800/70 transition-all duration-300 text-xs sm:text-sm md:text-base backdrop-blur-sm"
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && followUpText.trim() && !isLoading) {
                    handleFollowUpSend()
                  }
                }}
                disabled={isLoading}
              />
              <motion.button
                onClick={handleFollowUpSend}
                disabled={!followUpText.trim() || isLoading}
                className="absolute right-1.5 sm:right-2 md:right-3 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-full transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Homepage - Ultra-Premium Design
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url(/tech-background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: screenSize === "mobile" ? "scroll" : "fixed",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Enhanced Header */}
        <motion.header
          className="flex items-center justify-between p-2 sm:p-3 md:p-4 lg:p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <SharkLogo size={screenSize === "mobile" ? "sm" : screenSize === "tablet" ? "md" : "lg"} animated={true} />
            <div>
              <motion.h1
                className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white flex items-center gap-1 md:gap-2"
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
            className="text-white/60 hover:text-white transition-colors p-1 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Chat History"
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </motion.button>
        </motion.header>

        {/* Enhanced Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-3 md:px-4 pb-20 sm:pb-24 md:pb-32">
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-6 md:mb-8 text-2xl sm:text-4xl md:text-6xl bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20"
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

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-light text-white mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
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

            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
              Ultra-detailed AI responses with 6-layer analysis, interactive learning, and Indian expertise
            </p>
          </motion.div>
        </div>

        {/* Enhanced Bottom Input */}
        <motion.div
          className="sticky bottom-0 p-2 sm:p-3 md:p-4 lg:p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <InputBar
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            voiceEnabled={true}
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

          // Set the messages and switch to answer mode
          setMessages(sessionMessages)
          setIsAnswerMode(true)

          // Close the history modal
          setIsHistoryOpen(false)
        }}
      />
    </div>
  )
}
