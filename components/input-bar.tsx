"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Upload, Mic, Sparkles, Globe, X, ImageIcon } from "lucide-react"
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
            className="mb-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Selected image preview"
                  className="w-16 h-16 object-cover rounded border border-white/30"
                />
                <div className="absolute -top-2 -right-2">
                  <button
                    onClick={handleRemoveImage}
                    className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-lg"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{selectedImage.name}</p>
                <p className="text-xs text-white/70">
                  {selectedImage.type} • {Math.round(selectedImage.size / 1024)}KB
                </p>
                <div className="mt-1 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs inline-block">
                  ✓ Ready to send
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div
        className="p-4 backdrop-blur-md bg-white/10 border-t border-white/20"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Action buttons row */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Discover Button */}
          <motion.button
            onClick={handleDiscoverClickInternal}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Discover trending topics"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">Discover</span>
          </motion.button>

          {/* Upload Button */}
          <motion.button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 text-white hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Upload image for analysis"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Upload</span>
          </motion.button>

          {/* Voice Button */}
          <motion.button
            onClick={handleVoiceClickInternal}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 text-white hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Voice chat mode"
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm font-medium">Voice</span>
          </motion.button>

          {/* Imagine Button */}
          <motion.button
            onClick={handleImagineClickInternal}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-400/30 text-white hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="AI image generation"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Imagine</span>
          </motion.button>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                selectedImage ? "Ask me about this image..." : "Ask me anything... (or drag & drop an image)"
              }
              className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent min-h-[50px] max-h-32"
              rows={1}
              disabled={isLoading}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.3) transparent",
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={!canSend}
            className={`h-[50px] w-[50px] rounded-full border-0 shadow-lg flex items-center justify-center transition-all duration-200 ${
              canSend
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105"
                : "bg-gray-500/50 cursor-not-allowed opacity-50"
            }`}
            title={selectedImage ? "Send message with image" : "Send message"}
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </form>

        {/* Image indicator in input */}
        {selectedImage && (
          <div className="mt-2 text-xs text-white/70 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            <span>Image ready • Click send or add a message</span>
          </div>
        )}
      </div>
    </div>
  )
}
