"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"

interface VoiceActivationProps {
  onWakeWord: () => void
  onVoiceInput: (transcript: string) => void
  isAwake: boolean
  setIsListening: (listening: boolean) => void
}

export default function VoiceActivation({ onWakeWord, onVoiceInput, isAwake, setIsListening }: VoiceActivationProps) {
  const [recognition, setRecognition] = useState<any>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListeningState] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [status, setStatus] = useState("initializing")

  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    const initRecognition = async () => {
      if (typeof window === "undefined") return

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        setStatus("not-supported")
        return
      }

      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop()) // Stop the stream, we just needed permission
        setPermissionGranted(true)
        setStatus("permission-granted")

        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false // Only final results
        recognitionInstance.lang = "en-US"

        recognitionRef.current = recognitionInstance
        setRecognition(recognitionInstance)
        setIsSupported(true)
        setStatus("ready")

        console.log("✅ Speech recognition initialized successfully")
      } catch (error) {
        console.error("❌ Failed to initialize speech recognition:", error)
        setPermissionGranted(false)
        setStatus("permission-denied")
      }
    }

    initRecognition()
  }, [])

  // Set up event listeners
  useEffect(() => {
    if (!recognition) return

    const handleResult = (event: any) => {
      const results = event.results
      const lastResult = results[results.length - 1]
      const transcript = lastResult[0].transcript.toLowerCase().trim()

      console.log("🎤 Final transcript:", transcript)
      setTranscript(transcript)

      // Check for wake word
      if (!isAwake && (transcript.includes("jervis") || transcript.includes("jarvis"))) {
        console.log("🚀 WAKE WORD DETECTED!")
        onWakeWord()
        setIsListening(true)
      } else if (isAwake && transcript) {
        console.log("⚡ PROCESSING COMMAND:", transcript)
        onVoiceInput(transcript)
        setIsListening(false)
      }
    }

    const handleStart = () => {
      console.log("🎙️ Recognition started")
      setIsListeningState(true)
      setIsListening(true)
      setStatus("listening")
      setTranscript("")
    }

    const handleEnd = () => {
      console.log("🛑 Recognition ended")
      setIsListeningState(false)
      setIsListening(false)
      setStatus("ready")
    }

    const handleError = (event: any) => {
      console.log("⚠️ Recognition error:", event.error)
      setIsListeningState(false)
      setIsListening(false)
      setStatus("error")
    }

    recognition.addEventListener("result", handleResult)
    recognition.addEventListener("start", handleStart)
    recognition.addEventListener("end", handleEnd)
    recognition.addEventListener("error", handleError)

    return () => {
      recognition.removeEventListener("result", handleResult)
      recognition.removeEventListener("start", handleStart)
      recognition.removeEventListener("end", handleEnd)
      recognition.removeEventListener("error", handleError)
    }
  }, [recognition, isAwake, onWakeWord, onVoiceInput, setIsListening])

  const startListening = () => {
    if (!recognitionRef.current || isListening || !permissionGranted) {
      console.log("❌ Cannot start - missing requirements")
      return
    }

    try {
      console.log("🎯 Starting speech recognition...")
      recognitionRef.current.start()
    } catch (error) {
      console.error("❌ Error starting recognition:", error)
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return

    try {
      console.log("🛑 Stopping speech recognition...")
      recognitionRef.current.stop()
    } catch (error) {
      console.error("❌ Error stopping recognition:", error)
    }
  }

  if (!isSupported) {
    return (
      <div className="text-center text-red-400 p-4">
        <p>❌ Speech recognition is not supported in this browser.</p>
        <p className="text-sm mt-2">Please use Chrome, Edge, or Safari for voice features.</p>
      </div>
    )
  }

  if (!permissionGranted) {
    return (
      <div className="text-center text-yellow-400 p-4">
        <p>🎤 Microphone permission required</p>
        <p className="text-sm mt-2">Please allow microphone access to use voice features.</p>
        <Button onClick={() => window.location.reload()} className="mt-2 bg-cyan-600 hover:bg-cyan-700">
          Refresh Page
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center mt-6 space-y-4">
      {/* Test Button */}
      <div className="mb-4">
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={!permissionGranted}
          size="lg"
          className={`${
            isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-cyan-600 hover:bg-cyan-700"
          } transition-all duration-200`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              {isAwake ? "Speak Command" : "Click to Listen"}
            </>
          )}
        </Button>
      </div>

      {/* Status Display */}
      <div className="text-sm">
        <div
          className={`p-3 rounded-lg ${
            status === "listening"
              ? "bg-green-900/30 text-green-400"
              : status === "error"
                ? "bg-red-900/30 text-red-400"
                : "bg-cyan-900/30 text-cyan-400"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></div>
            <span className="font-medium">
              {status === "listening"
                ? "🎤 LISTENING..."
                : status === "ready"
                  ? "✅ READY"
                  : status === "error"
                    ? "❌ ERROR"
                    : "🔄 INITIALIZING"}
            </span>
          </div>

          {transcript && (
            <div className="text-xs bg-black/30 p-2 rounded mt-2">
              <strong>Heard:</strong> "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-cyan-400/60 space-y-1 bg-black/30 p-3 rounded">
        <p>
          <strong>TEST STEPS:</strong>
        </p>
        <p>1. Click "Click to Listen" button</p>
        <p>2. Say "Jervis" clearly</p>
        <p>3. Wait for response</p>
        <p>4. If activated, speak your command</p>
        <p className="text-yellow-400 mt-2">Check browser console (F12) for detailed logs!</p>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-gray-400 bg-black/50 p-2 rounded">
        <p>Status: {status}</p>
        <p>Listening: {isListening ? "Yes" : "No"}</p>
        <p>Awake: {isAwake ? "Yes" : "No"}</p>
        <p>Permission: {permissionGranted ? "Granted" : "Denied"}</p>
      </div>
    </div>
  )
}
