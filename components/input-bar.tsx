"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Upload, Mic, Sparkles, Search, X } from "lucide-react"

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
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if ((inputText.trim() || selectedImage) && !isLoading) {
        onSendMessage(inputText.trim(), false, selectedImage || undefined)
        setInputText("")
        // Clear image after sending
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    },
    [inputText, selectedImage, isLoading, onSendMessage, setInputText],
  )

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    },
    [handleSubmit],
  )

  const handleImageSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      console.log("📁 Image selected for preview:", file.name)
      setSelectedImage(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    } else {
      console.warn("⚠️ Invalid file type. Please select an image.")
    }
  }, [])

  const handleRemoveImage = useCallback(() => {
    console.log("🗑️ Image removed from preview")
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleUploadClick = useCallback(() => {
    console.log("🟢 Upload button clicked")
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleImageSelect(file)
      }
    },
    [handleImageSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((file) => file.type.startsWith("image/"))

      if (imageFile) {
        handleImageSelect(imageFile)
      }
    },
    [handleImageSelect],
  )

  const handleDiscoverClickInternal = useCallback(() => {
    console.log("🟣 Discover button clicked internally")
    onDiscoverClick()
  }, [onDiscoverClick])

  const handleVoiceClickInternal = useCallback(() => {
    console.log("🟠 Voice button clicked internally")
    onVoiceModeClick()
  }, [onVoiceModeClick])

  const handleImagineClickInternal = useCallback(() => {
    console.log("🟣 Imagine button clicked internally")
    onImageGenerationClick()
  }, [onImageGenerationClick])

  const canSend = (inputText.trim() || selectedImage) && !isLoading

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload image"
      />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50">
          <div className="text-white text-center">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Drop image here to preview</p>
          </div>
        </div>
      )}

      {/* Image Preview */}
      <AnimatePresence>
        {selectedImage && imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 mx-4 p-3 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Selected image preview"
                  className="w-12 h-12 object-cover rounded border border-white/30"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-lg"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{selectedImage.name}</p>
                <p className="text-xs text-white/70">{Math.round(selectedImage.size / 1024)}KB • Ready to send</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lower Section - Exact match to screenshot */}
      <div
        className="bg-black/40 backdrop-blur-sm border-t border-white/10"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Four Action Buttons Row - Exactly like screenshot */}
        <div className="flex items-center justify-start gap-6 px-6 py-3 border-b border-white/10">
          {/* Discover Button */}
          <motion.button
            onClick={handleDiscoverClickInternal}
            disabled={isLoading}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Discover trending topics"
          >
            <Search className="w-5 h-5" />
            <span className="text-sm font-medium">Discover</span>
          </motion.button>

          {/* Upload Button */}
          <motion.button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Upload image for analysis"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-medium">Upload</span>
          </motion.button>

          {/* Voice Button */}
          <motion.button
            onClick={handleVoiceClickInternal}
            disabled={isLoading}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Voice chat mode"
          >
            <Mic className="w-5 h-5" />
            <span className="text-sm font-medium">Voice</span>
          </motion.button>

          {/* Imagine Button */}
          <motion.button
            onClick={handleImagineClickInternal}
            disabled={isLoading}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="AI image generation"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Imagine</span>
          </motion.button>
        </div>

        {/* Input Section - Updated placeholder text */}
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedImage ? "Ask me about this image..." : "What you want to explore"}
                className="w-full px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Send Button - Circular, positioned like screenshot */}
            <motion.button
              type="submit"
              disabled={!canSend}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                canSend
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                  : "bg-gray-500/30 text-white/40 cursor-not-allowed"
              }`}
              whileHover={canSend ? { scale: 1.05 } : {}}
              whileTap={canSend ? { scale: 0.95 } : {}}
              title={selectedImage ? "Send message with image" : "Send message"}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  )
}
