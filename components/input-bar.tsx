"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Send, Upload, Mic, Compass, Sparkles } from "lucide-react"

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
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      onSendMessage("", false, file)
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 overflow-x-auto pb-2">
        <motion.button
          onClick={onDiscoverClick}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm whitespace-nowrap transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">Discover</span>
        </motion.button>

        <motion.button
          onClick={triggerFileUpload}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-500/20 hover:bg-green-500/30 backdrop-blur-sm border border-green-400/30 rounded-full text-green-300 text-sm whitespace-nowrap transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </motion.button>

        {voiceEnabled && (
          <motion.button
            onClick={onVoiceModeClick}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-300 text-sm whitespace-nowrap transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice</span>
          </motion.button>
        )}

        <motion.button
          onClick={onImageGenerationClick}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm border border-purple-400/30 rounded-full text-purple-300 text-sm whitespace-nowrap transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Imagine</span>
        </motion.button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask XyloGen anything..."
          className="w-full bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl px-4 md:px-6 py-3 md:py-4 pr-12 md:pr-16 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none text-sm md:text-base"
          rows={1}
          disabled={isLoading}
        />

        <motion.button
          onClick={handleSend}
          disabled={!inputText.trim() || isLoading}
          className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 p-2 md:p-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </motion.button>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
