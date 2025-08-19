"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload, X, AlertCircle } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void
  onImageRemove: () => void
  selectedImage: string | null
  disabled?: boolean
}

export default function ImageUpload({ onImageSelect, onImageRemove, selectedImage, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled && !isLoading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled || isLoading) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, GIF)")
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB")
      return
    }

    setIsLoading(true)
    console.log("📸 Processing image:", file.name, file.type, file.size)

    try {
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const result = e.target.result as string
          console.log("✅ Image preview created successfully")
          onImageSelect(file, result)
          setIsLoading(false)
        }
      }
      reader.onerror = (e) => {
        console.error("❌ FileReader error:", e)
        setError("Failed to read image file")
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("❌ Error processing image:", err)
      setError("Failed to process image")
      setIsLoading(false)
    }
  }

  const handleRemoveImage = () => {
    setError(null)
    onImageRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (disabled || isLoading) return
    setError(null)
    fileInputRef.current?.click()
  }

  // Check if selectedImage is valid
  const isValidImage =
    selectedImage &&
    typeof selectedImage === "string" &&
    selectedImage.length > 0 &&
    selectedImage !== "{}" &&
    (selectedImage.startsWith("data:image") || selectedImage.startsWith("http") || selectedImage.startsWith("/"))

  return (
    <div className="relative">
      {/* Upload Button */}
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
          disabled || isLoading
            ? "bg-gray-400 cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105"
        } text-white`}
        title="Upload Image"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isLoading}
      />

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-white rounded-lg p-8 shadow-xl border-2 border-dashed border-green-500">
            <div className="text-center">
              <Upload className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Drop your image here</p>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {isValidImage && (
        <div className="absolute top-14 left-0 z-10">
          <div className="bg-white rounded-lg shadow-lg border p-3 min-w-[220px]">
            <div className="relative">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border"
                onError={(e) => {
                  console.error("❌ Image preview failed to load")
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&text=Image"
                }}
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-lg"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-3 text-xs">
              <p className="font-medium text-gray-700 truncate" title="Ready for analysis">
                Image ready for analysis
              </p>
              <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded text-center font-medium">
                ✅ Ready to analyze
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-14 left-0 z-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg min-w-[220px]">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700 font-medium">Upload Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Drag & Drop Handler */}
      <div
        className="fixed inset-0 pointer-events-none"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  )
}
