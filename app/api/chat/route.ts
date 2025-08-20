import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, messages } = body

    console.log("🚀 API: Received message:", message)

    // Try Perplexity API first (best for real-time, factual responses)
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log("🔍 Trying Perplexity API...")

        const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [
              {
                role: "system",
                content:
                  "You are XyloGen, an advanced AI assistant from India. Provide comprehensive, detailed, and engaging responses with real information, examples, and practical insights. Include Indian context, career opportunities, and salary ranges when relevant. Make responses fascinating and informative like the best AI assistants.",
              },
              {
                role: "user",
                content: message,
              },
            ],
            max_tokens: 4000,
            temperature: 0.7,
            top_p: 0.9,
            return_citations: true,
            search_domain_filter: ["perplexity.ai"],
            return_images: false,
            return_related_questions: true,
            search_recency_filter: "month",
            top_k: 0,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 1,
          }),
        })

        if (perplexityResponse.ok) {
          const data = await perplexityResponse.json()
          console.log("✅ Perplexity API success!")

          return NextResponse.json({
            content: data.choices[0].message.content,
            related_questions: data.related_questions || [],
            citations: data.citations || [],
            provider: "Perplexity AI",
            status: "success",
          })
        }
      } catch (error) {
        console.log("❌ Perplexity API failed:", error)
      }
    }

    // Try Groq API (fast and smart)
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("🚀 Trying Groq API...")

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are XyloGen, an advanced AI assistant from India. Provide comprehensive, detailed, and engaging responses with real information, examples, and practical insights. Include Indian context, career opportunities, and salary ranges when relevant. Make responses fascinating and informative like ChatGPT or Perplexity. Always give real, factual information, not generic templates.",
              },
              {
                role: "user",
                content: message,
              },
            ],
            max_tokens: 4000,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
          }),
        })

        if (groqResponse.ok) {
          const data = await groqResponse.json()
          console.log("✅ Groq API success!")

          return NextResponse.json({
            content: data.choices[0].message.content,
            related_questions: generateSmartRelatedQuestions(message),
            citations: [],
            provider: "Groq AI",
            status: "success",
          })
        }
      } catch (error) {
        console.log("❌ Groq API failed:", error)
      }
    }

    // Try OpenAI API (most reliable)
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log("🧠 Trying OpenAI API...")

        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are XyloGen, an advanced AI assistant from India. Provide comprehensive, detailed, and engaging responses with real information, examples, and practical insights. Include Indian context, career opportunities, and salary ranges when relevant. Make responses fascinating and informative like the best AI assistants. Always give real, factual information.",
              },
              {
                role: "user",
                content: message,
              },
            ],
            max_tokens: 4000,
            temperature: 0.7,
            top_p: 0.9,
            stream: false,
          }),
        })

        if (openaiResponse.ok) {
          const data = await openaiResponse.json()
          console.log("✅ OpenAI API success!")

          return NextResponse.json({
            content: data.choices[0].message.content,
            related_questions: generateSmartRelatedQuestions(message),
            citations: [],
            provider: "OpenAI GPT-4",
            status: "success",
          })
        }
      } catch (error) {
        console.log("❌ OpenAI API failed:", error)
      }
    }

    // Try Gemini API (Google's AI)
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log("💎 Trying Gemini API...")

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are XyloGen, an advanced AI assistant from India. Provide comprehensive, detailed, and engaging responses with real information, examples, and practical insights. Include Indian context, career opportunities, and salary ranges when relevant. Make responses fascinating and informative like ChatGPT or Perplexity. Always give real, factual information.

User question: ${message}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4000,
              },
            }),
          },
        )

        if (geminiResponse.ok) {
          const data = await geminiResponse.json()
          console.log("✅ Gemini API success!")

          const content = data.candidates[0].content.parts[0].text

          return NextResponse.json({
            content: content,
            related_questions: generateSmartRelatedQuestions(message),
            citations: [],
            provider: "Google Gemini",
            status: "success",
          })
        }
      } catch (error) {
        console.log("❌ Gemini API failed:", error)
      }
    }

    // If all APIs fail, return error message
    console.log("💥 All AI APIs failed - no API keys available")

    return NextResponse.json({
      content: `🚨 **AI APIs Not Available** 

I need API keys to provide smart responses like ChatGPT or Perplexity. Currently available environment variables:
${
  Object.keys(process.env)
    .filter((key) => key.includes("API"))
    .join(", ") || "None found"
}

**To get smart responses, add one of these API keys:**
• **Perplexity API**: Best for real-time, factual responses
• **Groq API**: Fast and intelligent responses  
• **OpenAI API**: Most reliable, ChatGPT-quality responses
• **Gemini API**: Google's advanced AI

**How to add API keys:**
1. Get API key from provider website
2. Add to environment variables in deployment settings
3. Restart the application

Without API keys, I can only provide basic template responses. Add an API key to unlock my full potential! 🚀`,
      related_questions: [
        "How do I get a Perplexity API key?",
        "How do I get an OpenAI API key?",
        "How do I get a Groq API key?",
        "How do I add environment variables?",
      ],
      citations: [],
      provider: "System Message",
      status: "no_api_keys",
    })
  } catch (error) {
    console.error("💥 API Error:", error)
    return NextResponse.json(
      {
        content: "I encountered an error processing your request. Please try again.",
        related_questions: [],
        citations: [],
        provider: "Error Handler",
        status: "error",
      },
      { status: 500 },
    )
  }
}

function generateSmartRelatedQuestions(message: string): string[] {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("python")) {
    return [
      "What are the best Python frameworks for web development?",
      "How do I start a career in Python development?",
      "What's the salary range for Python developers in India?",
      "Which Python libraries should I learn first?",
    ]
  }

  if (lowerMessage.includes("machine learning") || lowerMessage.includes("ai")) {
    return [
      "What's the difference between AI and machine learning?",
      "How do I start learning machine learning?",
      "What are the career opportunities in AI in India?",
      "Which programming language is best for machine learning?",
    ]
  }

  if (lowerMessage.includes("embedded")) {
    return [
      "What programming languages are used for embedded systems?",
      "How do I start a career in embedded systems?",
      "What's the difference between Arduino and Raspberry Pi?",
      "What are the job opportunities in embedded systems in India?",
    ]
  }

  if (lowerMessage.includes("solar")) {
    return [
      "How much do solar panels cost in India?",
      "What government subsidies are available for solar?",
      "How do I calculate solar panel requirements for my home?",
      "What's the payback period for solar panels in India?",
    ]
  }

  return [
    "Can you explain this in more detail?",
    "What are the practical applications?",
    "How does this relate to career opportunities?",
    "What should I learn next about this topic?",
  ]
}
