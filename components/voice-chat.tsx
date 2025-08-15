"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, ArrowLeft } from "lucide-react"

interface VoiceChatProps {
  onBack: () => void
}

export default function VoiceChat({ onBack }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [error, setError] = useState("")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [detectedLanguage, setDetectedLanguage] = useState("hinglish")
  const [listeningTimeout, setListeningTimeout] = useState<NodeJS.Timeout | null>(null)

  const recognitionRef = useRef<any>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isRecognitionActive = useRef(false)

  // Initialize speech recognition with multi-language support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()

        // Enhanced recognition settings for multi-language support
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "hi-IN" // Start with Hindi-India for better Hindi recognition
        recognition.maxAlternatives = 5 // More alternatives for better accuracy

        recognition.onstart = () => {
          console.log("🎤 Multi-language voice recognition started")
          setIsListening(true)
          setError("")
          setTranscript("")
          setInterimTranscript("")
          isRecognitionActive.current = true

          const timeout = setTimeout(() => {
            if (isRecognitionActive.current && recognitionRef.current) {
              console.log("⏰ Auto-stopping recognition after 15 seconds")
              recognition.stop()
            }
          }, 15000)
          setListeningTimeout(timeout)
        }

        recognition.onresult = (event: any) => {
          let finalTranscript = ""
          let interim = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0].transcript

            if (result.isFinal) {
              finalTranscript += transcript + " "
              console.log("✅ Final result:", transcript)
            } else {
              interim += transcript
              console.log("⏳ Interim result:", transcript)
            }
          }

          if (interim) {
            setInterimTranscript(interim)
          }

          if (finalTranscript.trim()) {
            const fullTranscript = finalTranscript.trim()
            setTranscript(fullTranscript)
            setInterimTranscript("")

            // Detect language of the transcript
            const language = detectLanguageClient(fullTranscript)
            setDetectedLanguage(language)
            console.log("🔍 Client detected language:", language)

            if (listeningTimeout) {
              clearTimeout(listeningTimeout)
              setListeningTimeout(null)
            }

            setTimeout(() => {
              if (recognitionRef.current && isRecognitionActive.current) {
                recognition.stop()
                handleVoiceInput(fullTranscript)
              }
            }, 500)
          }
        }

        recognition.onerror = (event: any) => {
          console.error("❌ Speech recognition error:", event.error)
          setIsListening(false)
          isRecognitionActive.current = false

          if (listeningTimeout) {
            clearTimeout(listeningTimeout)
            setListeningTimeout(null)
          }

          switch (event.error) {
            case "no-speech":
              setError("कुछ नहीं सुना! Please speak louder and try again")
              break
            case "audio-capture":
              setError("Microphone access problem! Please check permissions")
              break
            case "not-allowed":
              setError("Microphone permission denied! Please allow access")
              break
            case "network":
              setError("Network error! Please check your connection")
              break
            case "aborted":
              setError("Recognition was stopped")
              break
            default:
              setError(`Recognition error: ${event.error}. Please try again!`)
          }
        }

        recognition.onend = () => {
          console.log("🛑 Voice recognition ended")
          setIsListening(false)
          isRecognitionActive.current = false

          if (listeningTimeout) {
            clearTimeout(listeningTimeout)
            setListeningTimeout(null)
          }

          if (!transcript && interimTranscript.trim()) {
            console.log("📝 Using interim transcript:", interimTranscript)
            const language = detectLanguageClient(interimTranscript)
            setDetectedLanguage(language)
            setTranscript(interimTranscript)
            handleVoiceInput(interimTranscript.trim())
          }
        }

        recognitionRef.current = recognition
      } else {
        setError("Speech recognition not supported in this browser")
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (listeningTimeout) {
        clearTimeout(listeningTimeout)
      }
    }
  }, [transcript, interimTranscript, listeningTimeout])

  // Client-side language detection
  const detectLanguageClient = (text: string): string => {
    const hasDevanagari = /[\u0900-\u097F]/.test(text)
    const hindiWords = ["है", "हैं", "का", "की", "के", "में", "से", "को", "नहीं", "क्या", "कैसे", "कहाँ", "कब", "क्यों"]
    const hinglishWords = ["yaar", "bhai", "na", "hai na", "kya", "kaise", "theek", "accha"]
    const englishWords = ["the", "is", "are", "and", "or", "but", "what", "how", "where", "when", "why"]

    let hindiCount = 0
    let hinglishCount = 0
    let englishCount = 0

    if (hasDevanagari) hindiCount += 5

    const textLower = text.toLowerCase()
    hindiWords.forEach((word) => {
      if (textLower.includes(word)) hindiCount++
    })
    hinglishWords.forEach((word) => {
      if (textLower.includes(word)) hinglishCount++
    })
    englishWords.forEach((word) => {
      if (new RegExp(`\\b${word}\\b`).test(textLower)) englishCount++
    })

    if (hasDevanagari || hindiCount > englishCount + hinglishCount) {
      return "hindi"
    } else if (hinglishCount > 0 && (hindiCount > 0 || englishCount > 0)) {
      return "hinglish"
    } else if (englishCount > hindiCount) {
      return "english"
    } else {
      return "hinglish"
    }
  }

  const handleVoiceInput = async (text: string) => {
    if (!text.trim() || text.length < 2) {
      setError("Message too short! Please speak more clearly")
      return
    }

    console.log("🎯 Processing voice input:", text)
    console.log("🔍 Detected language:", detectedLanguage)
    setIsProcessing(true)
    setTranscript("")
    setInterimTranscript("")

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      const fullResponse = data.content || ""
      setResponse(fullResponse)
      console.log("💬 AI Response length:", fullResponse.length, "characters")
      console.log("💬 AI Response language:", data.language || "unknown")
      console.log("💬 AI Response preview:", fullResponse.substring(0, 100) + "...")

      if (voiceEnabled && fullResponse) {
        setTimeout(() => {
          speakCompleteResponse(fullResponse, data.language || detectedLanguage)
        }, 500)
      }
    } catch (error) {
      setError("Failed to process voice input. Please try again!")
      console.error("Voice processing error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const speakCompleteResponse = (text: string, language = "hinglish") => {
    if (!voiceEnabled || !text) return

    console.log("🔊 Starting speech synthesis in", language)
    console.log("📝 Full text length:", text.length, "characters")

    window.speechSynthesis.cancel()

    setTimeout(() => {
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s/g, "")
        .replace(/```[\s\S]*?```/g, "code block")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]$$[^)]+$$/g, "$1")
        .replace(/🦈|🚀|🧠|💬|📸|✅|❌|💥|🔊|🔇|🎯|🔄|💕|😊|❤️|💖|🥰|🤗|🌙|✨|🙏|🎤|💔|⏰|📝|🛑|🔥/g, "")
        .replace(/\n+/g, ". ")
        .replace(/\s+/g, " ")
        .replace(/\.\s*\./g, ".")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s*!\s*/g, "! ")
        .replace(/\s*\?\s*/g, "? ")
        .trim()

      if (!cleanText || cleanText.length < 5) {
        console.log("🔇 Text too short for speech")
        return
      }

      console.log("🎯 Clean text length:", cleanText.length, "characters")

      const maxChunkLength = 400
      const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0)
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

      console.log("📚 Split into", chunks.length, "chunks for", language, "speech")
      speakChunksSequentially(chunks, 0, language)
    }, 200)
  }

  const speakChunksSequentially = (chunks: string[], index: number, language = "hinglish") => {
    if (index >= chunks.length || !voiceEnabled) {
      console.log("🔇 Finished speaking all chunks")
      setIsSpeaking(false)
      return
    }

    const chunk = chunks[index]
    console.log(`🔊 Speaking chunk ${index + 1}/${chunks.length} in ${language}:`, chunk.substring(0, 100) + "...")

    const utterance = new SpeechSynthesisUtterance(chunk)
    utteranceRef.current = utterance

    // Language-specific voice settings
    if (language === "hindi") {
      utterance.rate = 0.8 // Slower for Hindi clarity
      utterance.pitch = 1.3 // Higher pitch for Indian girl
      utterance.volume = 1.0
    } else if (language === "english") {
      utterance.rate = 0.9 // Normal speed for English
      utterance.pitch = 1.25
      utterance.volume = 1.0
    } else {
      // hinglish
      utterance.rate = 0.85 // Balanced speed for mixed language
      utterance.pitch = 1.25
      utterance.volume = 1.0
    }

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices()

      let selectedVoice
      if (language === "hindi") {
        // Prioritize Hindi voices
        selectedVoice =
          voices.find((voice) => voice.lang === "hi-IN" && voice.name.toLowerCase().includes("female")) ||
          voices.find((voice) => voice.lang === "hi-IN") ||
          voices.find((voice) => voice.lang.startsWith("hi")) ||
          voices.find((voice) => voice.lang === "en-IN")
      } else if (language === "english") {
        // Prioritize English voices with Indian accent
        selectedVoice =
          voices.find((voice) => voice.lang === "en-IN" && voice.name.toLowerCase().includes("female")) ||
          voices.find((voice) => voice.lang === "en-IN") ||
          voices.find((voice) => voice.lang.startsWith("en") && voice.name.toLowerCase().includes("female"))
      } else {
        // Hinglish - prefer Indian English
        selectedVoice =
          voices.find((voice) => voice.lang === "en-IN" && voice.name.toLowerCase().includes("female")) ||
          voices.find((voice) => voice.lang === "en-IN") ||
          voices.find((voice) => voice.lang === "hi-IN") ||
          voices.find((voice) => voice.lang.startsWith("en") && voice.name.toLowerCase().includes("female"))
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
        if (index === 0) {
          console.log(`🇮🇳 Selected ${language} voice:`, selectedVoice.name, selectedVoice.lang)
        }
      }

      utterance.onstart = () => {
        if (index === 0) {
          console.log(`🔊 Started speaking complete ${language} response`)
          setIsSpeaking(true)
        }
        console.log(`▶️ Started ${language} chunk ${index + 1}`)
      }

      utterance.onend = () => {
        console.log(`✅ Finished ${language} chunk ${index + 1}`)
        utteranceRef.current = null
        setTimeout(() => {
          speakChunksSequentially(chunks, index + 1, language)
        }, 300)
      }

      utterance.onerror = (event) => {
        console.error(`❌ Speech error in ${language} chunk ${index + 1}:`, event.error)
        if (event.error !== "interrupted" && event.error !== "cancelled") {
          setError(`Speech error in chunk ${index + 1}. Continuing...`)
        }
        setTimeout(() => {
          speakChunksSequentially(chunks, index + 1, language)
        }, 500)
      }

      try {
        window.speechSynthesis.speak(utterance)
        console.log(`🎯 Started speaking ${language} chunk ${index + 1}`)
      } catch (error) {
        console.error(`❌ Failed to start ${language} speech for chunk ${index + 1}:`, error)
        setTimeout(() => {
          speakChunksSequentially(chunks, index + 1, language)
        }, 500)
      }
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      setVoiceAndSpeak()
    } else {
      console.log("⏳ Waiting for voices to load...")
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
      }, 1000)
    }
  }

  const startListening = () => {
    if (!recognitionRef.current || isListening || isProcessing) {
      console.log("❌ Cannot start listening - conditions not met")
      return
    }

    console.log("🎯 Starting multi-language voice recognition...")
    setError("")
    setTranscript("")
    setInterimTranscript("")

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error("❌ Failed to start recognition:", error)
      setError("Failed to start voice recognition. Please try again!")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log("🛑 Stopping voice recognition...")
      isRecognitionActive.current = false
      recognitionRef.current.stop()

      if (listeningTimeout) {
        clearTimeout(listeningTimeout)
        setListeningTimeout(null)
      }
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (voiceEnabled && isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    console.log("🛑 Stopping all speech...")
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    if (utteranceRef.current) {
      utteranceRef.current = null
    }
  }

  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case "hindi":
        return "हिंदी"
      case "english":
        return "English"
      case "hinglish":
        return "Hinglish"
      default:
        return "Mixed"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">🇮🇳 Voice Chat</h1>
          <p className="text-xs text-orange-200">Language: {getLanguageDisplay(detectedLanguage)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={toggleVoice} className="text-white hover:bg-white/10">
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {/* Avatar */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center text-6xl animate-pulse">
            🇮🇳
          </div>
          {(isListening || isSpeaking) && (
            <div className="absolute inset-0 rounded-full border-4 border-orange-400 animate-ping"></div>
          )}
        </div>

        {/* Status */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {isListening
              ? "Main sun rahi hun... 🎤"
              : isProcessing
                ? "Soch rahi hun... 🤔"
                : isSpeaking
                  ? `${getLanguageDisplay(detectedLanguage)} mein jawab de rahi hun... 💬`
                  : "Namaste! Ready to chat! 🙏"}
          </h2>
          <p className="text-orange-200">
            {isListening
              ? "Hindi, English, ya Hinglish mein boliye!"
              : isProcessing
                ? "Aapka message samajh rahi hun..."
                : isSpeaking
                  ? "Complete answer sun rahi hun, wait kariye..."
                  : "Mic button dabayiye aur apni language mein boliye"}
          </p>
        </div>

        {/* Real-time Transcript */}
        {(transcript || interimTranscript) && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md w-full">
            <p className="text-white text-center">
              <span className="font-semibold">{transcript}</span>
              <span className="text-gray-300 italic">{interimTranscript}</span>
            </p>
            <p className="text-xs text-orange-300 text-center mt-2">Detected: {getLanguageDisplay(detectedLanguage)}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-4 max-w-lg w-full max-h-40 overflow-y-auto">
            <p className="text-white text-sm font-medium leading-relaxed">{response}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 max-w-md w-full">
            <p className="text-red-200 text-center text-sm">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex space-x-4">
          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-16 h-16 rounded-full ${
              isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-orange-500 hover:bg-orange-600"
            } text-white shadow-lg transition-all duration-200`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          {isSpeaking && (
            <Button
              size="lg"
              onClick={stopSpeaking}
              className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg animate-pulse"
            >
              <VolumeX className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Enhanced Instructions */}
        <div className="text-center text-orange-200 text-sm max-w-md space-y-2">
          <p className="font-semibold">🇮🇳 Main aapki language mein jawab deti hun!</p>
          <p>• हिंदी में पूछें → हिंदी में जवाब</p>
          <p>• Ask in English → Reply in English</p>
          <p>• Hinglish mein baat kariye → Hinglish mein reply</p>
          <p>• Complete answer suniye, beech mein mat rokiye! 😊</p>
        </div>
      </div>
    </div>
  )
}
