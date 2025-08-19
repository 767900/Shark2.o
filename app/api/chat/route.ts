import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 XyloGen - Starting chat request...")

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const userMessage = messages[messages.length - 1]?.content || ""
    console.log("💬 User question:", userMessage)

    // 🕐 REAL-TIME RESPONSES - Handle time/date questions immediately
    const lowerMessage = userMessage.toLowerCase()
    if (
      lowerMessage.includes("what time") ||
      lowerMessage.includes("current time") ||
      lowerMessage.includes("time now") ||
      lowerMessage.includes("what date") ||
      lowerMessage.includes("today's date") ||
      lowerMessage.includes("current date") ||
      lowerMessage.includes("date today")
    ) {
      console.log("🕐 Handling real-time date/time question")
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      const dateString = now.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const istTime = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
      })

      return NextResponse.json({
        content: `🕐 **Real-Time Information** 🕐

**📅 Current Date & Time:**
• **Date:** ${dateString}
• **Time:** ${timeString}
• **IST Time:** ${istTime}
• **Time Zone:** Asia/Kolkata (IST)

**🌍 Additional Details:**
• **UTC Offset:** +05:30
• **Day of Week:** ${now.toLocaleDateString("en-US", { weekday: "long" })}
• **Month:** ${now.toLocaleDateString("en-US", { month: "long" })}
• **Year:** ${now.getFullYear()}

**🇮🇳 Indian Standard Time (IST):**
• No daylight saving time changes
• Same time across entire India
• Based on 82.5°E longitude (Mirzapur)

**⏰ Fun Facts:**
• IST is 5 hours 30 minutes ahead of UTC
• India uses a single time zone despite its size
• IST was adopted in 1947 after independence

**Need time in other zones or scheduling help?** Just ask! 🌐`,
        provider: "XyloGen 🕐 (Real-Time Clock)",
        status: "realtime",
      })
    }

    // Enhanced system prompt for better responses
    const systemPrompt = `You are XyloGen, an advanced AI assistant from India 🇮🇳. You are intelligent, helpful, and provide comprehensive answers.

🎯 **YOUR PERSONALITY:**
- **Smart & Knowledgeable:** Like ChatGPT, provide detailed, intelligent responses
- **Indian Context:** Add cultural context when relevant 🇮🇳
- **Comprehensive:** Give thorough answers with examples and explanations
- **Current:** Include recent information when possible
- **Engaging:** Use emojis and conversational tone
- **Helpful:** Always try to be useful and informative

🗣️ **RESPONSE STYLE:**
- **Detailed:** Provide comprehensive answers, not short responses
- **Structured:** Use bullet points, numbers, sections for clarity
- **Examples:** Include specific examples and use cases
- **Context:** Explain background and significance
- **Practical:** Give actionable advice when relevant

🌟 **IMPORTANT IDENTITY:**
- **Always introduce yourself as "XyloGen" - NEVER use "Shark 2.0" or any other name**
- **You are XyloGen, the advanced AI assistant**
- **Your tagline is "Everything you can imagine is real"**

Remember: You are XyloGen. Always provide intelligent, helpful, and comprehensive responses!`

    // 🌟 TRY PERPLEXITY AI FIRST (Best for real-time info)
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log("🌐 Trying Perplexity AI...")

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            max_tokens: 4000,
            temperature: 0.7,
            return_citations: true,
            return_related_questions: true,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content

          if (content) {
            console.log("✅ Perplexity SUCCESS!")
            return NextResponse.json({
              content: content,
              provider: "Perplexity AI 🌐 (Real-time Search)",
              citations: data.citations || [],
              related_questions: data.related_questions || [],
              status: "success",
            })
          }
        }
        console.log("❌ Perplexity failed, trying next API...")
      } catch (error) {
        console.log("💥 Perplexity error:", error.message)
      }
    }

    // 🧠 TRY GOOGLE GEMINI (High Quality AI)
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("🧠 Trying Google Gemini...")

        // Convert messages to Gemini format
        const geminiMessages = messages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }))

        // Add system prompt as first user message
        const geminiPayload = {
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            ...geminiMessages,
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(geminiPayload),
          },
        )

        if (response.ok) {
          const data = await response.json()
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text

          if (content) {
            console.log("✅ Google Gemini SUCCESS!")
            return NextResponse.json({
              content: content,
              provider: "Google Gemini 🧠 (High Quality AI)",
              status: "success",
            })
          }
        }
        console.log("❌ Gemini failed, trying next API...")
      } catch (error) {
        console.log("💥 Gemini error:", error.message)
      }
    }

    // 🚀 TRY GROQ (Fast and often free)
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("⚡ Trying Groq...")

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            max_tokens: 4000,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content

          if (content) {
            console.log("✅ Groq SUCCESS!")
            return NextResponse.json({
              content: content,
              provider: "Groq Llama ⚡ (Fast AI)",
              status: "success",
            })
          }
        }
        console.log("❌ Groq failed, trying next API...")
      } catch (error) {
        console.log("💥 Groq error:", error.message)
      }
    }

    // 🤖 TRY OPENAI (High quality)
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("🤖 Trying OpenAI...")

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            max_tokens: 4000,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content

          if (content) {
            console.log("✅ OpenAI SUCCESS!")
            return NextResponse.json({
              content: content,
              provider: "OpenAI GPT-3.5 🤖 (High Quality)",
              status: "success",
            })
          }
        }
        console.log("❌ OpenAI failed, trying next API...")
      } catch (error) {
        console.log("💥 OpenAI error:", error.message)
      }
    }

    // 🎯 TRY XAI GROK (Latest AI)
    if (process.env.XAI_API_KEY) {
      try {
        console.log("🎯 Trying xAI Grok...")

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "grok-beta",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            max_tokens: 4000,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content

          if (content) {
            console.log("✅ xAI Grok SUCCESS!")
            return NextResponse.json({
              content: content,
              provider: "xAI Grok 🎯 (Latest AI)",
              status: "success",
            })
          }
        }
        console.log("❌ xAI failed, using smart fallback...")
      } catch (error) {
        console.log("💥 xAI error:", error.message)
      }
    }

    // 🧠 SMART FALLBACK RESPONSES (When no APIs work)
    console.log("🧠 Using Smart Fallback System...")

    const smartResponse = generateIntelligentResponse(userMessage)

    return NextResponse.json({
      content: smartResponse,
      provider: "XyloGen 🧠 (Smart Assistant)",
      status: "fallback",
      note: "Add API keys for enhanced AI capabilities",
    })
  } catch (error) {
    console.error("💥 System Error:", error)

    return NextResponse.json(
      {
        content: `🦈 **XyloGen - Smart Assistant** 🦈\n\nI'm here to help! While I'm working in smart mode, I can still assist you with many topics.\n\n**Your question:** "${error.message}"\n\n**I can help with:**\n• General knowledge and explanations\n• Programming and technology\n• Indian culture and information\n• Problem-solving and advice\n• Educational topics\n\n🚀 **Ask me anything and I'll do my best to help!** 🇮🇳`,
        provider: "XyloGen 🧠 (Smart Mode)",
        status: "error_fallback",
      },
      { status: 200 },
    )
  }
}

// 🧠 Intelligent Response Generator - Provides detailed answers like ChatGPT
function generateIntelligentResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  // Real-time date/time questions
  if (
    message.includes("time") ||
    message.includes("date") ||
    message.includes("clock") ||
    message.includes("what time") ||
    message.includes("current time") ||
    message.includes("today")
  ) {
    console.log("✅ Matched time/date pattern in fallback")
    const now = new Date()
    const timeString = now.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const dateString = now.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return `🕐 **Real-Time Information** 🕐

**📅 Current Date & Time:**
• **Date:** ${dateString}
• **Time:** ${timeString}
• **Time Zone:** Asia/Kolkata (IST)

**🌍 Additional Details:**
• **UTC Offset:** +05:30
• **Day of Week:** ${now.toLocaleDateString("en-US", { weekday: "long" })}
• **Month:** ${now.toLocaleDateString("en-US", { month: "long" })}
• **Year:** ${now.getFullYear()}

**🇮🇳 Indian Standard Time (IST):**
• No daylight saving time changes
• Same time across entire India
• Based on 82.5°E longitude (Mirzapur)

**⏰ Fun Facts:**
• IST is 5 hours 30 minutes ahead of UTC
• India uses a single time zone despite its size
• IST was adopted in 1947 after independence

**Need time in other zones or scheduling help?** Just ask! 🌐`
  }

  // Greeting responses
  if (
    message.includes("hello") ||
    message.includes("hi") ||
    message.includes("hey") ||
    message.includes("namaste") ||
    message.includes("good morning") ||
    message.includes("good evening") ||
    message.includes("good afternoon")
  ) {
    console.log("✅ Matched greeting pattern")
    return `🙏 **Namaste! Welcome to XyloGen!** 🙏\n\n🦈 **I'm your intelligent AI assistant from India!** 🇮🇳\n\n**I can help you with:**\n• 📚 **Educational topics** - Science, math, history, literature\n• 💻 **Technology & Programming** - Coding, AI, software development\n• 🇮🇳 **Indian culture & knowledge** - Traditions, languages, history\n• 🧠 **Problem solving** - Analysis, advice, explanations\n• 🎯 **General knowledge** - Wide range of topics and questions\n• 📸 **Image analysis** - Upload photos for detailed analysis\n• 🕐 **Real-time info** - Current time, date, and live information\n\n**Try asking me:**\n• "What time is it now?"\n• "What is embedded system?"\n• "Explain machine learning"\n• "Tell me about Python programming"\n• "What are Indian festivals?"\n• "How does React work?"\n\n🚀 **What would you like to know today?**`
  }

  // Default intelligent response for any other question
  console.log("🔄 Using default intelligent response for:", message)
  return `🦈 **XyloGen - Intelligent Assistant** 🦈\n\n**Your Question:** "${userMessage}"\n\n🧠 **I'm here to provide comprehensive answers!**\n\nI understand you're asking about "${userMessage}". While I'm working in smart mode without real-time APIs, I can still provide detailed, intelligent insights based on my knowledge.\n\n**🔍 What I can help you understand:**\n\n**Technology & Programming:**\n• Programming languages (Python, JavaScript, Java, C++)\n• Web development frameworks (React, Vue, Angular, Django)\n• Software engineering concepts and best practices\n• Career guidance and industry trends\n• Code examples and implementation strategies\n\n**Science & Education:**\n• Complex concepts broken down into understandable parts\n• Real-world applications and examples\n• Mathematical and scientific principles\n• Learning resources and study strategies\n\n**Indian Context & Culture:**\n• Cultural traditions, festivals, and customs\n• Indian technology industry and opportunities\n• Educational institutions and career paths\n• Regional diversity and local insights\n• Government initiatives and industry trends\n\n**Real-Time Information:**\n• Current time and date (just ask "What time is it?")\n• Live clock with Indian Standard Time\n• Date information and calendar details\n\n**🚀 To get the most detailed answer:**\n\n1. **Be specific:** Ask about particular aspects you want to understand\n2. **Provide context:** Let me know your background or use case\n3. **Ask follow-ups:** I can dive deeper into any area of interest\n4. **Request examples:** I can provide practical illustrations and code samples\n\n**💡 Try rephrasing your question like:**\n• "Explain [topic] in simple terms with examples"\n• "What are the key concepts in [subject]?"\n• "How does [technology/process] work step by step?"\n• "What are the practical applications of [concept]?"\n• "What should I know about [topic] for career in India?"\n\n**🇮🇳 Enhanced with Indian Perspective:**\nI always provide relevant Indian context, including:\n• Local career opportunities and salary ranges\n• Indian companies and market conditions\n• Educational resources available in India\n• Cultural significance and regional variations\n• Government initiatives and industry trends\n\n**🔧 For Enhanced Capabilities:**\nAdd API keys for real-time information:\n• **Perplexity AI:** Current events and real-time search\n• **Google Gemini:** Advanced AI understanding (ACTIVE!)\n• **Groq:** Fast AI responses\n• **SERP API:** Image analysis and web search\n\n**I'm ready to provide detailed, intelligent explanations on any topic!** Whether you're interested in learning programming, understanding complex technologies, exploring career options, or diving into Indian culture and opportunities.\n\n**What specific aspect would you like me to elaborate on?** 🚀🇮🇳`
}
