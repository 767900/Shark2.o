"use client"

import React from "react"

import { motion } from "framer-motion"
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
  }

  const formatContent = (content: string) => {
    // Split content into sections based on markdown-style headers
    const sections = content.split(/(?=^#{1,6}\s)/m).filter(Boolean)

    return sections.map((section, index) => {
      // Check if section starts with a header
      const headerMatch = section.match(/^(#{1,6})\s(.+)$/m)

      if (headerMatch) {
        const level = headerMatch[1].length
        const title = headerMatch[2]
        const contentText = section.replace(/^#{1,6}\s.+$/m, "").trim()

        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements

        return (
          <div key={index} className="mb-6">
            {React.createElement(
              HeaderTag,
              {
                className: `font-bold mb-3 ${
                  level === 1
                    ? "text-2xl text-cyan-400"
                    : level === 2
                      ? "text-xl text-blue-400"
                      : level === 3
                        ? "text-lg text-purple-400"
                        : "text-base text-gray-300"
                }`,
              },
              title,
            )}
            {contentText && <div className="answer-text text-gray-200 space-y-3">{formatText(contentText)}</div>}
          </div>
        )
      } else {
        return (
          <div key={index} className="answer-text text-gray-200 space-y-3 mb-4">
            {formatText(section)}
          </div>
        )
      }
    })
  }

  const formatText = (text: string) => {
    return text.split("\n\n").map((paragraph, index) => {
      if (paragraph.trim().startsWith("- ") || paragraph.trim().startsWith("• ")) {
        // Handle bullet points
        const items = paragraph.split("\n").filter((line) => line.trim())
        return (
          <ul key={index} className="list-disc list-inside space-y-2 ml-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="answer-text">
                {item.replace(/^[-•]\s*/, "")}
              </li>
            ))}
          </ul>
        )
      } else if (paragraph.trim().match(/^\d+\.\s/)) {
        // Handle numbered lists
        const items = paragraph.split("\n").filter((line) => line.trim())
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 ml-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="answer-text">
                {item.replace(/^\d+\.\s*/, "")}
              </li>
            ))}
          </ol>
        )
      } else if (paragraph.trim().startsWith("**") && paragraph.trim().endsWith("**")) {
        // Handle bold text
        return (
          <p key={index} className="font-bold answer-text text-cyan-400">
            {paragraph.replace(/\*\*/g, "")}
          </p>
        )
      } else {
        // Regular paragraph
        return (
          <p key={index} className="answer-text">
            {paragraph.trim()}
          </p>
        )
      }
    })
  }

  return (
    <motion.div
      className={`flex gap-3 p-4 md:p-6 ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div className={`flex-1 max-w-4xl ${isUser ? "text-right" : "text-left"}`}>
        {isUser ? (
          <div className="inline-block bg-cyan-600 text-white rounded-2xl px-4 py-3 max-w-xs md:max-w-md">
            {message.image && (
              <img
                src={message.image || "/placeholder.svg"}
                alt="User upload"
                className="max-w-full h-auto rounded-lg mb-2"
              />
            )}
            <p className="text-sm md:text-base">{message.content}</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700">
            <div className="prose prose-invert max-w-none">{formatContent(message.content)}</div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
              <Button onClick={copyToClipboard} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  )
}
