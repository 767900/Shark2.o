"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const recognitionRef = useRef<any>(null)
  const utteranceRef = useRef<any>(null)
  const isSpeakingRef = useRef(false)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()

        // Optimized recognition settings
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = "en-US"
        recognitionInstance.maxAlternatives = 1

        recognitionInstance.onstart = () => {
          console.log("🎤 Voice recognition started")
          setIsListening(true)
          setStatus("🎤 Listening... speak clearly!")
          setTranscript("")
        }

        recognitionInstance.onresult = (event: any) => {
          console.log("🎯 Voice recognition result received")
          const results = event.results
          const lastResult = results[results.length - 1]

          if (lastResult.isFinal) {
            const finalTranscript = lastResult[0].transcript.trim()
            console.log("✅ Final transcript:", finalTranscript)

            if (finalTranscript) {
              setTranscript(finalTranscript)
              setStatus(`Processing: "${finalTranscript}"`)
              setIsListening(false)
              handleVoiceQuery(finalTranscript)
            } else {
              setStatus("No speech detected. Tap flag to try again!")
              setIsListening(false)
            }
          }
        }

        recognitionInstance.onend = () => {
          console.log("🛑 Voice recognition ended")
          setIsListening(false)
          if (!transcript && !isProcessing) {
            setStatus("Voice session ended. Tap flag to try again!")
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.log("⚠️ Voice recognition event:", event.error)
          setIsListening(false)

          // Handle different error types gracefully
          switch (event.error) {
            case "no-speech":
              setStatus("No speech detected. Please speak louder and try again!")
              break
            case "audio-capture":
              setStatus("Microphone not accessible. Check permissions and try again!")
              break
            case "not-allowed":
              setStatus("Microphone permission denied. Please allow microphone access!")
              break
            case "network":
              setStatus("Network error. Check connection and try again!")
              break
            case "aborted":
              setStatus("Voice recognition stopped. Tap flag to restart!")
              break
            case "language-not-supported":
              setStatus("Language not supported. Using English by default.")
              break
            default:
              setStatus(`Voice error: ${event.error}. Tap flag to retry!`)
          }
        }

        recognitionRef.current = recognitionInstance
        setRecognition(recognitionInstance)
        setIsSupported(true)
        setStatus("Ready! Tap the Indian flag to start voice chat")
      } else {
        setIsSupported(false)
        setStatus("Speech recognition not supported in this browser")
      }
    }
  }, [transcript, isProcessing])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [])

  const handleVoiceQuery = async (query: string) => {
    try {
      setIsProcessing(true)
      setStatus("🤖 Getting smart AI response...")

      console.log("🚀 Sending voice query to AI:", query)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: query }],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse = data.content || "Sorry, no response received."

        console.log("✅ AI response received:", aiResponse.substring(0, 100) + "...")

        setStatus("🔊 Shark 2.0 is speaking...")
        speakResponse(aiResponse)
      } else {
        console.error("❌ API response error:", response.status)
        setStatus("API error. Tap flag to try again!")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("💥 Voice query error:", error)
      setStatus("Connection error. Tap flag to retry!")
      setIsProcessing(false)
    }
  }

  const speakResponse = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("Speech synthesis not available")
      setIsProcessing(false)
      return
    }

    // Clean up any existing speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
      utteranceRef.current = null
    }

    // Wait for speech synthesis to be ready
    const speak = () => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utteranceRef.current = utterance
        isSpeakingRef.current = true

        // Optimized voice settings
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 1.0
        utterance.lang = "en-US"

        utterance.onstart = () => {
          console.log("🔊 Speech synthesis started")
          setIsSpeaking(true)
          setIsProcessing(false)
          setStatus("🔊 Shark 2.0 is speaking... (tap to stop)")
        }

        utterance.onend = () => {
          console.log("🔇 Speech synthesis ended normally")
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
          console.log("⚠️ Speech synthesis event:", event.error)

          // Handle different error types
          if (event.error === "interrupted") {
            console.log("Speech was intentionally stopped")
          } else if (event.error === "canceled") {
            console.log("Speech was canceled")
          } else {
            console.error("Speech synthesis error:", event.error)
            setStatus("Speech error. Tap flag to try again!")
          }

          // Clean up state
          if (isSpeakingRef.current) {
            setIsSpeaking(false)
            setIsProcessing(false)
            utteranceRef.current = null
            isSpeakingRef.current = false
          }
        }

        // Start speaking
        console.log("🎵 Starting speech synthesis...")
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("❌ Error creating speech:", error)
        setIsSpeaking(false)
        setIsProcessing(false)
        setStatus("Speech error. Tap flag to try again!")
      }
    }

    // Ensure speech synthesis is ready
    if (window.speechSynthesis.pending || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setTimeout(speak, 100)
    } else {
      speak()
    }
  }

  const startListening = () => {
    if (!recognitionRef.current || isListening || isSpeaking || isLoading || isProcessing) {
      console.log("❌ Cannot start - conditions not met")
      return
    }

    try {
      console.log("🎯 Starting voice recognition...")
      setStatus("🎤 Get ready to speak...")

      // Add a small delay to ensure proper initialization
      setTimeout(() => {
        if (recognitionRef.current && !isListening) {
          recognitionRef.current.start()
        }
      }, 100)
    } catch (error) {
      console.error("❌ Error starting recognition:", error)
      setStatus("Error starting voice recognition. Try again!")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log("🛑 Stopping voice recognition...")
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log("Error stopping recognition:", error)
        setIsListening(false)
        setStatus("Voice stopped. Tap flag to continue.")
      }
    }
  }

  const stopSpeaking = () => {
    console.log("🔇 Stopping speech synthesis...")

    if (utteranceRef.current && window.speechSynthesis) {
      isSpeakingRef.current = false
      window.speechSynthesis.cancel()

      // Update state immediately
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatus("Speech stopped. Tap flag to continue.")

      // Clean up
      utteranceRef.current = null
    }
  }

  const handleMainAction = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else if (isListening) {
      stopListening()
    } else if (!isProcessing) {
      startListening()
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
            <p className="text-sm text-white/70">Voice conversation with Shark 2.0</p>
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
          <AnimatePresence>
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
          </AnimatePresence>

          {/* Floating particles */}
          <AnimatePresence>
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
          </AnimatePresence>
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
          </div>
        </motion.div>

        {/* Instructions */}
        <div className="text-center text-sm text-white/60 max-w-lg">
          <div className="bg-black/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-white/80">🇮🇳 Voice Mode Instructions:</h4>
            <div className="space-y-1 text-left">
              <p>
                🇮🇳 <strong>Tap Indian flag</strong> to start listening
              </p>
              <p>
                🗣️ <strong>Speak clearly</strong> when flag glows orange
              </p>
              <p>
                🤖 <strong>AI processes</strong> your question (blue glow)
              </p>
              <p>
                🔊 <strong>Listen</strong> to Shark 2.0's voice response (green glow)
              </p>
              <p>
                🔄 <strong>Tap again</strong> to ask another question
              </p>
              <p>
                ⏹️ <strong>Tap during speech</strong> to stop
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
