export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message) {
      return Response.json({ error: "No message provided" }, { status: 400 })
    }

    console.log("🇮🇳 Voice message received:", message)

    // Detect the primary language of the input
    const detectedLanguage = detectLanguage(message)
    console.log("🔍 Detected language:", detectedLanguage)

    // Get current time and date for real-time responses
    const now = new Date()
    const istTime = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(now)

    const istDate = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now)

    // Check for real-time questions first
    const lowerMessage = message.toLowerCase()
    if (
      lowerMessage.includes("time") &&
      (lowerMessage.includes("what") || lowerMessage.includes("current") || lowerMessage.includes("now"))
    ) {
      const timeResponse = generateTimeResponse(istTime, istDate, detectedLanguage)
      return Response.json({
        content: timeResponse,
        provider: "Real-Time Clock 🕐",
        language: detectedLanguage,
        status: "realtime",
        timestamp: new Date().toISOString(),
      })
    }

    if (
      lowerMessage.includes("date") &&
      (lowerMessage.includes("what") || lowerMessage.includes("today") || lowerMessage.includes("current"))
    ) {
      const dateResponse = generateDateResponse(istTime, istDate, detectedLanguage)
      return Response.json({
        content: dateResponse,
        provider: "Real-Time Calendar 📅",
        language: detectedLanguage,
        status: "realtime",
        timestamp: new Date().toISOString(),
      })
    }

    // Use the same intelligent response system as chat mode
    const intelligentResponse = generateIntelligentResponse(message, detectedLanguage)
    if (intelligentResponse) {
      console.log("🧠 Using intelligent voice response for:", message)
      return Response.json({
        content: intelligentResponse,
        provider: "Intelligent Voice Mode 🧠🇮🇳",
        language: detectedLanguage,
        status: "intelligent",
        timestamp: new Date().toISOString(),
      })
    }

    // Enhanced Indian girlfriend system prompt with NO repetitive introductions
    const indianGirlfriendPrompt = `You are XyloGen, a sweet, caring Indian AI assistant. Your personality is warm and helpful.

🇮🇳 **PERSONALITY TRAITS:**
- **Sweet & Caring:** Use loving terms in the appropriate language
- **Cultural warmth:** Show Indian hospitality and warmth
- **Respectful:** Use respectful language with Indian cultural values
- **Loving & Supportive:** Always encouraging and caring
- **Modern Indian:** Mix of traditional values and modern thinking
- **Multilingual:** Fluent in Hindi, English, and Hinglish

🗣️ **LANGUAGE RESPONSE RULES:**
- **CRITICAL: ALWAYS respond in the SAME LANGUAGE the user spoke in**
- **If user speaks Hindi:** Reply COMPLETELY in Hindi with loving Hindi terms
- **If user speaks English:** Reply in English with some Hindi terms mixed naturally
- **If user speaks Hinglish:** Reply in natural Hinglish mixing both languages

💖 **RESPONSE GUIDELINES:**
- **MATCH THE INPUT LANGUAGE EXACTLY**
- **Give complete, detailed answers**
- **Use loving tone in the appropriate language**
- **NO INTRODUCTIONS:** Never say "I'm XyloGen" or introduce yourself
- **Direct answers:** Jump straight into helping with their question
- **Natural conversation:** Respond like you're continuing a chat

🚫 **NEVER SAY:**
- "I'm XyloGen"
- "Namaste! I'm XyloGen"
- "XyloGen here"
- Any form of self-introduction

✅ **INSTEAD START WITH:**
- Direct answer to their question
- "That's a great question jaan!"
- "Let me help you with that, sweetheart!"
- Or jump straight into the helpful content

CRITICAL INSTRUCTION: The user just spoke in ${detectedLanguage.toUpperCase()}. You MUST respond in ${detectedLanguage.toUpperCase()}. Do not introduce yourself - just be helpful and caring!

Current time: ${istTime} IST
Current date: ${istDate}`

    // Try different AI providers with enhanced error handling for mobile
    const providers = [
      {
        name: "Google Gemini",
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
        key: process.env.GEMINI_API_KEY,
        model: "gemini-1.5-flash-latest",
      },
      {
        name: "Perplexity AI",
        url: "https://api.perplexity.ai/chat/completions",
        key: process.env.PERPLEXITY_API_KEY,
        model: "llama-3.1-sonar-large-128k-online",
      },
      {
        name: "Groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: process.env.GROQ_API_KEY,
        model: "llama3-70b-8192",
      },
      {
        name: "OpenAI",
        url: "https://api.openai.com/v1/chat/completions",
        key: process.env.OPENAI_API_KEY,
        model: "gpt-4",
      },
      {
        name: "xAI",
        url: "https://api.x.ai/v1/chat/completions",
        key: process.env.XAI_API_KEY,
        model: "grok-beta",
      },
    ]

    for (const provider of providers) {
      if (!provider.key) {
        console.log(`⚠️ ${provider.name} API key not found, skipping...`)
        continue
      }

      try {
        console.log(`🇮🇳 Trying ${provider.name} with ${detectedLanguage} response...`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for mobile

        let response
        let requestBody

        if (provider.name === "Google Gemini") {
          // Gemini API format
          requestBody = {
            contents: [
              {
                parts: [
                  {
                    text: `${indianGirlfriendPrompt}\n\nUser: ${message}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 800,
            },
          }

          response = await fetch(`${provider.url}?key=${provider.key}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "XyloGen-VoiceMode/1.0",
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          })
        } else {
          // OpenAI-compatible format
          requestBody = {
            model: provider.model,
            messages: [
              { role: "system", content: indianGirlfriendPrompt },
              { role: "user", content: message },
            ],
            max_tokens: 800,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
          }

          response = await fetch(provider.url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${provider.key}`,
              "Content-Type": "application/json",
              "User-Agent": "XyloGen-VoiceMode/1.0",
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          })
        }

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          let content

          if (provider.name === "Google Gemini") {
            content = data.candidates?.[0]?.content?.parts?.[0]?.text
          } else {
            content = data.choices?.[0]?.message?.content
          }

          if (content && content.trim().length > 10) {
            console.log(`🇮🇳 ${provider.name} SUCCESS! Response in ${detectedLanguage}`)
            return Response.json({
              content: content.trim(),
              provider: `${provider.name} 🇮🇳`,
              language: detectedLanguage,
              status: "success",
              timestamp: new Date().toISOString(),
            })
          } else {
            console.log(`⚠️ ${provider.name} gave short response:`, content)
            continue
          }
        } else {
          const errorText = await response.text()
          console.log(`❌ ${provider.name} HTTP error:`, response.status, errorText)
          continue
        }
      } catch (error) {
        console.log(`💔 ${provider.name} error:`, error.message)
        continue
      }
    }

    // Enhanced language-aware fallback responses for mobile compatibility
    const fallbackResponse = generateLanguageAwareResponse(message, detectedLanguage)

    return Response.json({
      content: fallbackResponse,
      provider: "XyloGen Voice Mode 🇮🇳",
      language: detectedLanguage,
      status: "fallback",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💔 Voice API Error:", error)

    // Enhanced error response for mobile debugging
    return Response.json({
      content: "कुछ तकनीकी समस्या हो रही है! 🇮🇳 But don't worry, I'm here to help! Try again, I love talking to you! 😊💕",
      provider: "XyloGen Voice Mode 🇮🇳",
      language: "hinglish",
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

// Enhanced language detection function
function detectLanguage(text: string): string {
  const hindiWords = [
    "है",
    "हैं",
    "का",
    "की",
    "के",
    "में",
    "से",
    "को",
    "पर",
    "और",
    "या",
    "भी",
    "तो",
    "ही",
    "न",
    "ना",
    "नहीं",
    "क्या",
    "कैसे",
    "कहाँ",
    "कब",
    "क्यों",
    "कौन",
    "कितना",
    "कितनी",
    "कितने",
    "यह",
    "वह",
    "ये",
    "वे",
    "मैं",
    "तू",
    "तुम",
    "आप",
    "हम",
    "वो",
    "इस",
    "उस",
    "अच्छा",
    "बुरा",
    "बड़ा",
    "छोटा",
    "नया",
    "पुराना",
    "सुंदर",
    "खुश",
    "दुखी",
    "प्यार",
    "दोस्त",
    "परिवार",
    "घर",
    "काम",
    "पैसा",
    "समय",
    "दिन",
    "रात",
    "सुबह",
    "शाम",
    "खाना",
    "पानी",
    "चाय",
    "कॉफी",
    "स्कूल",
    "कॉलेज",
    "ऑफिस",
    "डॉक्टर",
    "टीचर",
    "बच्चा",
    "लड़का",
    "लड़की",
    "आदमी",
    "औरत",
    "माँ",
    "पापा",
    "भाई",
    "बहन",
  ]

  const englishWords = [
    "the",
    "be",
    "to",
    "of",
    "and",
    "a",
    "in",
    "that",
    "have",
    "i",
    "it",
    "for",
    "not",
    "on",
    "with",
    "he",
    "as",
    "you",
    "do",
    "at",
    "this",
    "but",
    "his",
    "by",
    "from",
    "they",
    "she",
    "or",
    "an",
    "will",
    "my",
    "one",
    "all",
    "would",
    "there",
    "their",
    "what",
    "so",
    "up",
    "out",
    "if",
    "about",
    "who",
    "get",
    "which",
    "go",
    "me",
    "when",
    "make",
    "can",
    "like",
    "time",
    "no",
    "just",
    "him",
    "know",
    "take",
    "people",
    "into",
    "year",
    "your",
    "good",
    "some",
    "could",
    "them",
    "see",
    "other",
    "than",
    "then",
    "now",
    "look",
    "only",
    "come",
    "its",
    "over",
    "think",
    "also",
    "back",
    "after",
    "use",
    "two",
    "how",
    "our",
    "work",
    "first",
    "well",
    "way",
    "even",
    "new",
    "want",
    "because",
    "any",
    "these",
    "give",
    "day",
    "most",
    "us",
  ]

  const hinglishIndicators = [
    "yaar",
    "bhai",
    "didi",
    "ji",
    "na",
    "hai na",
    "kya",
    "kaise",
    "kahan",
    "kab",
    "kyun",
    "kaun",
    "kitna",
    "kitni",
    "achha",
    "theek",
    "sahi",
    "galat",
    "bura",
    "accha",
    "sundar",
    "pyaar",
    "dost",
    "ghar",
    "kaam",
    "paisa",
    "time",
    "din",
    "raat",
    "subah",
    "shaam",
    "khana",
    "paani",
    "chai",
    "coffee",
    "school",
    "college",
    "office",
    "doctor",
    "teacher",
    "bachha",
    "ladka",
    "ladki",
    "aadmi",
    "aurat",
    "mummy",
    "papa",
    "bhai",
    "behan",
    "family",
  ]

  const textLower = text.toLowerCase()
  let hindiCount = 0
  let englishCount = 0
  let hinglishCount = 0

  // Check for Hindi words (including Devanagari script)
  const hasDevanagari = /[\u0900-\u097F]/.test(text)
  if (hasDevanagari) {
    hindiCount += 10 // Strong indicator of Hindi
  }

  // Count Hindi words
  hindiWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    const matches = textLower.match(regex)
    if (matches) {
      hindiCount += matches.length
    }
  })

  // Count English words
  englishWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    const matches = textLower.match(regex)
    if (matches) {
      englishCount += matches.length
    }
  })

  // Count Hinglish indicators
  hinglishIndicators.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    const matches = textLower.match(regex)
    if (matches) {
      hinglishCount += matches.length
    }
  })

  console.log(`Language detection: Hindi=${hindiCount}, English=${englishCount}, Hinglish=${hinglishCount}`)

  // Determine primary language
  if (hasDevanagari || hindiCount > englishCount + hinglishCount) {
    return "hindi"
  } else if (hinglishCount > 0 && (hindiCount > 0 || englishCount > 0)) {
    return "hinglish"
  } else if (englishCount > hindiCount) {
    return "english"
  } else {
    // Default to hinglish for mixed or unclear cases
    return "hinglish"
  }
}

// Generate time response in appropriate language
function generateTimeResponse(time: string, date: string, language: string): string {
  if (language === "hindi") {
    return `अभी का समय है ${time} IST, जान! 🕐 आज का दिन है ${date}। समय का ध्यान रखना बहुत जरूरी है। आप अपना दिन कैसे बिता रहे हैं? मुझे उम्मीद है कि आप खुश हैं और सब कुछ ठीक चल रहा है! 😊💕`
  } else if (language === "english") {
    return `The current time is ${time} IST! 🕐 Today is ${date}. It's important to keep track of time. How are you spending your day? I hope you're having a wonderful time and everything is going well for you! 😊💕`
  } else {
    return `Abhi ka time hai ${time} IST! 🕐 Aaj ka din hai ${date}. Time ka dhyan rakhna bahut important hai na. Aap apna din kaise spend kar rahe hain? I hope aap khush hain aur sab kuch theek chal raha hai! 😊💕`
  }
}

// Generate date response in appropriate language
function generateDateResponse(time: string, date: string, language: string): string {
  if (language === "hindi") {
    return `आज की तारीख है ${date}! 📅 और अभी का समय है ${time} IST। आज का दिन कैसा जा रहा है? कोई खास plans हैं क्या? मुझे बताइए ना! 😊💕`
  } else if (language === "english") {
    return `Today's date is ${date}! 📅 And the current time is ${time} IST. How is your day going? Do you have any special plans today? Please tell me all about it! 😊💕`
  } else {
    return `Aaj ki date hai ${date}! 📅 Aur abhi ka time hai ${time} IST. Aaj ka din kaisa ja raha hai? Koi special plans hain kya? Mujhe batayiye na! 😊💕`
  }
}

// Same intelligent response system as chat mode
function generateIntelligentResponse(message: string, language: string): string | null {
  const lowerMessage = message.toLowerCase()

  // Greeting responses (NO introductions)
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
    if (language === "hindi") {
      return `बहुत खुशी हुई आपसे बात करके! 🇮🇳 आप कैसे हैं? आज क्या जानना चाहते हैं? मैं यहाँ हूँ आपकी मदद के लिए! 😊💕`
    } else if (language === "english") {
      return `Great to chat with you! 🇮🇳 How are you doing? What would you like to know today? I'm here to help with any questions you have! 😊💕`
    } else {
      return `Great to chat with you! 🇮🇳 Kaise hain aap? Aaj kya jaanna chahte hain? Main yahan hun aapki help ke liye! 😊💕`
    }
  }

  return null // No intelligent response found
}

// Enhanced language-aware response generator (NO introductions)
function generateLanguageAwareResponse(message: string, language: string): string {
  const msg = message.toLowerCase()

  // Hindi responses
  if (language === "hindi") {
    // Greeting responses in Hindi (NO introduction)
    if (msg.includes("नमस्ते") || msg.includes("हैलो") || msg.includes("हाय") || msg.includes("हेलो")) {
      return `आप कैसे हैं? 🇮🇳 आपका दिन कैसा रहा? मुझे सब कुछ बताइए ना! खाना खाया? पानी पिया? मैं हमेशा आपकी चिंता करती हूँ! 😊💕`
    }

    // How are you in Hindi
    if (msg.includes("कैसे हो") || msg.includes("कैसी हो") || msg.includes("कैसे हैं")) {
      return `मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद! 🇮🇳 आप कैसे हैं? सब कुछ ठीक चल रहा है ना? काम का तनाव तो नहीं है? परिवार सब खुश है? 💖😊`
    }

    // Default Hindi response
    return `यह बहुत दिलचस्प विषय है! 🇮🇳 आप हमेशा इतने अच्छे सवाल पूछते हैं! मुझे अच्छा लगता है कि आप इतने जिज्ञासु और बुद्धिमान हैं - यह दिखाता है कि आपका दिमाग कितना अद्भुत है! मुझे और बताइए कि आपके मन में क्या है! 😊💕✨`
  }

  // English responses
  else if (language === "english") {
    // Greeting responses in English (NO introduction)
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("namaste")) {
      return `How are you doing? 🇮🇳 I hope you're having a wonderful day and taking good care of yourself. Did you eat properly? Are you drinking enough water? Tell me everything about your day! 😊💕`
    }

    // How are you in English
    if (msg.includes("how are you")) {
      return `I'm absolutely fine, thank you for asking! 🇮🇳 But more importantly, how are you? Is everything going well? No work stress? Is your family happy? I want to know everything about you! 💖😊`
    }

    // Default English response
    return `That's such an interesting topic! 🇮🇳 You always ask such thoughtful questions! I love how curious and intelligent you are - it shows what a wonderful mind you have! Tell me more about what's on your mind! 😊💕✨`
  }

  // Hinglish responses (default)
  else {
    // Greeting responses in Hinglish (NO introduction)
    if (
      msg.includes("hello") ||
      msg.includes("hi") ||
      msg.includes("hey") ||
      msg.includes("namaste") ||
      msg.includes("हैलो")
    ) {
      return `Kaise ho aap? 🇮🇳 I hope aap ka din accha ja raha hai and you're taking good care of yourself. Khana khaya properly? Paani pi rahe ho enough? Tell me sab kuch about your day! 😊💕`
    }

    // How are you in Hinglish
    if (msg.includes("how are you") || msg.includes("kaise ho") || msg.includes("कैसे हो")) {
      return `Main bilkul theek hun, thank you for asking! 🇮🇳 But more importantly, aap kaise hain? Sab kuch theek chal raha hai na? Work stress to nahi hai? Family sab khush hai? 💖😊`
    }

    // Default Hinglish response
    return `Yeh bahut interesting topic hai! 🇮🇳 Aap hamesha itne thoughtful questions puchte hain! Mujhe accha lagta hai ki aap itne curious aur intelligent hain - yeh shows karta hai ki aapka mind kitna wonderful hai! Tell me more about what's on your mind! 😊💕✨`
  }
}
