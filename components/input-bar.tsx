"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Mic, Upload, Compass, Sparkles, MicOff } from "lucide-react"

interface InputBarProps {
  inputText: string
  setInputText: (text: string) => void
  onSendMessage: (message: string, isVoice?: boolean, image?: File) => void
  isLoading: boolean
  voiceEnabled?: boolean
  onDiscoverClick?: () => void
  onVoiceModeClick?: () => void
  onImageGenerationClick?: () => void
}

export default function InputBar({
  inputText,
  setInputText,
  onSendMessage,
  isLoading,
  voiceEnabled = true,
  onDiscoverClick,
  onVoiceModeClick,
  onImageGenerationClick,
}: InputBarProps) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && voiceEnabled) {
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

        recognitionInstance.onerror = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [voiceEnabled, setInputText])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputText])

  const handleSend = () => {
    if ((!inputText.trim() && !uploadedImage) || isLoading) return

    onSendMessage(inputText.trim(), false, uploadedImage || undefined)
    setInputText("")
    setUploadedImage(null)
    setImagePreview(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleVoiceRecognition = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Image Preview */}
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 bg-gray-800/50 rounded-xl border border-gray-600/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Upload preview"
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="text-sm text-white">Image ready for analysis</p>
              <p className="text-xs text-gray-400">{uploadedImage?.name}</p>
            </div>
            <button onClick={removeImage} className="text-gray-400 hover:text-white transition-colors">
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
        <motion.button
          onClick={onDiscoverClick}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-full text-sm text-white hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 whitespace-nowrap backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Compass className="w-4 h-4" />
          Discover
        </motion.button>

        <motion.button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-full text-sm text-white hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 whitespace-nowrap backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className="w-4 h-4" />
          Upload
        </motion.button>

        <motion.button
          onClick={onVoiceModeClick}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-full text-sm text-white hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 whitespace-nowrap backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mic className="w-4 h-4" />
          Voice
        </motion.button>

        <motion.button
          onClick={onImageGenerationClick}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-400/30 rounded-full text-sm text-white hover:from-orange-600/30 hover:to-red-600/30 transition-all duration-300 whitespace-nowrap backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-4 h-4" />
          Imagine
        </motion.button>
      </div>

      {/* Main Input Container */}
      <div
        className={`relative bg-gray-800/60 hover:bg-gray-800/70 focus-within:bg-gray-800/80 border-2 rounded-2xl sm:rounded-3xl transition-all duration-300 backdrop-blur-sm ${
          dragActive
            ? "border-cyan-400/50 bg-cyan-900/20"
            : "border-gray-600/50 hover:border-gray-500/50 focus-within:border-cyan-500/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-cyan-500/10 border-2 border-dashed border-cyan-400 rounded-2xl sm:rounded-3xl flex items-center justify-center z-10">
            <div className="text-cyan-400 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Drop image here</p>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 p-3 sm:p-4">
          {/* Voice Recognition Button */}
          {voiceEnabled && recognition && (
            <motion.button
              onClick={toggleVoiceRecognition}
              className={`p-2 rounded-full transition-all duration-300 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>
          )}

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              uploadedImage
                ? "Ask me about this image..."
                : isListening
                  ? "Listening..."
                  : "Ask me anything... I'll provide comprehensive, fascinating answers!"
            }
            className="flex-1 bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none min-h-[20px] max-h-[120px] text-sm sm:text-base leading-relaxed"
            rows={1}
            disabled={isLoading || isListening}
          />

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={(!inputText.trim() && !uploadedImage) || isLoading}
            className="p-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-full transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
        className="hidden"
      />

      {/* Voice Status */}
      {isListening && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-sm text-red-400 backdrop-blur-sm">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            Listening...
          </div>
        </motion.div>
      )}

      {/* Loading Status */}
      {isLoading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-sm text-cyan-400 backdrop-blur-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Crafting your comprehensive response...
          </div>
        </motion.div>
      )}
    </div>
  )
}
