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
  const speechQueue = useRef<string[]>([])
  const currentIndex = useRef(0)

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (utteranceRef.current) {
      utteranceRef.current = null
    }
    speechQueue.current = []
    currentIndex.current = 0
    isActiveRef.current = false
  }, [])

  const handleEnd = useCallback(() => {
    console.log("🔇 Enhanced speech completed successfully")
    cleanup()
    onEnd?.()
  }, [cleanup, onEnd])

  const handleError = useCallback(
    (event: SpeechSynthesisErrorEvent) => {
      console.log("⚠️ Enhanced speech event:", event.error)
      if (event.error === "interrupted" || event.error === "cancelled") {
        cleanup()
        onEnd?.()
        return
      }
      console.error("❌ Enhanced speech error:", event.error)
      cleanup()
      onEnd?.()
    },
    [cleanup, onEnd],
  )

  // Enhanced speech synthesis for technical content
  const speakEnhancedChunks = useCallback(
    (chunks: string[], index: number) => {
      if (index >= chunks.length || !isActiveRef.current) {
        handleEnd()
        return
      }

      const chunk = chunks[index]
      console.log(`🔊 Speaking enhanced chunk ${index + 1}/${chunks.length}:`, chunk.substring(0, 80) + "...")

      const utterance = new SpeechSynthesisUtterance(chunk)
      utteranceRef.current = utterance

      // Enhanced settings for technical content
      utterance.rate = 0.75 // Slower for technical terms
      utterance.pitch = 1.2 // Higher pitch for Indian girl voice
      utterance.volume = 1.0

      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices()

        // Enhanced voice selection for technical content
        const enhancedVoice =
          voices.find(
            (voice) =>
              voice.lang === "en-IN" &&
              (voice.name.toLowerCase().includes("female") ||
                voice.name.includes("Raveena") ||
                voice.name.includes("Aditi") ||
                voice.name.includes("Priya")),
          ) ||
          voices.find((voice) => voice.lang === "en-IN") ||
          voices.find((voice) => voice.lang === "hi-IN") ||
          voices.find(
            (voice) =>
              voice.lang.startsWith("en") &&
              (voice.name.toLowerCase().includes("female") ||
                voice.name.includes("Samantha") ||
                voice.name.includes("Victoria")),
          ) ||
          voices.find((voice) => voice.lang.startsWith("en"))

        if (enhancedVoice) {
          utterance.voice = enhancedVoice
          if (index === 0) {
            console.log("🎤 Enhanced technical voice selected:", enhancedVoice.name)
          }
        }

        utterance.onstart = () => {
          if (index === 0) {
            console.log("🔊 Enhanced technical speech started")
            onStart?.()
          }
          console.log(`▶️ Started enhanced chunk ${index + 1}`)
        }

        utterance.onend = () => {
          console.log(`✅ Finished enhanced chunk ${index + 1}`)
          utteranceRef.current = null
          // Longer pause between chunks for technical content
          setTimeout(() => {
            speakEnhancedChunks(chunks, index + 1)
          }, 600) // Increased pause for better comprehension
        }

        utterance.onerror = (event) => {
          console.error(`❌ Enhanced chunk ${index + 1} error:`, event.error)
          if (event.error !== "interrupted" && event.error !== "cancelled") {
            // Continue with next chunk on error
            setTimeout(() => {
              speakEnhancedChunks(chunks, index + 1)
            }, 800)
          } else {
            handleError(event)
          }
        }

        try {
          window.speechSynthesis.speak(utterance)
        } catch (error) {
          console.error(`❌ Failed to speak enhanced chunk ${index + 1}:`, error)
          setTimeout(() => {
            speakEnhancedChunks(chunks, index + 1)
          }, 800)
        }
      }

      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setVoiceAndSpeak()
      } else {
        let voicesLoaded = false
        window.speechSynthesis.onvoiceschanged = () => {
          if (!voicesLoaded) {
            voicesLoaded = true
            setVoiceAndSpeak()
          }
        }
        setTimeout(() => {
          if (!voicesLoaded) {
            voicesLoaded = true
            setVoiceAndSpeak()
          }
        }, 1500)
      }
    },
    [handleEnd, handleError, onStart],
  )

  useEffect(() => {
    cleanup()

    if (!text || !isEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return
    }

    // Enhanced text cleaning for technical content
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
      .replace(/\*(.*?)\*/g, "$1") // Remove markdown italic
      .replace(/#{1,6}\s/g, "") // Remove markdown headers
      .replace(/```[\s\S]*?```/g, "code block") // Replace code blocks
      .replace(/`([^`]+)`/g, "$1") // Remove inline code backticks
      .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1") // Remove markdown links
      // Enhanced emoji removal
      .replace(/🦈|🚀|🇮🇳|🧠|💬|📸|✅|❌|💥|🔊|🔇|🎯|🔄|💕|😊|❤️|💖|🥰|🤗|🌙|✨|🙏|🎤|💔|⏰|📝|🛑|•|⚡|🎭|📱|🌐|🎉/g, "")
      // Technical term pronunciation improvements
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
      .replace(/\n+/g, ". ") // Replace line breaks with periods
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/\.\s*\./g, ".") // Remove double periods
      .replace(/\s*,\s*/g, ", ") // Fix comma spacing
      .replace(/\s*!\s*/g, "! ") // Fix exclamation spacing
      .replace(/\s*\?\s*/g, "? ") // Fix question mark spacing
      .trim()

    if (!cleanText || cleanText.length < 3) {
      console.log("🔇 Enhanced text too short or empty for speech")
      return
    }

    // Enhanced chunking for technical content
    const maxLength = 300 // Smaller chunks for better technical pronunciation
    const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const chunks: string[] = []
    let currentChunk = ""

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (currentChunk.length + trimmedSentence.length + 2 <= maxLength) {
        currentChunk += (currentChunk ? ". " : "") + trimmedSentence
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + ".")
        }
        // If single sentence is too long, split by commas for technical content
        if (trimmedSentence.length > maxLength) {
          const subChunks = trimmedSentence.split(/,+/).filter((s) => s.trim().length > 0)
          for (const subChunk of subChunks) {
            if (subChunk.trim().length > 0) {
              chunks.push(subChunk.trim() + ".")
            }
          }
          currentChunk = ""
        } else {
          currentChunk = trimmedSentence
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + ".")
    }

    console.log("🔊 Preparing enhanced technical speech:", chunks.length, "chunks")
    console.log("📝 First chunk preview:", chunks[0]?.substring(0, 100) + "...")

    // Cancel any existing speech first
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }

    isActiveRef.current = true
    speechQueue.current = chunks
    currentIndex.current = 0

    // Enhanced delay for technical content initialization
    timeoutRef.current = setTimeout(() => {
      if (!isActiveRef.current) return

      try {
        speakEnhancedChunks(chunks, 0)
      } catch (error) {
        console.error("❌ Enhanced speech synthesis error:", error)
        handleEnd()
      }
    }, 600) // Increased delay for better technical speech preparation

    return cleanup
  }, [text, isEnabled, cleanup, handleEnd, handleError, onStart, speakEnhancedChunks])

  useEffect(() => {
    isActiveRef.current = isEnabled && !!text
    return () => {
      isActiveRef.current = false
    }
  }, [text, isEnabled])

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
