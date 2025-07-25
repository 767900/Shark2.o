"use client"

import { useState, useRef, useEffect } from "react"
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
  const [volume, setVolume] = useState(0)
  const animationRef = useRef<number>()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

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

          setTranscript(interimTranscript || finalTranscript)

          if (finalTranscript) {
            onVoiceMessage(finalTranscript)
            setTranscript("")
          }
        }

        recognitionInstance.onstart = () => {
          setIsListening(true)
          startVolumeAnimation()
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
          stopVolumeAnimation()
          setVolume(0)
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
          stopVolumeAnimation()
        }

        setRecognition(recognitionInstance)
        setIsSupported(true)
      }
    }
  }, [onVoiceMessage])

  // Volume animation for visual feedback
  const startVolumeAnimation = () => {
    const animate = () => {
      setVolume(Math.random() * 100)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  const stopVolumeAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const toggleListening = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
    } else {
      try {
        recognition.start()
      } catch (error) {
        console.error("Error starting recognition:", error)
      }
    }
  }

  const speakResponse = (text: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return

    // Cancel any existing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 100)
  }

  const stopSpeaking = () => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="text-center text-gray-400 p-4">
        <p>Voice chat not supported in this browser</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Voice Visualizer */}
      <div className="flex items-center justify-center h-20 gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-blue-400 w-1 rounded-full"
            animate={{
              height: isListening ? [4, Math.random() * 40 + 10, 4] : 4,
            }}
            transition={{
              duration: 0.5,
              repeat: isListening ? Number.POSITIVE_INFINITY : 0,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleListening}
          disabled={isLoading}
          size="lg"
          className={`rounded-full w-16 h-16 ${
            isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </Button>

        <Button
          onClick={isSpeaking ? stopSpeaking : undefined}
          disabled={!isSpeaking}
          size="lg"
          className={`rounded-full w-16 h-16 ${
            isSpeaking ? "bg-green-600 hover:bg-green-700 animate-pulse" : "bg-gray-600"
          }`}
        >
          {isSpeaking ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
        </Button>
      </div>

      {/* Status */}
      <div className="text-center">
        <p className={`text-sm font-medium ${isListening ? "text-red-400" : "text-gray-400"}`}>
          {isListening ? "Listening..." : "Click mic to start voice chat"}
        </p>
        {transcript && <p className="text-xs text-blue-400 mt-2 max-w-md">"{transcript}"</p>}
      </div>
    </div>
  )
}
