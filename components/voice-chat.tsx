"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceChatProps {
  onVoiceMessage: (transcript: string) => void
  isLoading: boolean
}

export default function VoiceChat({ onVoiceMessage, isLoading }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [status, setStatus] = useState("Click mic to start")
  const [permissionGranted, setPermissionGranted] = useState(false)

  // Initialize speech recognition
  useEffect(() => {
    const initRecognition = async () => {
      if (typeof window === "undefined") return

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        setStatus("Speech recognition not supported")
        return
      }

      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
        setPermissionGranted(true)

        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        recognitionInstance.onstart = () => {
          console.log("🎤 Voice recognition started")
          setIsListening(true)
          setStatus("Listening... speak now!")
          setTranscript("")
        }

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          // Show interim results
          if (interimTranscript) {
            setTranscript(interimTranscript)
            setStatus("Listening... (hearing: " + interimTranscript + ")")
          }

          // Process final result
          if (finalTranscript.trim()) {
            console.log("🎯 Final transcript:", finalTranscript)
            setTranscript(finalTranscript)
            setStatus("Processing your message...")
            setIsListening(false)

            // Send to AI for response
            onVoiceMessage(finalTranscript.trim())
          }
        }

        recognitionInstance.onend = () => {
          console.log("🛑 Voice recognition ended")
          setIsListening(false)
          if (!transcript) {
            setStatus("No speech detected. Try again!")
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("❌ Voice recognition error:", event.error)
          setIsListening(false)
          setStatus("Error: " + event.error + ". Try again!")
        }

        setRecognition(recognitionInstance)
        setIsSupported(true)
        setStatus("Ready! Click mic to start talking")
      } catch (error) {
        console.error("❌ Failed to initialize:", error)
        setPermissionGranted(false)
        setStatus("Microphone permission denied")
      }
    }

    initRecognition()
  }, [onVoiceMessage, transcript])

  const startListening = () => {
    if (!recognition || isListening || !permissionGranted || isLoading) {
      console.log("❌ Cannot start - missing requirements")
      return
    }

    try {
      console.log("🎯 Starting voice recognition...")
      setStatus("Starting...")
      recognition.start()
    } catch (error) {
      console.error("❌ Error starting recognition:", error)
      setStatus("Error starting recognition")
    }
  }

  const stopListening = () => {
    if (!recognition || !isListening) return

    try {
      console.log("🛑 Stopping voice recognition...")
      recognition.stop()
    } catch (error) {
      console.error("❌ Error stopping recognition:", error)
    }
  }

  const speakResponse = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return

    // Cancel any existing speech
    window.speechSynthesis.cancel()

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => {
        console.log("🔊 Started speaking")
        setIsSpeaking(true)
        setStatus("Shark2.0 is speaking...")
      }

      utterance.onend = () => {
        console.log("🔇 Finished speaking")
        setIsSpeaking(false)
        setStatus("Ready! Click mic to talk again")
        setTranscript("")
      }

      utterance.onerror = () => {
        console.log("❌ Speech error")
        setIsSpeaking(false)
        setStatus("Speech error occurred")
      }

      window.speechSynthesis.speak(utterance)
    }, 100)
  }

  const stopSpeaking = () => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setStatus("Speech stopped")
    }
  }

  // Auto-speak AI responses
  useEffect(() => {
    if (!isLoading && !isListening && !isSpeaking) {
      // Check if there's a new AI message to speak
      // This will be triggered by the parent component
    }
  }, [isLoading, isListening, isSpeaking])

  if (!isSupported) {
    return (
      <div className="text-center text-red-400 p-8">
        <h3 className="text-xl mb-4">❌ Voice Chat Not Supported</h3>
        <p>Please use Chrome, Edge, or Safari for voice features.</p>
      </div>
    )
  }

  if (!permissionGranted) {
    return (
      <div className="text-center text-yellow-400 p-8">
        <h3 className="text-xl mb-4">🎤 Microphone Access Required</h3>
        <p className="mb-4">Please allow microphone access to use voice chat.</p>
        <Button onClick={() => window.location.reload()} className="bg-cyan-600 hover:bg-cyan-700">
          Refresh & Grant Permission
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      {/* Voice Visualizer */}
      <div className="flex items-center justify-center h-24 gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 rounded-full ${isListening ? "bg-red-400" : isSpeaking ? "bg-green-400" : "bg-blue-400"}`}
            animate={{
              height: isListening || isSpeaking ? [8, Math.random() * 60 + 20, 8] : 8,
            }}
            transition={{
              duration: 0.5,
              repeat: isListening || isSpeaking ? Number.POSITIVE_INFINITY : 0,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-6">
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={isLoading || isSpeaking}
          size="lg"
          className={`rounded-full w-20 h-20 text-2xl ${
            isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
        </Button>

        <Button
          onClick={isSpeaking ? stopSpeaking : undefined}
          disabled={!isSpeaking}
          size="lg"
          className={`rounded-full w-20 h-20 text-2xl ${
            isSpeaking ? "bg-green-600 hover:bg-green-700 animate-pulse" : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {isSpeaking ? <VolumeX className="w-10 h-10" /> : <Volume2 className="w-10 h-10" />}
        </Button>
      </div>

      {/* Status Display */}
      <div className="text-center max-w-md">
        <div
          className={`p-4 rounded-lg ${
            isListening
              ? "bg-red-900/30 text-red-400"
              : isSpeaking
                ? "bg-green-900/30 text-green-400"
                : isLoading
                  ? "bg-yellow-900/30 text-yellow-400"
                  : "bg-cyan-900/30 text-cyan-400"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isListening
                  ? "bg-red-400 animate-pulse"
                  : isSpeaking
                    ? "bg-green-400 animate-pulse"
                    : isLoading
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-cyan-400"
              }`}
            ></div>
            <span className="font-medium text-lg">{status}</span>
          </div>

          {transcript && (
            <div className="text-sm bg-black/30 p-3 rounded mt-3">
              <strong>You said:</strong> "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-400 max-w-lg">
        <div className="bg-black/30 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-cyan-400">How to use Voice Chat:</h4>
          <ol className="text-left space-y-1">
            <li>1. 🎤 Click the blue microphone button</li>
            <li>2. 🗣️ Speak clearly when you see "Listening..."</li>
            <li>3. ⏳ Wait for Shark2.0 to process your message</li>
            <li>4. 🔊 Listen to the AI response</li>
            <li>5. 🔄 Click mic again to continue conversation</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
