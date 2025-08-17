"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Send, Globe, Upload, Mic, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import ImageUpload from "@/components/image-upload"

interface InputBarProps {
  inputText: string
  setInputText: (text: string) => void
  onSendMessage: (message: string, isVoice?: boolean, image?: File) => void
  isLoading: boolean
  voiceEnabled: boolean
  onDiscoverClick: () => void
  onVoiceModeClick?: () => void
  onImageGenerationClick?: () => void
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((inputText.trim() || selectedImage) && !isLoading) {
      onSendMessage(inputText, false, selectedImage || undefined)
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <motion.div
      className={`${isMobile ? "p-4" : "p-6"} backdrop-blur-md bg-gradient-to-t from-white/5 to-transparent`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* External Action Buttons - Outside the search box */}
      <div className="flex justify-between items-center mb-4">
        {/* Left Side Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onDiscoverClick}
            disabled={isLoading}
            className="p-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg"
            title="Discover"
          >
            <Globe className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
            title="Upload Image"
          >
            <Upload className="w-5 h-5" />
          </Button>
        </div>

        {/* Right Side Buttons */}
        <div className="flex gap-2">
          {onVoiceModeClick && (
            <Button
              onClick={onVoiceModeClick}
              disabled={isLoading}
              className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              title="Voice Mode"
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}

          {onImageGenerationClick && (
            <Button
              onClick={onImageGenerationClick}
              disabled={isLoading}
              className="p-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg"
              title="AI Image Generation"
            >
              <Palette className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-4 flex justify-center">
          <div className="w-full max-w-md">
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              selectedImage={selectedImage}
              imagePreview={imagePreview}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Centered Google-Style Search Box - Constrained Width */}
      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="relative w-full max-w-md">
          <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            {/* Text Input - Constrained Width */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyPress={handleKeyPress}
              placeholder="Chat with Shark 2.0..."
              disabled={isLoading}
              className={`w-full ${isMobile ? "min-h-[48px] max-h-[96px] py-3 px-5 text-base" : "min-h-[52px] max-h-[104px] py-4 px-6 text-lg"} bg-transparent border-none text-gray-800 placeholder-gray-500 resize-none focus:outline-none leading-relaxed rounded-full`}
              style={{ height: "auto" }}
            />
          </div>

          {/* External Send Button */}
          <Button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageSelect(file)
          }
        }}
        className="hidden"
      />
    </motion.div>
  )
}
