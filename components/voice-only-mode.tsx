"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface VoiceOnlyModeProps {
  onSendMessage: (message: string, isVoice?: boolean) => void
  isLoading: boolean
  onBack: () => void
}

export default function VoiceOnlyMode({ onSendMessage, isLoading, onBack }: VoiceOnlyModeProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [transcript, setTranscript] = useState("")
  const [status, setStatus] = useState("Tap the Indian flag to start voice conversation")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [lastResponse, setLastResponse] = useState("")
  const recognitionRef = useRef<any>(null)
  const utteranceRef = useRef<any>(null)
  const isSpeakingRef = useRef(false)
  const isListeningRef = useRef(false)

  // Initialize speech recognition with better setup
  useEffect(() => {
    const initializeVoiceRecognition = async () => {
      if (typeof window === "undefined") return

      // Check for speech recognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        setStatus("Speech recognition not supported in this browser")
        return
      }

      try {
        // Request microphone permission first
        console.log("🎤 Requesting microphone permission...")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop()) // Stop the stream, we just needed permission
        setPermissionGranted(true)
        console.log("✅ Microphone permission granted!")

        // Create recognition instance
        const recognitionInstance = new SpeechRecognition()

        // Enhanced recognition settings for better accuracy
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true // Enable interim results for better feedback
        recognitionInstance.lang = "en-US"

        // Only set maxAlternatives if supported
        if ("maxAlternatives" in recognitionInstance) {
          recognitionInstance.maxAlternatives = 3
        }

        // Event handlers
        recognitionInstance.onstart = () => {
          console.log("🎤 Voice recognition started successfully")
          isListeningRef.current = true
          setIsListening(true)
          setStatus("🎤 Listening... speak now!")
          setTranscript("")
        }

        recognitionInstance.onresult = (event: any) => {
          console.log("🎯 Voice recognition result received")

          let interimTranscript = ""
          let finalTranscript = ""

          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0].transcript

            if (result.isFinal) {
              finalTranscript += transcript
              console.log("✅ Final transcript:", transcript)
            } else {
              interimTranscript += transcript
              console.log("⏳ Interim transcript:", transcript)
            }
          }

          // Show interim results for user feedback
          if (interimTranscript) {
            setTranscript(interimTranscript)
            setStatus(`🎤 Hearing: "${interimTranscript}"`)
          }

          // Process final result
          if (finalTranscript.trim()) {
            const cleanTranscript = finalTranscript.trim()
            console.log("🎯 Processing final transcript:", cleanTranscript)

            setTranscript(cleanTranscript)
            setStatus(`✅ Got it: "${cleanTranscript}"`)
            setIsListening(false)
            isListeningRef.current = false

            // Process the voice query
            setTimeout(() => {
              handleVoiceQuery(cleanTranscript)
            }, 500)
          }
        }

        recognitionInstance.onspeechstart = () => {
          console.log("🗣️ Speech detected!")
          setStatus("🗣️ Speech detected... keep talking!")
        }

        recognitionInstance.onspeechend = () => {
          console.log("🔇 Speech ended")
          setStatus("🔄 Processing what you said...")
        }

        recognitionInstance.onend = () => {
          console.log("🛑 Voice recognition ended")
          isListeningRef.current = false
          setIsListening(false)

          if (!transcript && !isProcessing) {
            setStatus("No speech detected. Tap flag to try again!")
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.log("⚠️ Voice recognition error:", event.error)
          isListeningRef.current = false
          setIsListening(false)

          // Handle different error types with helpful messages
          switch (event.error) {
            case "no-speech":
              setStatus("🔇 No speech detected. Speak louder and try again!")
              break
            case "audio-capture":
              setStatus("🎤 Microphone issue. Check your microphone and try again!")
              break
            case "not-allowed":
              setStatus("🚫 Microphone permission denied. Please allow microphone access!")
              setPermissionGranted(false)
              break
            case "network":
              setStatus("🌐 Network error. Check your connection and try again!")
              break
            case "aborted":
              setStatus("⏹️ Voice recognition stopped. Tap flag to restart!")
              break
            case "language-not-supported":
              setStatus("🌍 Language not supported. Using English by default.")
              break
            case "service-not-allowed":
              setStatus("🔒 Voice service not allowed. Try refreshing the page!")
              break
            default:
              setStatus(`❌ Voice error: ${event.error}. Tap flag to retry!`)
          }
        }

        recognitionRef.current = recognitionInstance
        setRecognition(recognitionInstance)
        setIsSupported(true)
        setStatus("✅ Ready! Tap the Indian flag to start voice chat")

        console.log("🎤 Voice recognition initialized successfully!")
      } catch (error) {
        console.error("❌ Failed to initialize voice recognition:", error)
        setPermissionGranted(false)
        setIsSupported(true) // Still supported, just no permission
        setStatus("🎤 Microphone permission required. Please allow access!")
      }
    }

    initializeVoiceRecognition()
  }, [transcript, isProcessing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log("Cleanup: Recognition already stopped")
        }
      }
    }
  }, [])

  const handleVoiceQuery = async (query: string) => {
    try {
      setIsProcessing(true)
      setStatus("🤖 Shark 2.0 is thinking...")

      console.log("🚀 Sending voice query to AI:", query)

      // Enhanced fetch with better error handling for mobile
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Shark2.0-Mobile/1.0",
        },
        body: JSON.stringify({
          message: query,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const aiResponse = data.content || "Sorry, I didn't get a response."

        console.log("✅ AI response received:", aiResponse.substring(0, 100) + "...")
        setLastResponse(aiResponse)

        setStatus("🔊 Shark 2.0 is speaking...")
        speakResponse(aiResponse)
      } else {
        const errorText = await response.text()
        console.error("❌ API response error:", response.status, errorText)
        setStatus("❌ API error. Tap flag to try again!")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("💥 Voice query error:", error)
      if (error.name === "AbortError") {
        setStatus("⏰ Request timeout. Check your connection and try again!")
      } else {
        setStatus("❌ Connection error. Tap flag to retry!")
      }
      setIsProcessing(false)
    }
  }

  const speakResponse = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("❌ Speech synthesis not available")
      setIsProcessing(false)
      return
    }

    // Clean text by removing emojis and special characters for speech
    const cleanTextForSpeech = (text: string) => {
      return text
        .replace(
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
          "",
        ) // Remove emojis
        .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
        .replace(/\*(.*?)\*/g, "$1") // Remove markdown italic
        .replace(/#{1,6}\s/g, "") // Remove markdown headers
        .replace(/•/g, "") // Remove bullet points
        .replace(/🦈|🇮🇳|🚀|✅|🧠|💻|📚|🎯|🔥|💪|🌟/g, "") // Remove specific emojis
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim()
    }

    const speechText = cleanTextForSpeech(text)

    // Clean up any existing speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
      utteranceRef.current = null
    }

    // Wait for speech synthesis to be ready
    const speak = () => {
      try {
        const utterance = new SpeechSynthesisUtterance(speechText)
        utteranceRef.current = utterance
        isSpeakingRef.current = true

        // Optimized voice settings for mobile
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0
        utterance.lang = "en-US"

        // Try to select a female voice if available
        const voices = window.speechSynthesis.getVoices()
        const femaleVoice = voices.find(
          (voice) =>
            voice.lang.startsWith("en") &&
            (voice.name.toLowerCase().includes("female") ||
              voice.name.toLowerCase().includes("woman") ||
              voice.name.toLowerCase().includes("samantha") ||
              voice.name.toLowerCase().includes("karen")),
        )
        if (femaleVoice) {
          utterance.voice = femaleVoice
        }

        utterance.onstart = () => {
          console.log("🔊 Speech synthesis started")
          setIsSpeaking(true)
          setIsProcessing(false)
          setStatus("🔊 Shark 2.0 is speaking... (tap to stop)")
        }

        utterance.onend = () => {
          console.log("🔇 Speech synthesis ended")
          if (isSpeakingRef.current) {
            setIsSpeaking(false)
            setIsProcessing(false)
            setStatus("✅ Done! Tap Indian flag for next question")
            setTranscript("")
            utteranceRef.current = null
            isSpeakingRef.current = false
          }
        }

        utterance.onerror = (event) => {
          console.log("⚠️ Speech synthesis error:", event.error)
          if (isSpeakingRef.current) {
            setIsSpeaking(false)
            setIsProcessing(false)
            setStatus("❌ Speech error. Tap flag to try again!")
            utteranceRef.current = null
            isSpeakingRef.current = false
          }
        }

        console.log("🎵 Starting speech synthesis...")
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("❌ Error creating speech:", error)
        setIsSpeaking(false)
        setIsProcessing(false)
        setStatus("❌ Speech error. Tap flag to try again!")
      }
    }

    // Ensure speech synthesis is ready
    if (window.speechSynthesis.pending || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setTimeout(speak, 200)
    } else {
      speak()
    }
  }

  const startListening = () => {
    if (
      !recognitionRef.current ||
      isListeningRef.current ||
      isSpeaking ||
      isLoading ||
      isProcessing ||
      !permissionGranted
    ) {
      console.log("❌ Cannot start listening - conditions not met")
      if (!permissionGranted) {
        setStatus("🎤 Microphone permission required!")
      }
      return
    }

    try {
      console.log("🎯 Starting voice recognition...")
      setStatus("🎤 Starting... get ready to speak!")
      setTranscript("")

      // Small delay to ensure proper state management
      setTimeout(() => {
        if (recognitionRef.current && !isListeningRef.current) {
          try {
            recognitionRef.current.start()
          } catch (error) {
            console.error("❌ Error starting recognition:", error)
            setStatus("❌ Error starting voice. Try again!")
          }
        }
      }, 200)
    } catch (error) {
      console.error("❌ Error in startListening:", error)
      setStatus("❌ Voice error. Try again!")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListeningRef.current) {
      console.log("🛑 Stopping voice recognition...")
      try {
        recognitionRef.current.stop()
        isListeningRef.current = false
        setIsListening(false)
        setStatus("⏹️ Voice stopped. Tap flag to continue.")
      } catch (error) {
        console.log("Error stopping recognition:", error)
        isListeningRef.current = false
        setIsListening(false)
        setStatus("⏹️ Voice stopped.")
      }
    }
  }

  const stopSpeaking = () => {
    console.log("🔇 Stopping speech synthesis...")

    if (utteranceRef.current && window.speechSynthesis) {
      isSpeakingRef.current = false
      window.speechSynthesis.cancel()

      setIsSpeaking(false)
      setIsProcessing(false)
      setStatus("⏹️ Speech stopped. Tap flag to continue.")
      utteranceRef.current = null
    }
  }

  const handleMainAction = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else if (isListening) {
      stopListening()
    } else if (!isProcessing && permissionGranted) {
      startListening()
    } else if (!permissionGranted) {
      // Try to request permission again
      window.location.reload()
    }
  }

  if (!isSupported) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">❌ Voice Mode Not Supported</h2>
          <p className="mb-6">Please use Chrome, Edge, or Safari for voice features.</p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>
      </div>
    )
  }

  if (!permissionGranted) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">🎤 Microphone Access Required</h2>
          <p className="mb-4">Voice mode needs microphone access to work properly.</p>
          <div className="space-y-4">
            <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
              🔄 Grant Permission & Reload
            </Button>
            <Button onClick={onBack} variant="outline" className="bg-white/10 text-white border-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white">🇮🇳 Voice Mode</h2>
            <p className="text-sm text-white/70">Enhanced voice conversation with Shark 2.0</p>
          </div>
        </div>
      </div>

      {/* Main Voice Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        {/* Main Voice Circle with Indian Flag */}
        <div className="relative">
          {/* Outer glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: isListening ? [1, 1.3, 1] : isSpeaking ? [1, 1.2, 1] : isProcessing ? [1, 1.1, 1] : 1,
              opacity: isListening || isSpeaking || isProcessing ? [0.2, 0.6, 0.2] : 0.1,
            }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            style={{
              width: "320px",
              height: "320px",
              background: isListening
                ? "radial-gradient(circle, rgba(255, 153, 51, 0.4), rgba(19, 136, 8, 0.4), rgba(255, 255, 255, 0.2))"
                : isSpeaking
                  ? "radial-gradient(circle, rgba(19, 136, 8, 0.4), rgba(255, 153, 51, 0.4), rgba(255, 255, 255, 0.2))"
                  : isProcessing
                    ? "radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4), rgba(255, 255, 255, 0.2))"
                    : "radial-gradient(circle, rgba(255, 153, 51, 0.3), rgba(19, 136, 8, 0.3), rgba(255, 255, 255, 0.1))",
            }}
          />

          {/* Middle ring with Indian flag colors */}
          <motion.div
            className="absolute inset-6 rounded-full border-4"
            animate={{
              borderColor: isListening
                ? ["#ff9933", "#ffffff", "#138808", "#ff9933"]
                : isSpeaking
                  ? ["#138808", "#ffffff", "#ff9933", "#138808"]
                  : isProcessing
                    ? ["#3b82f6", "#8b5cf6", "#3b82f6"]
                    : ["#ff9933", "#ffffff", "#138808", "#ff9933"],
              rotate: 360,
            }}
            transition={{
              borderColor: { duration: 3, repeat: Number.POSITIVE_INFINITY },
              rotate: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            }}
          />

          {/* Inner ring */}
          <motion.div
            className="absolute inset-12 rounded-full border-2 border-white/30"
            animate={{
              scale: isListening ? [1, 1.05, 1] : isSpeaking ? [1, 1.03, 1] : 1,
            }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          />

          {/* Main circle with Indian flag */}
          <motion.button
            onClick={handleMainAction}
            disabled={isLoading}
            className="relative w-64 h-64 rounded-full flex items-center justify-center text-6xl font-bold cursor-pointer overflow-hidden"
            style={{
              background: isListening
                ? "linear-gradient(to bottom, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%)"
                : isSpeaking
                  ? "linear-gradient(to bottom, #138808 33.33%, #ffffff 33.33%, #ffffff 66.66%, #ff9933 66.66%)"
                  : isProcessing
                    ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                    : "linear-gradient(to bottom, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%)",
              border: "3px solid rgba(255, 255, 255, 0.5)",
            }}
            animate={{
              scale: isListening ? [1, 1.05, 1] : isSpeaking ? [1, 1.03, 1] : isProcessing ? [1, 1.02, 1] : 1,
              boxShadow: isListening
                ? ["0 0 20px #ff9933", "0 0 40px #138808", "0 0 20px #ff9933"]
                : isSpeaking
                  ? ["0 0 20px #138808", "0 0 40px #ff9933", "0 0 20px #138808"]
                  : isProcessing
                    ? ["0 0 20px #3b82f6", "0 0 30px #8b5cf6", "0 0 20px #3b82f6"]
                    : [
                        "0 0 15px rgba(255, 153, 51, 0.5)",
                        "0 0 25px rgba(19, 136, 8, 0.5)",
                        "0 0 15px rgba(255, 153, 51, 0.5)",
                      ],
            }}
            transition={{
              scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
              boxShadow: { duration: 2, repeat: Number.POSITIVE_INFINITY },
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Indian Flag Emoji */}
            <motion.span
              className="text-8xl relative z-10"
              animate={{
                scale: isListening ? [1, 1.1, 1] : isSpeaking ? [1, 1.05, 1] : 1,
                rotate: isProcessing ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY },
                rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY },
              }}
            >
              🇮🇳
            </motion.span>

            {/* Voice indicator overlay */}
            {(isListening || isSpeaking) && (
              <motion.div
                className="absolute inset-0 rounded-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
              >
                {isListening ? <MicOff className="w-16 h-16 text-red-600" /> : <div className="text-4xl">🔊</div>}
              </motion.div>
            )}
          </motion.button>

          {/* Voice wave animation around the flag */}
          {(isListening || isSpeaking) && (
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex items-end gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 rounded-full ${isListening ? "bg-orange-400" : "bg-green-500"}`}
                  animate={{
                    height: [8, Math.random() * 50 + 25, 8],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: i * 0.05,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              ))}
            </div>
          )}

          {/* Floating particles */}
          {(isListening || isSpeaking || isProcessing) && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full ${
                    isListening ? "bg-orange-400" : isSpeaking ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{
                    top: "50%",
                    left: "50%",
                    transformOrigin: "0 0",
                  }}
                  animate={{
                    x: [0, Math.cos((i * Math.PI * 2) / 8) * 150],
                    y: [0, Math.sin((i * Math.PI * 2) / 8) * 150],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Status Display */}
        <motion.div className="text-center max-w-md" animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div
            className={`p-6 rounded-2xl backdrop-blur-sm border ${
              isListening
                ? "bg-orange-900/30 border-orange-400/50 text-orange-100"
                : isSpeaking
                  ? "bg-green-900/30 border-green-400/50 text-green-100"
                  : isProcessing
                    ? "bg-blue-900/30 border-blue-400/50 text-blue-100"
                    : "bg-white/10 border-white/30 text-white"
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div
                className={`w-4 h-4 rounded-full ${
                  isListening
                    ? "bg-orange-400 animate-pulse"
                    : isSpeaking
                      ? "bg-green-400 animate-pulse"
                      : isProcessing
                        ? "bg-blue-400 animate-pulse"
                        : "bg-white/50"
                }`}
              />
              <span className="font-semibold text-lg">{status}</span>
            </div>

            {transcript && (
              <div className="text-sm bg-black/30 p-3 rounded-lg mt-3">
                <strong>You said:</strong> "{transcript}"
              </div>
            )}

            {lastResponse && !isProcessing && !isSpeaking && (
              <div className="text-sm bg-black/30 p-3 rounded-lg mt-3 max-h-32 overflow-y-auto">
                <strong>AI Response:</strong> {lastResponse.substring(0, 200)}
                {lastResponse.length > 200 && "..."}
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Instructions */}
        <div className="text-center text-sm text-white/60 max-w-lg">
          <div className="bg-black/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-white/80">🇮🇳 Enhanced Voice Mode:</h4>
            <div className="space-y-1 text-left">
              <p>
                🇮🇳 <strong>Tap Indian flag</strong> to start listening
              </p>
              <p>
                🗣️ <strong>Speak clearly</strong> when flag glows orange
              </p>
              <p>
                👀 <strong>Watch status</strong> for real-time feedback
              </p>
              <p>
                🤖 <strong>AI processes</strong> your question (blue glow)
              </p>
              <p>
                🔊 <strong>Listen</strong> to Shark 2.0's response (green glow)
              </p>
              <p>
                🔄 <strong>Tap again</strong> for next question
              </p>
              <p>
                ⏹️ <strong>Tap during speech</strong> to stop anytime
              </p>
            </div>
            <div className="mt-3 text-xs text-yellow-400">
              💡 <strong>Mobile Tip:</strong> Ensure stable internet connection for best results!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
