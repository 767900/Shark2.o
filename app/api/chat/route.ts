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

      return Response.json({
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
        provider: "Shark 2.0 🕐 (Real-Time Clock)",
        status: "realtime",
      })
    }

    // Enhanced system prompt for better responses
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
            return Response.json({
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

    const smartResponse = generateIntelligentResponse(userMessage)

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

  // Embedded Systems - Detailed technical explanation
  if (
    message.includes("embedded system") ||
    message.includes("embedded systems") ||
    message.includes("what is embedded") ||
    message.includes("embaded") ||
    message.includes("embeded")
  ) {
    console.log("✅ Matched embedded systems pattern")
    return `🔧 **Embedded Systems - Complete Guide** 🔧

**🤖 What is an Embedded System?**

An **embedded system** is a specialized computer system designed to perform specific tasks within a larger mechanical or electronic system. Unlike general-purpose computers, embedded systems are dedicated to particular functions and are "embedded" as part of a complete device.

**🏗️ Key Characteristics:**

**1. Purpose-Built:**
• Designed for specific applications (not general computing)
• Optimized for particular tasks and requirements
• Limited functionality compared to general computers

**2. Real-Time Operation:**
• Must respond to inputs within strict time constraints
• Predictable and deterministic behavior
• Critical timing requirements for safety and performance

**3. Resource Constraints:**
• Limited memory (RAM/ROM)
• Restricted processing power
• Power efficiency requirements
• Size and cost limitations

**4. Reliability:**
• Must operate continuously for years
• Fault tolerance and error handling
• Minimal maintenance requirements

**⚙️ Core Components:**

**Hardware:**
• **Microcontroller/Microprocessor:** Brain of the system (ARM, AVR, PIC)
• **Memory:** RAM for data, ROM/Flash for program storage
• **Input/Output Interfaces:** Sensors, actuators, communication ports
• **Power Supply:** Battery, AC adapter, or power management unit
• **Clock/Timer:** For timing control and synchronization

**Software:**
• **Real-Time Operating System (RTOS):** FreeRTOS, VxWorks, QNX
• **Device Drivers:** Hardware abstraction layer
• **Application Software:** Main functionality code
• **Bootloader:** System initialization and startup

**🌟 Types of Embedded Systems:**

**1. Real-Time Systems:**
• **Hard Real-Time:** Missing deadlines causes system failure (airbag systems)
• **Soft Real-Time:** Performance degrades but system continues (video streaming)

**2. By Performance:**
• **Small Scale:** 8-bit microcontrollers, simple tasks
• **Medium Scale:** 16/32-bit processors, moderate complexity
• **Large Scale:** 64-bit processors, complex applications

**3. By Functionality:**
• **Stand-alone:** Independent operation (digital cameras)
• **Networked:** Connected systems (IoT devices)
• **Mobile:** Portable devices (smartphones, tablets)

**🚀 Common Applications:**

**Consumer Electronics:**
• **Smartphones & Tablets:** iOS, Android systems
• **Smart TVs:** Media processing and streaming
• **Home Appliances:** Washing machines, microwaves, refrigerators
• **Gaming Consoles:** PlayStation, Xbox, Nintendo Switch

**Automotive:**
• **Engine Control Units (ECU):** Fuel injection, ignition timing
• **Anti-lock Braking Systems (ABS):** Brake control
• **Infotainment Systems:** Navigation, entertainment
• **Advanced Driver Assistance (ADAS):** Collision avoidance

**Industrial:**
• **Programmable Logic Controllers (PLC):** Factory automation
• **SCADA Systems:** Supervisory control and data acquisition
• **Robotics:** Industrial robots and automation
• **Process Control:** Chemical plants, power generation

**Medical:**
• **Pacemakers:** Heart rhythm regulation
• **MRI Machines:** Medical imaging systems
• **Insulin Pumps:** Diabetes management
• **Patient Monitoring:** Vital signs tracking

**🛠️ Development Process:**

**1. Requirements Analysis:**
• Define functional and non-functional requirements
• Performance, power, cost, and size constraints
• Safety and reliability standards

**2. System Design:**
• Hardware/software partitioning
• Architecture selection
• Interface design

**3. Implementation:**
• Hardware design and PCB layout
• Software development and testing
• Integration and system testing

**4. Validation & Verification:**
• Unit testing and integration testing
• Performance and stress testing
• Compliance and certification

**💻 Programming Languages:**

**Low-Level:**
• **C:** Most popular for embedded systems
• **Assembly:** Direct hardware control
• **C++:** Object-oriented embedded development

**High-Level:**
• **Python:** MicroPython for microcontrollers
• **Java:** Java ME for embedded applications
• **Rust:** Memory-safe systems programming

**🔧 Development Tools:**

**IDEs:**
• **Keil MDK:** ARM-based development
• **MPLAB X:** Microchip PIC development
• **Arduino IDE:** Simplified embedded programming
• **PlatformIO:** Cross-platform development

**Debugging:**
• **JTAG/SWD:** Hardware debugging interfaces
• **Logic Analyzers:** Signal analysis
• **Oscilloscopes:** Timing and signal measurement
• **In-Circuit Emulators:** Real-time debugging

**🇮🇳 Embedded Systems in India:**

**Industry Growth:**
• **Market Size:** ₹1.2 lakh crore industry in India
• **Employment:** 3+ million professionals
• **Growth Rate:** 15-20% annually

**Key Sectors:**
• **Automotive:** Tata Motors, Mahindra, Bajaj Auto
• **Telecommunications:** Bharti Airtel, Reliance Jio
• **Defense:** DRDO, HAL, BEL
• **Space:** ISRO satellite and launch systems

**Education & Training:**
• **IITs/NITs:** Strong embedded systems programs
• **Industry Certifications:** ARM, Intel, Xilinx
• **Training Centers:** CDAC, Embedded Hash, Emertxe

**Major Companies:**
• **Global:** Intel, Qualcomm, Broadcom, Texas Instruments
• **Indian:** Wipro, Infosys, TCS, HCL Technologies
• **Startups:** Ather Energy, Detect Technologies

**🚀 Future Trends:**

**Emerging Technologies:**
• **IoT Integration:** Connected embedded devices
• **AI/ML at Edge:** On-device intelligence
• **5G Connectivity:** Ultra-low latency applications
• **Security:** Hardware-based security features

**Industry 4.0:**
• **Smart Manufacturing:** Intelligent factory systems
• **Predictive Maintenance:** AI-powered diagnostics
• **Digital Twins:** Virtual system modeling
• **Cyber-Physical Systems:** Integration of physical and digital

**💡 Getting Started:**

**For Beginners:**
1. **Learn C Programming:** Foundation for embedded development
2. **Start with Arduino:** Easy-to-use development platform
3. **Understand Electronics:** Basic circuits and components
4. **Practice Projects:** LED control, sensor reading, motor control

**Advanced Learning:**
1. **RTOS Concepts:** FreeRTOS, task scheduling
2. **Communication Protocols:** UART, SPI, I2C, CAN
3. **Hardware Design:** PCB design, signal integrity
4. **System Optimization:** Power, performance, memory

**🎯 Career Opportunities:**

**Job Roles:**
• **Embedded Software Engineer:** ₹4-15 LPA
• **Hardware Design Engineer:** ₹5-18 LPA
• **System Architect:** ₹12-25 LPA
• **Firmware Developer:** ₹4-12 LPA

**Skills in Demand:**
• C/C++ programming
• RTOS and real-time systems
• Hardware debugging
• Communication protocols
• Power optimization

Embedded systems are the invisible computers that power our modern world - from the smartphone in your pocket to the car you drive! They're everywhere, making our devices smarter, more efficient, and more connected. 🚀🇮🇳

**Want to dive deeper into any specific aspect of embedded systems?**`
  }

  // Machine Learning / AI Questions
  if (
    message.includes("machine learning") ||
    message.includes("artificial intelligence") ||
    message.includes("ai") ||
    message.includes("ml") ||
    message.includes("deep learning") ||
    message.includes("neural network")
  ) {
    console.log("✅ Matched AI/ML pattern")
    return `🤖 **Artificial Intelligence & Machine Learning - Complete Guide** 🤖

**🧠 What is Artificial Intelligence?**

Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think, learn, and make decisions like humans. It's a broad field that encompasses various techniques to make computers perform tasks that typically require human intelligence.

**🎯 Types of AI:**

**1. Narrow AI (Weak AI):**
• **Current Reality:** AI systems designed for specific tasks
• **Examples:** Siri, Google Translate, recommendation systems, chess programs
• **Capabilities:** Excellent at specific domains but limited scope
• **Limitations:** Cannot transfer knowledge between different tasks

**2. General AI (Strong AI):**
• **Future Goal:** Human-level intelligence across all cognitive tasks
• **Status:** Theoretical concept, not yet achieved
• **Timeline:** Experts debate anywhere from 10-50+ years
• **Challenges:** Consciousness, creativity, emotional intelligence

**3. Superintelligence:**
• **Hypothetical:** AI that surpasses human intelligence in all areas
• **Concerns:** Control, alignment with human values
• **Research:** Active area of AI safety and ethics research

**🔬 Machine Learning Fundamentals:**

**What is Machine Learning?**
Machine Learning is a subset of AI that enables computers to learn and improve from experience (data) without being explicitly programmed for every scenario. Instead of following pre-programmed instructions, ML systems identify patterns in data and make predictions or decisions.

**🎯 Types of Machine Learning:**

**1. Supervised Learning:**
• **Training Data:** Labeled examples (input-output pairs)
• **Goal:** Learn to predict correct outputs for new inputs
• **Examples:** 
  - Email spam detection (emails labeled as spam/not spam)
  - Image classification (photos labeled with objects)
  - Medical diagnosis (symptoms → disease predictions)
• **Popular Algorithms:** Linear regression, decision trees, random forest, neural networks

**2. Unsupervised Learning:**
• **Training Data:** Unlabeled data, algorithm finds hidden patterns
• **Goal:** Discover structure and relationships in data
• **Examples:**
  - Customer segmentation (grouping customers by behavior)
  - Anomaly detection (finding unusual patterns)
  - Data compression and dimensionality reduction
• **Popular Algorithms:** K-means clustering, hierarchical clustering, PCA

**3. Reinforcement Learning:**
• **Training Method:** Learn through trial and error with rewards/penalties
• **Goal:** Maximize cumulative reward in an environment
• **Examples:**
  - Game playing (AlphaGo, chess, video games)
  - Robotics (robot learning to walk, manipulate objects)
  - Autonomous vehicles (learning to drive safely)
• **Popular Algorithms:** Q-learning, policy gradients, actor-critic methods

**🧠 Deep Learning Revolution:**

**Neural Networks Basics:**
• **Inspiration:** Loosely based on biological neural networks in the brain
• **Structure:** Layers of interconnected nodes (neurons)
• **Learning:** Adjusts connection weights based on training data
• **Power:** Can automatically learn complex patterns and representations

**Deep Learning Architectures:**

**1. Convolutional Neural Networks (CNNs):**
• **Specialty:** Image and visual data processing
• **Key Feature:** Spatial pattern recognition through convolution operations
• **Applications:**
  - Image classification and object detection
  - Medical imaging (X-rays, MRIs, CT scans)
  - Autonomous vehicle vision systems
  - Facial recognition and biometric systems

**2. Recurrent Neural Networks (RNNs):**
• **Specialty:** Sequential data and time series
• **Key Feature:** Memory of previous inputs through recurrent connections
• **Variants:** LSTM (Long Short-Term Memory), GRU (Gated Recurrent Unit)
• **Applications:**
  - Language translation and text generation
  - Speech recognition and synthesis
  - Stock price prediction and financial modeling
  - Music and audio generation

**3. Transformer Networks:**
• **Breakthrough:** Attention mechanism for understanding relationships
• **Key Innovation:** Parallel processing and long-range dependencies
• **Famous Models:** GPT (ChatGPT), BERT, T5, PaLM
• **Applications:**
  - Large language models and chatbots
  - Machine translation (Google Translate)
  - Code generation and programming assistance
  - Multimodal AI (text + images)

**🚀 Current AI Applications:**

**Natural Language Processing (NLP):**
• **Chatbots & Virtual Assistants:** ChatGPT, Claude, Siri, Alexa
• **Language Translation:** Google Translate, DeepL
• **Content Generation:** Writing assistance, code generation, creative writing
• **Text Analysis:** Sentiment analysis, document summarization, information extraction

**Computer Vision:**
• **Image Recognition:** Photo tagging, content moderation
• **Object Detection:** Autonomous vehicles, security systems, retail analytics
• **Medical Imaging:** Cancer detection, diagnostic assistance
• **Generative AI:** DALL-E, Midjourney, Stable Diffusion for image creation

**Recommendation Systems:**
• **E-commerce:** Amazon, Flipkart product recommendations
• **Entertainment:** Netflix movies, Spotify music, YouTube videos
• **Social Media:** Facebook feed, Instagram posts, Twitter timeline
• **News & Content:** Google News, personalized article suggestions

**🛠️ AI/ML Tools & Technologies:**

**Programming Languages:**
• **Python:** Most popular, extensive libraries (scikit-learn, TensorFlow, PyTorch)
• **R:** Statistical analysis and data science
• **Julia:** High-performance scientific computing
• **JavaScript:** TensorFlow.js for web-based ML
• **C++:** High-performance inference and optimization

**Popular Frameworks & Libraries:**
• **TensorFlow:** Google's comprehensive ML platform
• **PyTorch:** Facebook's research-friendly deep learning framework
• **Scikit-learn:** Traditional machine learning algorithms
• **Keras:** High-level neural network API
• **OpenCV:** Computer vision and image processing
• **NLTK/spaCy:** Natural language processing
• **Pandas/NumPy:** Data manipulation and numerical computing

**Cloud AI Platforms:**
• **Google Cloud AI:** AutoML, Vertex AI, pre-trained models
• **Amazon Web Services:** SageMaker, comprehensive AI services
• **Microsoft Azure:** Cognitive Services, Machine Learning Studio
• **IBM Watson:** Enterprise AI solutions

**🇮🇳 AI in India - Comprehensive Overview:**

**Government Initiatives:**
• **National AI Strategy:** ₹7,500 crore investment announced
• **Digital India Mission:** AI for governance and public services
• **NITI Aayog:** National AI portal and policy framework
• **AI for All:** Democratizing AI education and access

**Industry Adoption:**
• **IT Services Giants:** TCS, Infosys, Wipro offering AI solutions globally
• **Startups Ecosystem:** 
  - Ola (ride optimization, demand prediction)
  - Swiggy/Zomato (delivery optimization, recommendation systems)
  - Paytm (fraud detection, credit scoring)
  - Byju's (personalized learning, adaptive content)

**Key Sectors:**
• **Healthcare:** AI for diagnostics, drug discovery, telemedicine
• **Agriculture:** Precision farming, crop monitoring, yield prediction
• **Finance:** Algorithmic trading, risk assessment, fraud detection
• **Manufacturing:** Predictive maintenance, quality control, supply chain optimization

**Research & Education:**
• **Premier Institutions:** IITs, IISc, ISI leading AI research
• **Industry Research Labs:** 
  - Microsoft Research India (Bangalore, Hyderabad)
  - Google AI India
  - IBM Research India
  - Adobe Research India

**Career Opportunities & Salaries:**
• **Machine Learning Engineer:** ₹6-25 LPA
• **Data Scientist:** ₹5-20 LPA
• **AI Research Scientist:** ₹10-40 LPA
• **Computer Vision Engineer:** ₹7-22 LPA
• **NLP Engineer:** ₹8-24 LPA
• **AI Product Manager:** ₹12-30 LPA

**🎯 Complete Learning Path:**

**Beginner Level (3-6 months):**
1. **Mathematics Foundation:**
   - Linear algebra (vectors, matrices, eigenvalues)
   - Statistics and probability
   - Basic calculus (derivatives, gradients)

2. **Programming Skills:**
   - Python programming fundamentals
   - Data structures and algorithms
   - Libraries: NumPy, Pandas, Matplotlib

3. **First ML Projects:**
   - House price prediction (regression)
   - Email spam classification
   - Customer segmentation

**Intermediate Level (6-12 months):**
1. **Core ML Algorithms:**
   - Understand various algorithms deeply
   - When to use which algorithm
   - Model evaluation and validation

2. **Deep Learning Basics:**
   - Neural network fundamentals
   - TensorFlow or PyTorch
   - CNN for image tasks, RNN for sequences

3. **Specialization Choice:**
   - Computer Vision
   - Natural Language Processing
   - Time Series Analysis
   - Reinforcement Learning

**Advanced Level (1-2 years):**
1. **Research & Development:**
   - Read and implement research papers
   - Contribute to open-source projects
   - Develop novel approaches

2. **MLOps & Production:**
   - Model deployment and serving
   - Monitoring and maintenance
   - Scalability and performance optimization

3. **Domain Expertise:**
   - Become expert in specific AI application area
   - Industry knowledge and business understanding

**🔮 Future of AI - Trends & Opportunities:**

**Emerging Technologies:**
• **Multimodal AI:** Systems understanding text, images, audio, video
• **Edge AI:** AI processing on mobile devices and IoT
• **Explainable AI:** Making AI decisions interpretable and trustworthy
• **AI Safety & Alignment:** Ensuring AI systems are safe and beneficial

**Industry Transformations:**
• **Healthcare:** Personalized medicine, drug discovery, diagnostic assistance
• **Education:** Adaptive learning, intelligent tutoring systems
• **Transportation:** Autonomous vehicles, traffic optimization
• **Climate:** Environmental monitoring, renewable energy optimization

**Challenges & Considerations:**
• **Data Privacy:** Protecting user information and maintaining trust
• **Bias & Fairness:** Ensuring AI systems are equitable across demographics
• **Job Market:** Managing workforce transitions and reskilling
• **Regulation:** Developing appropriate AI governance frameworks

**💡 Getting Started Today:**

**Immediate Actions:**
1. **Take Andrew Ng's Machine Learning Course** on Coursera
2. **Practice on Kaggle:** Competitions and datasets
3. **Build Portfolio Projects:** Start simple, gradually increase complexity
4. **Join Communities:** Reddit r/MachineLearning, local AI meetups
5. **Stay Updated:** Follow AI researchers on Twitter, read papers on arXiv

**Free Resources:**
• **Online Courses:** Coursera, edX, Udacity, NPTEL
• **Books:** "Hands-On Machine Learning" by Aurélien Géron
• **Datasets:** Kaggle, UCI ML Repository, Google Dataset Search
• **Practice Platforms:** Google Colab, Jupyter notebooks

AI and Machine Learning are transforming every industry and creating unprecedented opportunities. The field is rapidly evolving, making it an incredibly exciting time to learn and contribute to this revolutionary technology! 🚀🇮🇳

**What specific aspect of AI/ML would you like to explore further?** I can provide deeper insights into any particular area!`
  }

  // Programming Questions
  if (
    message.includes("programming") ||
    message.includes("coding") ||
    message.includes("python") ||
    message.includes("javascript") ||
    message.includes("java") ||
    message.includes("c++") ||
    message.includes("react") ||
    message.includes("web development")
  ) {
    console.log("✅ Matched programming pattern")
    return `💻 **Programming & Software Development - Complete Guide** 💻

**🚀 What is Programming?**

Programming is the process of creating instructions for computers to execute. It involves writing code in specific programming languages to solve problems, automate tasks, and build applications that make our digital world function.

**🌟 Popular Programming Languages:**

**🐍 Python:**
• **Strengths:** 
  - Easy-to-read syntax, beginner-friendly
  - Vast ecosystem of libraries and frameworks
  - Excellent for data science, AI/ML, automation
  - Strong community support and documentation

• **Use Cases:**
  - Web development (Django, Flask)
  - Data analysis and visualization
  - Machine learning and AI
  - Automation and scripting
  - Scientific computing

• **Learning Curve:** Beginner-friendly, great first language
• **Career Prospects in India:** ₹4-20 LPA, high demand in data science and backend development
• **Popular Companies:** Google, Netflix, Instagram, Spotify

**☕ JavaScript:**
• **Strengths:**
  - Essential for web development
  - Full-stack capability (frontend + backend)
  - Large ecosystem (npm packages)
  - Immediate visual feedback in browsers

• **Use Cases:**
  - Frontend development (React, Vue, Angular)
  - Backend development (Node.js)
  - Mobile apps (React Native)
  - Desktop applications (Electron)

• **Learning Curve:** Moderate, essential for web development
• **Career Prospects in India:** ₹3-18 LPA, excellent demand
• **Popular Companies:** Facebook, Airbnb, WhatsApp, Flipkart

**🔧 Java:**
• **Strengths:**
  - Platform independence ("Write once, run anywhere")
  - Strong object-oriented programming
  - Enterprise-grade applications
  - Android app development

• **Use Cases:**
  - Enterprise software development
  - Android mobile applications
  - Web backends (Spring framework)
  - Big data processing (Apache Spark)

• **Learning Curve:** Moderate, requires understanding OOP concepts
• **Career Prospects in India:** ₹4-16 LPA, stable demand in enterprises
• **Popular Companies:** Oracle, IBM, TCS, Infosys

**⚡ C++:**
• **Strengths:**
  - High performance and efficiency
  - System-level programming
  - Game development capabilities
  - Direct hardware control

• **Use Cases:**
  - Operating systems and system software
  - Game development (Unreal Engine)
  - Embedded systems programming
  - High-frequency trading systems

• **Learning Curve:** Steep, requires memory management knowledge
• **Career Prospects in India:** ₹5-22 LPA, specialized high-paying roles
• **Popular Companies:** Microsoft, Adobe, gaming companies

**🎯 Web Development Frameworks:**

**Frontend Frameworks:**

**⚛️ React:**
• **Created by:** Facebook
• **Strengths:** Component-based architecture, virtual DOM, large ecosystem
• **Use Cases:** Single-page applications, complex user interfaces
• **Learning Path:** HTML/CSS → JavaScript → React fundamentals → Redux/Context API

**🟢 Vue.js:**
• **Strengths:** Gentle learning curve, excellent documentation, progressive adoption
• **Use Cases:** Both simple and complex applications
• **Ideal for:** Developers transitioning from jQuery or beginners

**🅰️ Angular:**
• **Created by:** Google
• **Strengths:** Full-featured framework, TypeScript integration, enterprise-ready
• **Use Cases:** Large-scale enterprise applications
• **Learning Curve:** Steeper, but comprehensive

**Backend Frameworks:**

**🟢 Node.js:**
• **Strengths:** JavaScript everywhere, non-blocking I/O, npm ecosystem
• **Popular Frameworks:** Express.js, Nest.js, Fastify
• **Use Cases:** APIs, real-time applications, microservices

**🐍 Django (Python):**
• **Strengths:** "Batteries included" philosophy, rapid development, security features
• **Use Cases:** Web applications, content management, e-commerce

**🍃 Spring Boot (Java):**
• **Strengths:** Enterprise-grade, microservices architecture, extensive ecosystem
• **Use Cases:** Large-scale enterprise applications, microservices

**🛠️ Essential Development Tools:**

**Code Editors & IDEs:**
• **Visual Studio Code:** Free, extensible, great for all languages
• **IntelliJ IDEA:** Powerful IDE for Java, Kotlin, and other JVM languages
• **PyCharm:** Python-specific IDE with advanced debugging and testing
• **Sublime Text:** Fast, lightweight editor with powerful features

**Version Control:**
• **Git:** Distributed version control system (essential skill)
• **GitHub:** Code hosting, collaboration, and portfolio showcase
• **GitLab:** DevOps platform with integrated CI/CD
• **Bitbucket:** Atlassian's Git solution with Jira integration

**Database Technologies:**
• **Relational:** MySQL, PostgreSQL, SQLite
• **NoSQL:** MongoDB, Redis, Cassandra
• **Cloud:** AWS RDS, Google Cloud SQL, Azure Database

**🇮🇳 Programming Career in India:**

**Top Tech Hubs:**
• **Bangalore:** Silicon Valley of India, highest concentration of tech companies
  - Companies: Google, Microsoft, Amazon, Flipkart, Ola
  - Average salary: 20-30% higher than other cities
  - Startup ecosystem: Highest number of unicorns

• **Hyderabad:** Cyberabad with major tech presence
  - Companies: Microsoft (largest campus outside US), Google, Amazon
  - Government support: Telangana government's IT-friendly policies
  - Cost of living: Lower than Bangalore with good opportunities

• **Pune:** Growing IT sector with work-life balance
  - Companies: TCS, Infosys, Persistent Systems
  - Education: Strong engineering colleges nearby
  - Culture: Good blend of traditional and modern

• **Chennai:** Detroit of India, strong in automotive and embedded
  - Companies: Ford, BMW, Bosch (automotive tech)
  - Specialization: Embedded systems, automotive software
  - Stability: Established IT sector with steady growth

• **Delhi NCR (Gurgaon/Noida):** Corporate headquarters and fintech
  - Companies: Paytm, PolicyBazaar, American Express
  - Specialization: Fintech, e-commerce, enterprise software
  - Opportunities: Close to decision-makers and business leaders

**Salary Ranges (2024 Updated):**
• **Fresher (0-1 years):** ₹3-8 LPA
• **Junior Developer (1-3 years):** ₹6-12 LPA
• **Mid-level (3-6 years):** ₹10-18 LPA
• **Senior Developer (6-10 years):** ₹15-28 LPA
• **Tech Lead/Architect (10+ years):** ₹25-50+ LPA
• **Principal Engineer:** ₹40-80+ LPA

**🚀 Complete Learning Path:**

**Phase 1: Foundation (2-3 months)**
1. **Choose Your First Language:**
   - **For beginners:** Python (easiest syntax)
   - **For web development:** JavaScript
   - **For mobile apps:** Java/Kotlin or Swift
   - **For system programming:** C++

2. **Core Programming Concepts:**
   - Variables, data types, operators
   - Control structures (if/else, loops)
   - Functions and modular programming
   - Data structures (arrays, lists, dictionaries)
   - Object-oriented programming basics

3. **Development Environment:**
   - Install and configure IDE/editor
   - Learn basic command line operations
   - Set up version control (Git)

**Phase 2: Intermediate Skills (3-6 months)**
1. **Advanced Programming:**
   - Object-oriented design patterns
   - Error handling and debugging
   - File I/O and data persistence
   - API integration and HTTP requests

2. **Database Fundamentals:**
   - SQL basics (SELECT, INSERT, UPDATE, DELETE)
   - Database design and normalization
   - Working with databases from code

3. **Web Development Basics:**
   - HTML5 and CSS3
   - Responsive design principles
   - JavaScript DOM manipulation
   - Basic frontend framework (React/Vue)

**Phase 3: Specialization (6-12 months)**
1. **Choose Your Path:**
   - **Frontend:** Advanced React/Vue, state management, testing
   - **Backend:** API design, authentication, database optimization
   - **Full-Stack:** Combine frontend and backend skills
   - **Mobile:** React Native, Flutter, or native development
   - **Data Science:** Python libraries, machine learning basics

2. **Professional Skills:**
   - Code review and collaboration
   - Testing (unit tests, integration tests)
   - Deployment and DevOps basics
   - Performance optimization

**Phase 4: Advanced & Career (1+ years)**
1. **System Design:**
   - Scalability and performance
   - Microservices architecture
   - Cloud platforms (AWS, Azure, GCP)
   - Security best practices

2. **Leadership & Business:**
   - Project management
   - Team collaboration
   - Understanding business requirements
   - Technical communication

**💡 Pro Tips for Success:**

**Building Your Portfolio:**
• **GitHub Profile:** Showcase your best projects with clear documentation
• **Personal Website:** Demonstrate your web development skills
• **Open Source Contributions:** Contribute to existing projects
• **Blog Writing:** Share your learning journey and technical insights

**Networking & Community:**
• **Local Meetups:** Attend programming meetups in your city
• **Online Communities:** Stack Overflow, Reddit, Discord servers
• **Conferences:** Attend tech conferences and workshops
• **Mentorship:** Find mentors and also mentor others

**Continuous Learning:**
• **Stay Updated:** Follow tech blogs, podcasts, and newsletters
• **Practice Regularly:** Code every day, even if just for 30 minutes
• **Build Projects:** Create applications that solve real problems
• **Learn from Others:** Read other people's code and learn different approaches

**🎯 Trending Technologies (2024):**

**Hot Technologies:**
• **AI/ML Integration:** Adding AI features to applications
• **Cloud Computing:** AWS, Azure, Google Cloud certifications
• **DevOps:** Docker, Kubernetes, CI/CD pipelines
• **Mobile Development:** Flutter, React Native for cross-platform
• **Blockchain:** Web3, smart contracts, DeFi applications

**Emerging Fields:**
• **Edge Computing:** Processing data closer to users
• **IoT Development:** Internet of Things applications
• **AR/VR Development:** Augmented and virtual reality
• **Quantum Computing:** Early-stage but promising future
• **Cybersecurity:** Growing demand for secure applications

**🌟 Success Stories from India:**

**Global Indian Tech Leaders:**
• **Sundar Pichai (Google CEO):** Started as a software engineer
• **Satya Nadella (Microsoft CEO):** Engineering background from India
• **Parag Agrawal (Former Twitter CEO):** IIT graduate, started in engineering
• **Shantanu Narayen (Adobe CEO):** Computer science background

**Indian Startup Success:**
• **Flipkart:** Started by IIT graduates, sold to Walmart for $16 billion
• **Ola:** Built by engineering graduates, revolutionized transportation
• **Paytm:** Created digital payments ecosystem in India
• **Byju's:** EdTech unicorn built by passionate educators and engineers

Programming is not just about writing code - it's about solving problems, creating value, and building the future. The field offers incredible opportunities for creativity, impact, and financial success. With India's growing tech ecosystem, there has never been a better time to start your programming journey! 🚀🇮🇳

**What specific programming area interests you most?** I can provide detailed guidance on any particular technology or career path!`
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
    return `🙏 **Namaste! Welcome to Shark 2.0!** 🙏\n\n🦈 **I'm your intelligent AI assistant from India!** 🇮🇳\n\n**I can help you with:**\n• 📚 **Educational topics** - Science, math, history, literature\n• 💻 **Technology & Programming** - Coding, AI, software development\n• 🇮🇳 **Indian culture & knowledge** - Traditions, languages, history\n• 🧠 **Problem solving** - Analysis, advice, explanations\n• 🎯 **General knowledge** - Wide range of topics and questions\n• 📸 **Image analysis** - Upload photos for detailed analysis\n• 🕐 **Real-time info** - Current time, date, and live information\n\n**Try asking me:**\n• "What time is it now?"\n• "What is embedded system?"\n• "Explain machine learning"\n• "Tell me about Python programming"\n• "What are Indian festivals?"\n• "How does React work?"\n\n🚀 **What would you like to know today?**`
  }

  // Indian culture questions
  if (
    message.includes("india") ||
    message.includes("indian") ||
    message.includes("culture") ||
    message.includes("festival") ||
    message.includes("tradition") ||
    message.includes("diwali") ||
    message.includes("holi") ||
    message.includes("bollywood")
  ) {
    console.log("✅ Matched Indian culture pattern")
    return `🇮🇳 **Indian Culture & Heritage - Complete Guide** 🇮🇳\n\n**🕉️ Incredible India - Cultural Diversity:**\n\n**🎭 Major Festivals:**\n\n**Diwali (Festival of Lights):**\n• **Significance:** Victory of light over darkness, good over evil\n• **Duration:** 5 days in October/November\n• **Traditions:** Oil lamps, fireworks, sweets, family gatherings\n• **Regional Variations:** Different customs across states\n\n**Holi (Festival of Colors):**\n• **Significance:** Arrival of spring, triumph of good over evil\n• **Celebration:** Throwing colored powders, water balloons\n• **Famous Locations:** Mathura, Vrindavan, Barsana\n• **Cultural Impact:** Breaks social barriers, promotes unity\n\n**🍛 Regional Cuisines:**\n\n**North Indian:**\n• **Staples:** Wheat (roti, naan), dairy products\n• **Famous Dishes:** Butter chicken, dal makhani, biryani\n• **Cooking Style:** Rich gravies, tandoor cooking\n\n**South Indian:**\n• **Staples:** Rice, coconut, curry leaves\n• **Famous Dishes:** Dosa, idli, sambar, rasam\n• **Variety:** Each state has distinct flavors\n\n**🗣️ Languages & Literature:**\n• **22 Official Languages:** Constitutional recognition\n• **Hindi:** Spoken by 40%+ population\n• **English:** Administrative and business language\n• **Regional Diversity:** Over 1,600 languages spoken\n\n**🎨 Arts & Crafts:**\n• **Classical Dance:** Bharatanatyam, Kathak, Odissi, Kuchipudi\n• **Music:** Hindustani (North), Carnatic (South)\n• **Visual Arts:** Madhubani, Warli, Tanjore paintings\n• **Textiles:** Silk sarees, block printing, embroidery\n\n**🚀 Modern India:**\n• **IT Revolution:** Bangalore, Hyderabad tech hubs\n• **Space Program:** ISRO, Mars mission, cost-effective launches\n• **Startup Ecosystem:** Unicorns, digital innovation\n• **Global Influence:** Yoga, Ayurveda, spirituality worldwide\n\n**What aspect of Indian culture interests you most?** 🇮🇳`
  }

  // Default intelligent response for any other question
  console.log("🔄 Using default intelligent response for:", message)
  return `🦈 **Shark 2.0 - Intelligent Assistant** 🦈\n\n**Your Question:** "${userMessage}"\n\n🧠 **I'm here to provide comprehensive answers!**\n\nI understand you're asking about "${userMessage}". While I'm working in smart mode without real-time APIs, I can still provide detailed, intelligent insights based on my knowledge.\n\n**🔍 What I can help you understand:**\n\n**Technology & Programming:**\n• Programming languages (Python, JavaScript, Java, C++)\n• Web development frameworks (React, Vue, Angular, Django)\n• Software engineering concepts and best practices\n• Career guidance and industry trends\n• Code examples and implementation strategies\n\n**Science & Education:**\n• Complex concepts broken down into understandable parts\n• Real-world applications and examples\n• Mathematical and scientific principles\n• Learning resources and study strategies\n\n**Indian Context & Culture:**\n• Cultural traditions, festivals, and customs\n• Indian technology industry and opportunities\n• Educational institutions and career paths\n• Regional diversity and local insights\n\n**Real-Time Information:**\n• Current time and date (just ask "What time is it?")\n• Live clock with Indian Standard Time\n• Date information and calendar details\n\n**🚀 To get the most detailed answer:**\n\n1. **Be specific:** Ask about particular aspects you want to understand\n2. **Provide context:** Let me know your background or use case\n3. **Ask follow-ups:** I can dive deeper into any area of interest\n4. **Request examples:** I can provide practical illustrations and code samples\n\n**💡 Try rephrasing your question like:**\n• "Explain [topic] in simple terms with examples"\n• "What are the key concepts in [subject]?"\n• "How does [technology/process] work step by step?"\n• "What are the practical applications of [concept]?"\n• "What should I know about [topic] for career in India?"\n\n**🇮🇳 Enhanced with Indian Perspective:**\nI always provide relevant Indian context, including:\n• Local career opportunities and salary ranges\n• Indian companies and market conditions\n• Educational resources available in India\n• Cultural significance and regional variations\n• Government initiatives and industry trends\n\n**🔧 For Enhanced Capabilities:**\nAdd API keys for real-time information:\n• **Perplexity AI:** Current events and real-time search\n• **Google Gemini:** Advanced AI understanding (ACTIVE!)\n• **Groq:** Fast AI responses\n• **SERP API:** Image analysis and web search\n\n**I'm ready to provide detailed, intelligent explanations on any topic!** Whether you're interested in learning programming, understanding complex technologies, exploring career options, or diving into Indian culture and opportunities.\n\n**What specific aspect would you like me to elaborate on?** 🚀🇮🇳`
}
