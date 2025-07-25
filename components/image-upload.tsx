"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void
  onImageRemove: () => void
  selectedImage: string | null
  disabled?: boolean
}

export default function ImageUpload({ onImageSelect, onImageRemove, selectedImage, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string
        onImageSelect(file, preview)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))

    if (imageFile) {
      handleFileSelect(imageFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (selectedImage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative inline-block"
      >
        <img
          src={selectedImage || "/placeholder.svg"}
          alt="Selected"
          className="max-w-[200px] max-h-[150px] rounded-lg border border-white/20"
        />
        <Button
          onClick={onImageRemove}
          size="sm"
          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500 hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </Button>
      </motion.div>
    )
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      <motion.div
        className={`border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer ${
          isDragging ? "border-blue-400 bg-blue-400/10" : "border-white/30 hover:border-white/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={disabled ? undefined : openFileDialog}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
      >
        <div className="flex flex-col items-center gap-2 text-white/70">
          <ImageIcon className="w-8 h-8" />
          <div className="text-center">
            <p className="text-sm font-medium">Upload Image</p>
            <p className="text-xs">Drag & drop or click to select</p>
          </div>
        </div>
      </motion.div>
    </>
  )
}
