"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, Upload, Sparkles, Search, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import ImageUpload from "@/components/image-upload"

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
  const [isListening, setIsListening] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedImage || inputText.trim()) {
        onSendMessage(inputText, false, selectedImage || undefined)
        setInputText("")
        setSelectedImage(null)
        setImagePreview(null)
        setShowImageUpload(false)
      }
    },
    [inputText, selectedImage, onSendMessage, setInputText],
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
    setSelectedImage(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setShowImageUpload(false)
    console.log("📸 Image selected:", file.name, file.type, Math.round(file.size / 1024) + "KB")
  }, [])

  const handleImageUploadClick = useCallback(() => {
    setShowImageUpload(true)
  }, [])

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }, [imagePreview])

  const handleVoiceClick = useCallback(() => {
    console.log("🎤 Voice button clicked")
    onVoiceModeClick()
  }, [onVoiceModeClick])

  return (
    <>
      <div className="relative">
        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-4 p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
          {/* Discover Button */}
          <motion.button
            onClick={onDiscoverClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Discover trending topics"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Discover</span>
          </motion.button>

          {/* Upload Button */}
          <motion.button
            onClick={handleImageUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Upload and analyze images"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload</span>
          </motion.button>

          {/* Voice Button */}
          <motion.button
            onClick={handleVoiceClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Voice chat mode"
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm font-medium">Voice</span>
          </motion.button>

          {/* Imagine Button */}
          <motion.button
            onClick={onImageGenerationClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 text-white transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Generate AI images"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Imagine</span>
          </motion.button>
        </div>

        {/* Image Preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mx-4 mb-2 p-3 bg-black/40 backdrop-blur-sm rounded-lg border border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Selected image"
                    className="w-16 h-16 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Image ready to send</p>
                  <p className="text-white/60 text-xs">
                    {selectedImage?.name} ({Math.round((selectedImage?.size || 0) / 1024)}KB)
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What you want to explore"
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 min-h-[50px] max-h-32"
                rows={1}
                disabled={isLoading}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.3) transparent",
                }}
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white border-0 rounded-2xl px-4 py-3 h-[50px] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Upload Image
                </h3>
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ImageUpload onImageSelect={handleImageSelect} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
