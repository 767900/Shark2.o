"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface VoiceSynthesizerProps {
  text: string
  isActive: boolean
  onSpeakingChange: (isSpeaking: boolean) => void
  language?: string
}

export default function VoiceSynthesizer({
  text,
  isActive,
  onSpeakingChange,
  language = "en-IN",
}: VoiceSynthesizerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  // Enhanced Indian actress voice settings
  const getOptimalVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null

    const voices = window.speechSynthesis.getVoices()
    console.log(
      "🎭 Available voices:",
      voices.map((v) => `${v.name} (${v.lang})`),
    )

    // Priority order for Indian actress-like voices
    const preferredVoices = [
      // Indian female voices (most preferred)
      "Raveena",
      "Aditi",
      "Priya",
      "Veena",
      "Kiran",
      "Shreya",
      "Kavya",
      // Indian English voices
      "en-IN",
      "hi-IN",
      // Generic female voices as fallback
      "female",
      "woman",
      "girl",
    ]

    for (const preferred of preferredVoices) {
      const voice = voices.find(
        (v) =>
          v.name.toLowerCase().includes(preferred.toLowerCase()) ||
          v.lang.toLowerCase().includes(preferred.toLowerCase()) ||
          (preferred === "female" && v.name.toLowerCase().includes("female")) ||
          (preferred === "woman" && v.name.toLowerCase().includes("woman")),
      )
      if (voice) {
        console.log("🎭 Selected actress voice:", voice.name, voice.lang)
        return voice
      }
    }

    // Fallback to any available female voice
    const femaleVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("woman") ||
        v.name.toLowerCase().includes("girl"),
    )

    if (femaleVoice) {
      console.log("🎭 Using fallback female voice:", femaleVoice.name)
      return femaleVoice
    }

    console.log("🎭 Using default voice")
    return voices[0] || null
  }

  const cleanTextForSpeech = (text: string): string => {
    return (
      text
        // Remove markdown formatting
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`(.*?)`/g, "$1")
        .replace(/#{1,6}\s/g, "")
        // Remove emojis but keep the text natural
        .replace(
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
          "",
        )
        // Keep Hindi/Hinglish terms natural
        .replace(/XyloGen/g, "Xylo Gen")
        .replace(/API/g, "A P I")
        .replace(/AI/g, "A I")
        // Clean up extra spaces
        .replace(/\s+/g, " ")
        .trim()
    )
  }

  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak.trim() || typeof window === "undefined" || !window.speechSynthesis) {
      console.log("🎭 Cannot speak: no text or speech synthesis unavailable")
      return
    }

    try {
      // Stop any current speech
      window.speechSynthesis.cancel()

      // Wait a bit for cancellation to complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      const cleanText = cleanTextForSpeech(textToSpeak)
      console.log("🎭 Speaking with actress voice:", cleanText.slice(0, 100) + "...")

      // Split into smaller chunks for better delivery
      const chunks = cleanText.match(/.{1,280}(?:\s|$)/g) || [cleanText]

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i].trim()
        if (!chunk) continue

        const utterance = new SpeechSynthesisUtterance(chunk)

        // Enhanced Indian actress voice settings
        const selectedVoice = getOptimalVoice()
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }

        // Actress-like voice characteristics
        utterance.rate = 0.75 + Math.random() * 0.05 // 0.75-0.8 for elegant delivery
        utterance.pitch = 1.4 + Math.random() * 0.1 // 1.4-1.5 for feminine pitch
        utterance.volume = 0.9

        // Set language based on content
        if (language.includes("hi") || /[\u0900-\u097F]/.test(chunk)) {
          utterance.lang = "hi-IN"
        } else {
          utterance.lang = "en-IN"
        }

        setCurrentUtterance(utterance)

        // Enhanced event handlers
        utterance.onstart = () => {
          console.log(`🎭 Started speaking chunk ${i + 1}/${chunks.length}`)
          setIsSpeaking(true)
          onSpeakingChange(true)
        }

        utterance.onend = () => {
          console.log(`🎭 Finished speaking chunk ${i + 1}/${chunks.length}`)
          if (i === chunks.length - 1) {
            setIsSpeaking(false)
            onSpeakingChange(false)
            setCurrentUtterance(null)
          }
        }

        utterance.onerror = (event) => {
          console.error("🎭 Speech error:", event.error)
          setIsSpeaking(false)
          onSpeakingChange(false)
          setCurrentUtterance(null)
        }

        // Speak the chunk
        window.speechSynthesis.speak(utterance)

        // Wait for this chunk to finish before starting the next
        if (i < chunks.length - 1) {
          await new Promise((resolve) => {
            utterance.onend = () => {
              setTimeout(resolve, 500) // Pause between chunks for dramatic effect
            }
          })
        }
      }
    } catch (error) {
      console.error("🎭 Error in actress voice synthesis:", error)
      setIsSpeaking(false)
      onSpeakingChange(false)
    }
  }

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      onSpeakingChange(false)
      setCurrentUtterance(null)
      console.log("🎭 Stopped actress voice")
    }
  }

  useEffect(() => {
    if (isActive && text.trim()) {
      speakText(text)
    } else if (!isActive) {
      stopSpeaking()
    }

    return () => {
      stopSpeaking()
    }
  }, [isActive, text])

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          console.log("🎭 Voices loaded for actress mode:", voices.length)
        }
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  if (!isActive) return null

  return (
    <motion.div
      className="fixed top-4 right-4 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          className="w-3 h-3 bg-white rounded-full"
          animate={{
            scale: isSpeaking ? [1, 1.2, 1] : 1,
            opacity: isSpeaking ? [1, 0.7, 1] : 0.5,
          }}
          transition={{
            duration: 0.8,
            repeat: isSpeaking ? Number.POSITIVE_INFINITY : 0,
          }}
        />
        <span className="text-sm font-medium">🎭 𝕏𝕪𝕝𝕠𝔾𝕖𝕟 Speaking</span>
        <button
          onClick={stopSpeaking}
          className="ml-2 text-white hover:text-pink-200 transition-colors"
          title="Stop Speaking"
        >
          ⏹️
        </button>
      </div>
    </motion.div>
  )
}
