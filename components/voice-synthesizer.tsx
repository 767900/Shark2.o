"use client"

import { useEffect } from "react"

interface VoiceSynthesizerProps {
  text: string
  isEnabled: boolean
  onStart?: () => void
  onEnd?: () => void
}

export default function VoiceSynthesizer({ text, isEnabled, onStart, onEnd }: VoiceSynthesizerProps) {
  useEffect(() => {
    if (!text || !isEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return
    }

    // Simple speech function
    const speak = () => {
      try {
        // Cancel any existing speech
        window.speechSynthesis.cancel()

        // Wait a moment for cancel to complete
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text)

          // Simple configuration
          utterance.rate = 1
          utterance.pitch = 1
          utterance.volume = 1

          // Simple event handlers
          utterance.onstart = () => {
            console.log("Speech started")
            onStart?.()
          }

          utterance.onend = () => {
            console.log("Speech ended")
            onEnd?.()
          }

          // Minimal error handling - just log and end
          utterance.onerror = () => {
            console.log("Speech error occurred - ending speech")
            onEnd?.()
          }

          // Speak
          window.speechSynthesis.speak(utterance)
        }, 100)
      } catch (error) {
        console.log("Speech synthesis not available")
        onEnd?.()
      }
    }

    speak()

    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [text, isEnabled, onStart, onEnd])

  return null
}
