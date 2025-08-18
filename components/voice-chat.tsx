"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import VoiceSynthesizer from "./voice-synthesizer"
import type SpeechRecognition from "speech-recognition"

interface VoiceChatProps {
  onSendMessage: (message: string, isVoice?: boolean) => void
  isLoading: boolean
  lastMessage?: string
}

export default function VoiceChat({ onSendMessage, isLoading, lastMessage = "" }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [language, setLanguage] = useState("en-IN")
  const [confidence, setConfidence] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()

        // Enhanced settings for Indian voice recognition
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = language
        recognitionInstance.maxAlternatives = 3

        recognitionInstance.onstart = () => {
          console.log("🎤 Voice recognition started")
          setIsListening(true)
        }

        recognitionInstance.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0].transcript

            if (result.isFinal) {
              finalTranscript += transcript
              setConfidence(result[0].confidence)
              console.log("🎤 Final transcript:", transcript, "Confidence:", result[0].confidence)
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript)

            // Auto-send after a pause
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
              const fullTranscript = (transcript + finalTranscript).trim()
              if (fullTranscript) {
                console.log("🎤 Sending voice message:", fullTranscript)
                onSendMessage(fullTranscript, true)
                setTranscript("")
                setInterimTranscript("")
                stopListening()
              }
            }, 2000) // Wait 2 seconds after final result
          }

          setInterimTranscript(interimTranscript)
        }

        recognitionInstance.onerror = (event) => {
          console.error("🎤 Speech recognition error:", event.error)
          setIsListening(false)

          // Handle specific errors
          if (event.error === "not-allowed") {
            alert("🎤 Microphone access denied. Please allow microphone access and try again.")
          } else if (event.error === "no-speech") {
            console.log("🎤 No speech detected, continuing to listen...")
            // Don't stop listening for no-speech errors
          }
        }

        recognitionInstance.onend = () => {
          console.log("🎤 Voice recognition ended")
          setIsListening(false)
          setInterimTranscript("")
        }

        setRecognition(recognitionInstance)
        setIsSupported(true)
      } else {
        console.warn("🎤 Speech recognition not supported")
        setIsSupported(false)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [language, onSendMessage, transcript])

  const startListening = async () => {
    if (!recognition || isListening) return

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      setTranscript("")
      setInterimTranscript("")
      setConfidence(0)

      recognition.lang = language
      recognition.start()
      console.log("🎤 Started listening in", language)
    } catch (error) {
      console.error("🎤 Error starting voice recognition:", error)
      alert("🎤 Could not access microphone. Please check permissions.")
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      console.log("🎤 Stopped listening")
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const changeLanguage = (newLang: string) => {
    setLanguage(newLang)
    if (isListening) {
      stopListening()
      setTimeout(() => startListening(), 100)
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking) {
      setIsSpeaking(false)
    }
  }

  // Auto-speak new messages
  useEffect(() => {
    if (lastMessage && voiceEnabled && !isLoading) {
      setIsSpeaking(true)
    }
  }, [lastMessage, voiceEnabled, isLoading])

  if (!isSupported) {
    return (
      <div className="text-center p-8 text-white/80">
        <p>🎤 Voice chat is not supported in this browser.</p>
        <p className="text-sm mt-2">Please use Chrome, Edge, or Safari for voice features.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-white">
      {/* 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 Voice Avatar */}
      <motion.div
        className="relative mb-8"
        animate={{
          scale: isListening ? [1, 1.1, 1] : isSpeaking ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: isListening || isSpeaking ? Number.POSITIVE_INFINITY : 0,
        }}
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center text-6xl relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: isListening || isSpeaking ? [-100, 100] : 0,
            }}
            transition={{
              duration: 2,
              repeat: isListening || isSpeaking ? Number.POSITIVE_INFINITY : 0,
            }}
          />
          <span className="relative z-10">🎭</span>
        </div>

        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-white/30"
          animate={{
            scale: isListening ? [1, 1.2, 1] : isSpeaking ? [1, 1.1, 1] : 1,
            opacity: isListening || isSpeaking ? [0.5, 0.8, 0.5] : 0.3,
          }}
          transition={{
            duration: 1.5,
            repeat: isListening || isSpeaking ? Number.POSITIVE_INFINITY : 0,
          }}
        />
      </motion.div>

      {/* Status */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            𝕏𝕪𝕝𝕠𝔾𝕖𝕟
          </span>{" "}
          Voice Chat
        </h2>
        <AnimatePresence mode="wait">
          {isListening && (
            <motion.p
              key="listening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-green-400 font-medium"
            >
              🎤 Listening... Speak now!
            </motion.p>
          )}
          {isSpeaking && (
            <motion.p
              key="speaking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-purple-400 font-medium"
            >
              🎭 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 is speaking...
            </motion.p>
          )}
          {!isListening && !isSpeaking && (
            <motion.p
              key="ready"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white/80"
            >
              Ready to chat with voice
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 max-w-md w-full"
          >
            <p className="text-white">
              {transcript}
              <span className="text-white/60 italic">{interimTranscript}</span>
            </p>
            {confidence > 0 && (
              <div className="mt-2 text-xs text-white/60">Confidence: {Math.round(confidence * 100)}%</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        {/* Microphone Button */}
        <motion.button
          onClick={toggleListening}
          disabled={isLoading}
          className={`p-4 rounded-full transition-all duration-300 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50"
              : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </motion.button>

        {/* Voice Toggle */}
        <motion.button
          onClick={toggleVoice}
          className={`p-4 rounded-full transition-all duration-300 ${
            voiceEnabled
              ? "bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/50"
              : "bg-gray-500 hover:bg-gray-600 shadow-lg shadow-gray-500/50"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={voiceEnabled ? "Disable Voice" : "Enable Voice"}
        >
          {voiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Language Selection */}
      <div className="flex gap-2 mb-4">
        {[
          { code: "en-IN", label: "🇮🇳 English", flag: "🇮🇳" },
          { code: "hi-IN", label: "🇮🇳 हिंदी", flag: "🇮🇳" },
          { code: "en-US", label: "🇺🇸 English", flag: "🇺🇸" },
        ].map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              language === lang.code
                ? "bg-white/20 text-white border border-white/30"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {lang.flag} {lang.label.split(" ")[1]}
          </motion.button>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-center text-white/60 text-sm max-w-md">
        <p className="mb-2">🎤 Click the microphone to start voice chat</p>
        <p className="mb-2">🎭 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 will respond with voice</p>
        <p>🇮🇳 Supports English and Hindi</p>
      </div>

      {/* Voice Synthesizer */}
      <VoiceSynthesizer
        text={lastMessage}
        isActive={isSpeaking && voiceEnabled}
        onSpeakingChange={setIsSpeaking}
        language={language}
      />
    </div>
  )
}
