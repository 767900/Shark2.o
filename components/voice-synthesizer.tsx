"use client"

import { useEffect, useRef, useCallback } from "react"

interface VoiceSynthesizerProps {
  text: string
  isEnabled: boolean
  onStart?: () => void
  onEnd?: () => void
}

export default function VoiceSynthesizer({ text, isEnabled, onStart, onEnd }: VoiceSynthesizerProps) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(false)

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (utteranceRef.current) {
      utteranceRef.current = null
    }
    isActiveRef.current = false
  }, [])

  const handleEnd = useCallback(() => {
    console.log("🔇 Speech completed successfully")
    cleanup()
    onEnd?.()
  }, [cleanup, onEnd])

  const handleError = useCallback(
    (event: SpeechSynthesisErrorEvent) => {
      console.log("⚠️ Speech event:", event.error)
      // Don't treat interruption/cancellation as errors - they're normal
      if (event.error === "interrupted" || event.error === "cancelled") {
        cleanup()
        onEnd?.()
        return
      }
      console.error("❌ Speech error:", event.error)
      cleanup()
      onEnd?.()
    },
    [cleanup, onEnd],
  )

  useEffect(() => {
    // Cleanup previous speech
    cleanup()

    if (!text || !isEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return
    }

    // Enhanced text cleaning for better speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
      .replace(/\*(.*?)\*/g, "$1") // Remove markdown italic
      .replace(/#{1,6}\s/g, "") // Remove markdown headers
      .replace(/```[\s\S]*?```/g, "code block") // Replace code blocks
      .replace(/`([^`]+)`/g, "$1") // Remove inline code backticks
      .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1") // Remove markdown links
      .replace(/🦈|🚀|🇮🇳|🧠|💬|📸|✅|❌|💥|🔊|🔇|🎯|🔄|💕|😊|❤️|💖|🥰|🤗|🌙|✨|🙏|🎤|💔|⏰|📝|🛑|•/g, "") // Remove emojis and bullets
      .replace(/\n+/g, ". ") // Replace line breaks with periods
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\.\s*\./g, ".") // Remove double periods
      .replace(/\s*,\s*/g, ", ") // Fix comma spacing
      .replace(/\s*!\s*/g, "! ") // Fix exclamation spacing
      .replace(/\s*\?\s*/g, "? ") // Fix question mark spacing
      .trim()

    if (!cleanText || cleanText.length < 3) {
      console.log("🔇 Text too short or empty for speech")
      return
    }

    // Limit text length to prevent very long speeches
    const maxLength = 800
    const textToSpeak = cleanText.length > maxLength ? cleanText.substring(0, maxLength) + "..." : cleanText

    console.log("🔊 Preparing enhanced speech:", textToSpeak.substring(0, 100) + "...")

    // Cancel any existing speech first
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    // Set active state
    isActiveRef.current = true

    // Enhanced delay for proper speech synthesis initialization
    timeoutRef.current = setTimeout(() => {
      if (!isActiveRef.current) return

      try {
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utteranceRef.current = utterance

        // Optimized voice settings for clarity
        utterance.rate = 0.9 // Slightly slower for clarity
        utterance.pitch = 1.2 // Higher pitch for Indian girl voice
        utterance.volume = 1.0 // Full volume for clarity

        // Enhanced voice selection
        const setVoiceAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices()

          // Priority selection for Indian girl voice
          const indianVoice =
            voices.find(
              (voice) =>
                voice.lang === "en-IN" &&
                (voice.name.toLowerCase().includes("female") ||
                  voice.name.includes("Raveena") ||
                  voice.name.includes("Aditi") ||
                  voice.name.includes("Priya") ||
                  voice.name.includes("Kavya") ||
                  voice.name.includes("Shreya")),
            ) ||
            voices.find((voice) => voice.lang === "en-IN") ||
            voices.find((voice) => voice.name.includes("Google") && voice.lang === "en-IN") ||
            voices.find(
              (voice) =>
                voice.lang.startsWith("en") &&
                (voice.name.toLowerCase().includes("female") ||
                  voice.name.includes("Samantha") ||
                  voice.name.includes("Victoria") ||
                  voice.name.includes("Susan")),
            ) ||
            voices.find((voice) => voice.lang.startsWith("en"))

          if (indianVoice) {
            utterance.voice = indianVoice
            console.log("🎤 Enhanced voice selected:", indianVoice.name)
          }

          utterance.onstart = () => {
            console.log("🔊 Enhanced speech started")
            onStart?.()
          }

          utterance.onend = handleEnd
          utterance.onerror = handleError

          // Speak with error handling
          if (isActiveRef.current && utteranceRef.current) {
            window.speechSynthesis.speak(utterance)
          }
        }

        // Check if voices are loaded
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          setVoiceAndSpeak()
        } else {
          // Wait for voices to load with timeout
          let voicesLoaded = false
          window.speechSynthesis.onvoiceschanged = () => {
            if (!voicesLoaded) {
              voicesLoaded = true
              setVoiceAndSpeak()
            }
          }

          // Fallback timeout
          setTimeout(() => {
            if (!voicesLoaded) {
              voicesLoaded = true
              setVoiceAndSpeak()
            }
          }, 1000)
        }
      } catch (error) {
        console.error("❌ Enhanced speech synthesis error:", error)
        handleEnd()
      }
    }, 400) // Increased delay for better initialization

    return cleanup
  }, [text, isEnabled, onStart, handleEnd, handleError, cleanup])

  // Set active state
  useEffect(() => {
    isActiveRef.current = isEnabled && !!text
    return () => {
      isActiveRef.current = false
    }
  }, [text, isEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      cleanup()
    }
  }, [cleanup])

  return null
}
