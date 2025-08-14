export async function POST(request: Request) {
  try {
    console.log("🚀 Shark 2.0 - Starting chat request...")

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const userMessage = messages[messages.length - 1]?.content || ""
    console.log("💬 User question:", userMessage)

    // Enhanced system prompt
    const systemPrompt = `You are Shark 2.0, an advanced AI assistant from India 🇮🇳. You are intelligent, helpful, and provide comprehensive answers.

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

Remember: You are a smart AI assistant. Always provide intelligent, helpful, and comprehensive responses!`

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
            return Response.json({
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
            return Response.json({
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
            return Response.json({
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
            return Response.json({
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

    const smartResponse = generateSmartResponse(userMessage)

    return Response.json({
      content: smartResponse,
      provider: "Shark 2.0 🧠 (Smart Assistant)",
      status: "fallback",
      note: "Add API keys for enhanced AI capabilities",
    })
  } catch (error) {
    console.error("💥 System Error:", error)

    return Response.json(
      {
        content: `🦈 **Shark 2.0 - Smart Assistant** 🦈\n\nI'm here to help! While I'm working in smart mode, I can still assist you with many topics.\n\n**Your question:** "${error.message}"\n\n**I can help with:**\n• General knowledge and explanations\n• Programming and technology\n• Indian culture and information\n• Problem-solving and advice\n• Educational topics\n\n🚀 **Ask me anything and I'll do my best to help!** 🇮🇳`,
        provider: "Shark 2.0 🧠 (Smart Mode)",
        status: "error_fallback",
      },
      { status: 200 },
    )
  }
}

// 🧠 Smart Response Generator
function generateSmartResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  // Time-related questions
  if (message.includes("time") || message.includes("date")) {
    const now = new Date()
    return `🕐 **Current Time & Date** 🕐\n\n**Current Time:** ${now.toLocaleTimeString()}\n**Date:** ${now.toLocaleDateString()}\n**Day:** ${now.toLocaleDateString("en-US", { weekday: "long" })}\n\n🌍 **Time Zone:** ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n\n⏰ **Need more specific time information?** Ask me about different time zones or scheduling!`
  }

  // Weather questions
  if (message.includes("weather")) {
    return `🌤️ **Weather Information** 🌤️\n\nI'd love to give you current weather data! For real-time weather information, I need API access.\n\n**What I can help with:**\n• **General weather patterns** in different regions\n• **Seasonal information** for India and worldwide\n• **Weather preparation tips** for different conditions\n• **Climate information** for various cities\n\n🌐 **For live weather data, add a weather API key to get real-time conditions!**\n\n🇮🇳 **Try asking:** "What's the typical weather in Mumbai during monsoon?"`
  }

  // News questions
  if (message.includes("news") || message.includes("latest") || message.includes("current")) {
    return `📰 **News & Current Events** 📰\n\nI'd love to provide you with the latest news! For real-time news updates, I need API access.\n\n**What I can help with:**\n• **Explaining current topics** and their background\n• **Historical context** for ongoing events\n• **Analysis** of political and social issues\n• **Indian affairs** and cultural topics\n• **Technology trends** and developments\n\n🌐 **For live news updates, add Perplexity API for real-time search!**\n\n🇮🇳 **Try asking:** "Explain the significance of recent tech developments in India"`
  }

  // Greeting responses
  if (message.includes("hello") || message.includes("hi") || message.includes("hey") || message.includes("namaste")) {
    return `🙏 **Namaste! Welcome to Shark 2.0!** 🙏\n\n🦈 **I'm your intelligent AI assistant from India!** 🇮🇳\n\n**I can help you with:**\n• 📚 **Educational topics** - Science, math, history, literature\n• 💻 **Technology & Programming** - Coding, AI, software development\n• 🇮🇳 **Indian culture & knowledge** - Traditions, languages, history\n• 🧠 **Problem solving** - Analysis, advice, explanations\n• 🎯 **General knowledge** - Wide range of topics and questions\n\n**Try asking me:**\n• "Explain quantum computing in simple terms"\n• "What are the major festivals in India?"\n• "Help me understand machine learning"\n• "Tell me about Indian independence history"\n\n🚀 **What would you like to know today?**`
  }

  // Programming questions
  if (
    message.includes("code") ||
    message.includes("programming") ||
    message.includes("python") ||
    message.includes("javascript") ||
    message.includes("react")
  ) {
    return `💻 **Programming & Technology** 💻\n\n🚀 **I can help you with coding and technology topics!**\n\n**Programming Languages:**\n• **Python** - Data science, web development, automation\n• **JavaScript** - Web development, React, Node.js\n• **Java** - Enterprise applications, Android development\n• **C++** - System programming, competitive programming\n• **HTML/CSS** - Web design and styling\n\n**Topics I can explain:**\n• 🧠 **Algorithms & Data Structures**\n• 🌐 **Web Development** (Frontend & Backend)\n• 📱 **Mobile App Development**\n• 🤖 **AI & Machine Learning**\n• 🔒 **Cybersecurity** basics\n• 📊 **Database** design and queries\n\n**Ask me specific questions like:**\n• "How do I create a React component?"\n• "Explain sorting algorithms"\n• "What's the difference between Python and Java?"\n\n💡 **What programming topic interests you?**`
  }

  // AI/ML questions
  if (
    message.includes("ai") ||
    message.includes("artificial intelligence") ||
    message.includes("machine learning") ||
    message.includes("ml")
  ) {
    return `🤖 **Artificial Intelligence & Machine Learning** 🤖\n\n🧠 **I can explain AI/ML concepts in detail!**\n\n**Core AI Topics:**\n• 🎯 **Machine Learning** - Supervised, unsupervised, reinforcement learning\n• 🧠 **Deep Learning** - Neural networks, CNNs, RNNs, transformers\n• 💬 **Natural Language Processing** - Text analysis, chatbots, language models\n• 👁️ **Computer Vision** - Image recognition, object detection\n• 🎮 **Reinforcement Learning** - Game AI, robotics\n\n**Popular AI Tools & Frameworks:**\n• **TensorFlow** & **PyTorch** for deep learning\n• **Scikit-learn** for traditional ML\n• **OpenCV** for computer vision\n• **NLTK** & **spaCy** for NLP\n\n**Current AI Trends:**\n• 🚀 **Large Language Models** (GPT, BERT, etc.)\n• 🎨 **Generative AI** (Image, text, code generation)\n• 🤖 **AI Agents** and automation\n• 🇮🇳 **AI in India** - Growing tech ecosystem\n\n**Ask me:** "How do neural networks work?" or "Explain transformer architecture"`
  }

  // Indian culture questions
  if (
    message.includes("india") ||
    message.includes("indian") ||
    message.includes("culture") ||
    message.includes("festival")
  ) {
    return `🇮🇳 **Indian Culture & Heritage** 🇮🇳\n\n🕉️ **I can share knowledge about incredible India!**\n\n**Cultural Topics:**\n• 🎭 **Festivals** - Diwali, Holi, Eid, Christmas, regional celebrations\n• 🍛 **Cuisine** - Regional dishes, spices, cooking traditions\n• 💃 **Arts** - Classical dance, music, literature, cinema\n• 🏛️ **History** - Ancient civilizations, independence movement\n• 🗣️ **Languages** - 22 official languages, regional dialects\n\n**Indian Achievements:**\n• 🚀 **Space Program** - ISRO missions, Mars Orbiter\n• 💻 **Technology Hub** - IT services, startups, innovation\n• 🎬 **Bollywood** - World's largest film industry\n• 🧘 **Yoga & Spirituality** - Ancient wisdom, modern wellness\n• 🏏 **Sports** - Cricket, hockey, emerging sports\n\n**Regional Diversity:**\n• **North India** - Punjab, Delhi, Rajasthan, UP\n• **South India** - Tamil Nadu, Karnataka, Kerala, Andhra Pradesh\n• **East India** - West Bengal, Odisha, Assam\n• **West India** - Maharashtra, Gujarat, Goa\n\n**Ask me:** "Tell me about Diwali celebrations" or "What are famous Indian dishes?"`
  }

  // Math/Science questions
  if (
    message.includes("math") ||
    message.includes("science") ||
    message.includes("physics") ||
    message.includes("chemistry")
  ) {
    return `🔬 **Mathematics & Science** 🔬\n\n📐 **I can help with academic and scientific topics!**\n\n**Mathematics:**\n• 🧮 **Basic Math** - Arithmetic, algebra, geometry\n• 📊 **Statistics** - Probability, data analysis\n• 🔢 **Calculus** - Derivatives, integrals, applications\n• 🎯 **Discrete Math** - Logic, sets, combinatorics\n• 📈 **Applied Math** - Optimization, modeling\n\n**Science Fields:**\n• ⚛️ **Physics** - Mechanics, thermodynamics, quantum physics\n• 🧪 **Chemistry** - Organic, inorganic, physical chemistry\n• 🧬 **Biology** - Cell biology, genetics, evolution\n• 🌍 **Earth Science** - Geology, meteorology, environmental science\n• 🌌 **Astronomy** - Solar system, stars, cosmology\n\n**Indian Scientists:**\n• **APJ Abdul Kalam** - Aerospace engineer, former President\n• **CV Raman** - Nobel Prize in Physics\n• **Srinivasa Ramanujan** - Mathematical genius\n• **Homi Bhabha** - Nuclear physicist\n\n**Ask me:** "Explain Newton's laws" or "What is photosynthesis?"`
  }

  // Default comprehensive response
  return `🦈 **Shark 2.0 - Smart Assistant** 🦈\n\n🇮🇳 **Namaste! I'm here to help you!** 🇮🇳\n\n**Your Question:** "${userMessage}"\n\n**I can assist you with:**\n\n📚 **Education & Learning:**\n• Science, mathematics, history, literature\n• Explanations of complex concepts\n• Study help and academic support\n\n💻 **Technology & Programming:**\n• Coding in Python, JavaScript, Java, C++\n• Web development, mobile apps\n• AI/ML concepts and implementation\n• Software engineering best practices\n\n🇮🇳 **Indian Knowledge:**\n• Culture, festivals, traditions\n• History and heritage\n• Languages and regional diversity\n• Current affairs and developments\n\n🧠 **Problem Solving:**\n• Analysis and critical thinking\n• Step-by-step solutions\n• Practical advice and guidance\n• Creative and logical approaches\n\n🌟 **General Topics:**\n• Current events and trends\n• Health and wellness\n• Business and economics\n• Arts and entertainment\n\n**💡 Try asking me:**\n• "Explain [any topic] in simple terms"\n• "Help me understand [concept]"\n• "What are the benefits of [subject]?"\n• "How does [technology/process] work?"\n\n🚀 **I'm ready to provide detailed, helpful answers! What would you like to know?**\n\n*Note: For real-time information and enhanced AI capabilities, consider adding API keys for services like Perplexity, OpenAI, or Groq.*`
}
