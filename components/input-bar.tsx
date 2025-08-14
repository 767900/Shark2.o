"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Mic, MicOff, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import ImageUpload from "@/components/image-upload"

interface InputBarProps {
  inputText: string
  setInputText: (text: string) => void
  onSendMessage: (message: string, isVoice?: boolean, image?: File) => void
  isLoading: boolean
  voiceEnabled: boolean
}

export default function InputBar({ inputText, setInputText, onSendMessage, isLoading, voiceEnabled }: InputBarProps) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = "en-US"

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputText(transcript)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        recognitionInstance.onerror = (event: any) => {
          console.log("⚠️ Voice input error:", event.error)
          setIsListening(false)

          // Handle different error types gracefully
          switch (event.error) {
            case "no-speech":
              // Don't show error for no-speech, just stop listening
              break
            case "audio-capture":
              console.error("Microphone not accessible")
              break
            case "not-allowed":
              console.error("Microphone permission denied")
              break
            case "network":
              console.error("Network error during voice recognition")
              break
            default:
              console.error("Voice recognition error:", event.error)
          }
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [setInputText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((inputText.trim() || selectedImage) && !isLoading) {
      onSendMessage(inputText.trim() || "Analyze this image", false, selectedImage || undefined)
      handleImageRemove()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleVoiceInput = () => {
    if (!recognition) return

    if (isListening) {
      try {
        recognition.stop()
        setIsListening(false)
      } catch (error) {
        console.log("Error stopping recognition:", error)
        setIsListening(false)
      }
    } else {
      try {
        // Add a small delay to ensure proper state
        setTimeout(() => {
          if (recognition && !isListening) {
            recognition.start()
          }
        }, 100)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsListening(false)
      }
    }
  }

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file)
    setImagePreview(preview)
    setShowImageUpload(false)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputText])

  return (
    <motion.div
      className="p-4 border-t border-white/10 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Image Upload Area */}
      {showImageUpload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4"
        >
          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            selectedImage={imagePreview}
            disabled={isLoading}
          />
        </motion.div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && imagePreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 flex items-center gap-2"
        >
          <img
            src={imagePreview || "/placeholder.svg"}
            alt="Selected"
            className="w-16 h-16 rounded-lg object-cover border border-white/20"
          />
          <div className="flex-1">
            <p className="text-sm text-white">Image selected</p>
            <p className="text-xs text-gray-400">{selectedImage.name}</p>
          </div>
          <Button onClick={handleImageRemove} size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Image Upload Button */}
        <Button
          type="button"
          onClick={() => setShowImageUpload(!showImageUpload)}
          disabled={isLoading}
          className={`p-3 rounded-full transition-all ${
            showImageUpload || selectedImage ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </Button>

        {/* Voice Input Button */}
        {recognition && (
          <Button
            type="button"
            onClick={toggleVoiceInput}
            disabled={isLoading}
            className={`p-3 rounded-full transition-all ${
              isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isListening ? "Listening..." : selectedImage ? "Ask about the image..." : "Chat with Shark2.0..."
            }
            disabled={isLoading || isListening}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 min-h-[48px]"
            rows={1}
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={(!inputText.trim() && !selectedImage) || isLoading || isListening}
          className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>

      {/* Status Indicators */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          {isListening && (
            <span className="flex items-center gap-1 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              Listening...
            </span>
          )}
          {selectedImage && (
            <span className="flex items-center gap-1 text-green-400">
              <ImageIcon className="w-3 h-3" />
              Image ready
            </span>
          )}
          {voiceEnabled && <span className="flex items-center gap-1 text-blue-400">🔊 Voice output enabled</span>}
        </div>
        <span>Press Enter to send, Shift+Enter for new line</span>
      </div>
    </motion.div>
  )
}
