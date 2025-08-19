"use client"

import type React from "react"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Send, Mic, Camera, Sparkles, Compass, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InputBarProps {
  inputText: string
  setInputText: (text: string) => void
  onSendMessage: (message: string, isVoice?: boolean, image?: File) => void
  isLoading: boolean
  voiceEnabled: boolean
  onDiscoverClick: () => void
  onVoiceModeClick: () => void
  onImageGenerationClick: () => void
}

export default function InputBar({
  inputText,
  setInputText,
  onSendMessage,
  isLoading,
  voiceEnabled,
  onDiscoverClick,
  onVoiceModeClick,
  onImageGenerationClick,
}: InputBarProps) {
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

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onSendMessage("", false, file)
      // Reset the input
      e.target.value = ""
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action Buttons */}
      <motion.div
        className="flex items-center justify-center gap-2 md:gap-4 mb-4 md:mb-6 overflow-x-auto pb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.button
          onClick={onDiscoverClick}
          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/20 whitespace-nowrap"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Compass className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-medium">Discover</span>
        </motion.button>

        <motion.button
          onClick={handleUploadClick}
          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/20 whitespace-nowrap"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Camera className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-medium">Upload</span>
        </motion.button>

        <motion.button
          onClick={onVoiceModeClick}
          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/20 whitespace-nowrap"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Mic className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-medium">Voice</span>
        </motion.button>

        <motion.button
          onClick={onImageGenerationClick}
          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/20 whitespace-nowrap"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Palette className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-medium">Imagine</span>
        </motion.button>
      </motion.div>

      {/* Main Input */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative bg-white/10 backdrop-blur-sm rounded-full border border-white/20 overflow-hidden">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="w-full px-4 md:px-6 py-3 md:py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm md:text-lg"
          />

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 md:gap-2">
            <motion.button
              onClick={onVoiceModeClick}
              className="p-1.5 md:p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Mic className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>

            <Button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="p-1.5 md:p-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
              ) : (
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  )
}
