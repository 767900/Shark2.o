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
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)
  const [lastResponse, setLastResponse] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)
  const recognitionRef = useRef<any>(null)
  const utteranceRef = useRef<any>(null)
  const isSpeakingRef = useRef(false)
  const isListeningRef = useRef(false)
  const speechQueueRef = useRef<string[]>([])
  const currentChunkRef = useRef(0)

  // Fast initialization - removed delays
  useEffect(() => {
    const initializeVoiceRecognition = async () => {
      if (typeof window === "undefined") return

      console.log("🚀 Fast voice system initialization...")
      setStatus("🔄 Initializing...")

      // Check for speech recognition support immediately
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        console.log("❌ Speech recognition not supported")
        setIsSupported(false)
        setIsInitializing(false)
        setStatus("Speech recognition not supported in this browser")
        return
      }

      console.log("✅ Speech recognition API found")
      setStatus("🎤 Getting microphone access...")

      try {
        // Fast permission request
        console.log("🎤 Requesting microphone permission...")
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
        setPermissionGranted(true)
        console.log("✅ Microphone permission granted!")

        // Create recognition instance immediately
        const recognitionInstance = new SpeechRecognition()

        // Optimized recognition settings for speed
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        if ("maxAlternatives" in recognitionInstance) {
          recognitionInstance.maxAlternatives = 1 // Reduced for speed
        }

        // Fast event handlers
        recognitionInstance.onstart = () => {
          console.log("🎤 Voice recognition started")
          isListeningRef.current = true
          setIsListening(true)
          setStatus("🎤 Listening... speak now!")
          setTranscript("")
        }

        recognitionInstance.onresult = (event: any) => {
          console.log("🎯 Voice result received")

          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0].transcript

            if (result.isFinal) {
              finalTranscript += transcript
              console.log("✅ Final transcript:", transcript)
            } else {
              interimTranscript += transcript
            }
          }

          if (interimTranscript) {
            setTranscript(interimTranscript)
            setStatus(`🎤 Hearing: "${interimTranscript}"`)
          }

          if (finalTranscript.trim()) {
            const cleanTranscript = finalTranscript.trim()
            console.log("🎯 Processing final transcript:", cleanTranscript)

            setTranscript(cleanTranscript)
            setStatus(`✅ Got it: "${cleanTranscript}"`)
            setIsListening(false)
            isListeningRef.current = false

            // Process immediately - no delay
            handleVoiceQuery(cleanTranscript)
          }
        }

        recognitionInstance.onspeechstart = () => {
          console.log("🗣️ Speech detected!")
          setStatus("🗣️ Speech detected... keep talking!")
        }

        recognitionInstance.onspeechend = () => {
          console.log("🔇 Speech ended")
          setStatus("🔄 Processing...")
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

          switch (event.error) {
            case "no-speech":
              setStatus("🔇 No speech detected. Speak louder!")
              break
            case "audio-capture":
              setStatus("🎤 Microphone issue. Check your microphone!")
              break
            case "not-allowed":
              setStatus("🚫 Microphone permission denied!")
              setPermissionGranted(false)
              break
            case "network":
              setStatus("🌐 Network error. Check connection!")
              break
            default:
              setStatus(`❌ Voice error: ${event.error}. Try again!`)
          }
        }

        recognitionRef.current = recognitionInstance
        setRecognition(recognitionInstance)
        setIsSupported(true)
        setPermissionGranted(true)
        setIsInitializing(false)
        setStatus("✅ Ready! Tap the Indian flag to start")

        console.log("🎤 Voice recognition ready!")
      } catch (error) {
        console.error("❌ Failed to initialize voice:", error)
        setPermissionGranted(false)
        setIsSupported(true)
        setIsInitializing(false)
        setStatus("🎤 Microphone permission required!")
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
      setStatus("🤖 Shark 2.0 thinking...")

      console.log("🚀 Sending voice query:", query)

      // Faster API call with reduced timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // Reduced from 30s to 15s

      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

        setStatus("🔊 Shark 2.0 speaking...")
        // Start speaking immediately
        speakSmoothResponse(aiResponse)
      } else {
        const errorText = await response.text()
        console.error("❌ API response error:", response.status, errorText)
        setStatus("❌ API error. Try again!")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("💥 Voice query error:", error)
      if (error.name === "AbortError") {
        setStatus("⏰ Request timeout. Try again!")
      } else {
        setStatus("❌ Connection error. Try again!")
      }
      setIsProcessing(false)
    }
  }

  // Optimized smooth speech synthesis - NO PAUSES between chunks
  const speakSmoothResponse = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatus("❌ Speech synthesis not available")
      setIsProcessing(false)
      return
    }

    // Enhanced text cleaning for smooth speech
    const cleanTextForSpeech = (text: string) => {
      return (
        text
          .replace(
            /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
            "",
          )
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/#{1,6}\s/g, "")
          .replace(/```[\s\S]*?```/g, "code block")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/•/g, "")
          // Technical term pronunciation fixes
          .replace(/embedded/gi, "embedded")
          .replace(/system/gi, "system")
          .replace(/microcontroller/gi, "micro controller")
          .replace(/IoT/gi, "I O T")
          .replace(/CPU/gi, "C P U")
          .replace(/RAM/gi, "R A M")
          .replace(/ROM/gi, "R O M")
          .replace(/API/gi, "A P I")
          .replace(/USB/gi, "U S B")
          .replace(/GPIO/gi, "G P I O")
          .replace(/PWM/gi, "P W M")
          .replace(/ADC/gi, "A D C")
          .replace(/UART/gi, "U A R T")
          .replace(/SPI/gi, "S P I")
          .replace(/I2C/gi, "I two C")
          .replace(/\n+/g, ". ")
          .replace(/\s+/g, " ")
          .replace(/\.\s*\./g, ".")
          .replace(/\s*,\s*/g, ", ")
          .replace(/\s*!\s*/g, "! ")
          .replace(/\s*\?\s*/g, "? ")
          .trim()
      )
    }

    const speechText = cleanTextForSpeech(text)

    // Clean up any existing speech
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
      utteranceRef.current = null
    }

    // OPTIMIZED: Use larger chunks for smoother speech - NO PAUSES
    const maxChunkLength = 500 // Increased chunk size for smoother flow
    const sentences = speechText.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const chunks: string[] = []
    let currentChunk = ""

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (currentChunk.length + trimmedSentence.length + 2 <= maxChunkLength) {
        currentChunk += (currentChunk ? ". " : "") + trimmedSentence
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + ".")
        }
        currentChunk = trimmedSentence
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + ".")
    }

    console.log("🔊 Smooth speech: Split into", chunks.length, "chunks")

    speechQueueRef.current = chunks
    currentChunkRef.current = 0
    isSpeakingRef.current = true

    // Start speaking immediately with NO delays
    speakNextChunkSmooth()
  }

  // SMOOTH chunk speaking with NO pauses
  const speakNextChunkSmooth = () => {
    if (currentChunkRef.current >= speechQueueRef.current.length || !isSpeakingRef.current) {
      console.log("🔇 Finished speaking smoothly")
      setIsSpeaking(false)
      setIsProcessing(false)
      setStatus("✅ Done! Tap Indian flag for next question")
      setTranscript("")
      utteranceRef.current = null
      isSpeakingRef.current = false
      return
    }

    const chunk = speechQueueRef.current[currentChunkRef.current]
    console.log(
      `🔊 Speaking smooth chunk ${currentChunkRef.current + 1}/${speechQueueRef.current.length}:`,
      chunk.substring(0, 80) + "...",
    )

    const utterance = new SpeechSynthesisUtterance(chunk)
    utteranceRef.current = utterance

    // Optimized voice settings for smooth continuous speech
    utterance.rate = 0.85 // Slightly faster for smoother flow
    utterance.pitch = 1.1
    utterance.volume = 1.0
    utterance.lang = "en-US"

    // Quick voice selection
    const voices = window.speechSynthesis.getVoices()
    const femaleVoice = voices.find(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("karen")),
    )
    if (femaleVoice) {
      utterance.voice = femaleVoice
    }

    utterance.onstart = () => {
      if (currentChunkRef.current === 0) {
        console.log("🔊 Smooth speech started")
        setIsSpeaking(true)
        setIsProcessing(false)
        setStatus("🔊 Shark 2.0 speaking... (tap to stop)")
      }
      console.log(`▶️ Started smooth chunk ${currentChunkRef.current + 1}`)
    }

    utterance.onend = () => {
      console.log(`✅ Finished smooth chunk ${currentChunkRef.current + 1}`)
      utteranceRef.current = null
      currentChunkRef.current++

      // CRITICAL: NO setTimeout delay - speak next chunk immediately
      speakNextChunkSmooth()
    }

    utterance.onerror = (event) => {
      console.log(`⚠️ Smooth speech error in chunk ${currentChunkRef.current + 1}:`, event.error)
      if (event.error !== "interrupted" && event.error !== "cancelled") {
        currentChunkRef.current++
        // Continue immediately on error - NO delay
        speakNextChunkSmooth()
      } else {
        setIsSpeaking(false)
        setIsProcessing(false)
        setStatus("⏹️ Speech stopped. Tap flag to continue.")
        utteranceRef.current = null
        isSpeakingRef.current = false
      }
    }

    try {
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error(`❌ Error speaking smooth chunk ${currentChunkRef.current + 1}:`, error)
      currentChunkRef.current++
      // Continue immediately on error - NO delay
      speakNextChunkSmooth()
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
      console.log("❌ Cannot start listening")
      if (!permissionGranted) {
        setStatus("🎤 Microphone permission required!")
      }
      return
    }

    try {
      console.log("🎯 Starting voice recognition...")
      setStatus("🎤 Starting...")
      setTranscript("")

      // Start immediately - NO delay
      if (recognitionRef.current && !isListeningRef.current) {
        try {
          recognitionRef.current.start()
        } catch (error) {
          console.error("❌ Error starting recognition:", error)
          setStatus("❌ Error starting voice. Try again!")
        }
      }
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
      speechQueueRef.current = []
      currentChunkRef.current = 0
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
      window.location.reload()
    }
  }

  // Fast loading screen - reduced animation time
  if (isInitializing || isSupported === null) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="mb-6">
            <motion.div
              className="w-16 h-16 mx-auto text-cyan-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} // Faster rotation
            >
              🇮🇳
            </motion.div>
          </div>
          <h2 className="text-2xl mb-4">🎤 Initializing Voice Mode</h2>
          <p className="mb-4 text-white/70">{status}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-white/50">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>Fast setup in progress...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show not supported screen
  if (isSupported === false) {
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

  // Show permission required screen
  if (permissionGranted === false) {
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

  // Main voice interface
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
            <p className="text-sm text-white/70">Fast voice conversation with Shark 2.0</p>
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
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }} // Faster animation
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
              borderColor: { duration: 2, repeat: Number.POSITIVE_INFINITY }, // Faster color change
              rotate: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }, // Faster rotation
            }}
          />

          {/* Inner ring */}
          <motion.div
            className="absolute inset-12 rounded-full border-2 border-white/30"
            animate={{
              scale: isListening ? [1, 1.05, 1] : isSpeaking ? [1, 1.03, 1] : 1,
            }}
            transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }} // Faster pulse
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
              scale: { duration: 0.8, repeat: Number.POSITIVE_INFINITY }, // Faster pulse
              boxShadow: { duration: 1.5, repeat: Number.POSITIVE_INFINITY }, // Faster glow
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
                scale: { duration: 1, repeat: Number.POSITIVE_INFINITY }, // Faster scale
                rotate: { duration: 1.5, repeat: Number.POSITIVE_INFINITY }, // Faster rotation
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
                    duration: 0.4, // Faster wave animation
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: i * 0.03, // Faster wave propagation
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
                    duration: 1.5, // Faster particle animation
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.15, // Faster particle sequence
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Status Display */}
        <motion.div className="text-center max-w-md" animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
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
            <h4 className="font-semibold mb-2 text-white/80">🇮🇳 Fast Voice Mode:</h4>
            <div className="space-y-1 text-left">
              <p>
                🇮🇳 <strong>Tap Indian flag</strong> to start instantly
              </p>
              <p>
                🗣️ <strong>Speak clearly</strong> when flag glows orange
              </p>
              <p>
                ⚡ <strong>Fast processing</strong> - reduced wait times
              </p>
              <p>
                🔊 <strong>Smooth speech</strong> - no more pauses or stops
              </p>
              <p>
                🔄 <strong>Tap again</strong> for next question
              </p>
              <p>
                ⏹️ <strong>Tap during speech</strong> to stop anytime
              </p>
            </div>
            <div className="mt-3 text-xs text-yellow-400">
              ⚡ <strong>Optimized:</strong> Faster initialization, smoother speech, no interruptions!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
