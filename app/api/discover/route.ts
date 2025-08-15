export async function POST(request: Request) {
  try {
    console.log("🌐 Discover API - Fetching latest news...")

    const body = await request.json()
    const { category = "For You", lastFetch = 0, requestTime = Date.now() } = body

    // Map categories to search queries with time-based variations
    const getSearchQuery = (category: string, isRefresh: boolean) => {
      const baseQueries = {
        "For You": isRefresh ? "breaking news latest updates today worldwide" : "latest breaking news today global",
        "Top Stories": isRefresh ? "top headlines breaking news now international" : "top news headlines today world",
        "Tech & Science": isRefresh
          ? "latest technology science AI news updates breakthrough"
          : "technology science AI news today innovation",
        Business: isRefresh
          ? "business finance stock market breaking news today"
          : "business finance economy news today",
        Sports: isRefresh ? "sports news latest updates cricket football today" : "sports news today cricket football",
        Entertainment: isRefresh
          ? "entertainment celebrity bollywood hollywood news latest"
          : "entertainment celebrity news today movies",
      }
      return baseQueries[category as keyof typeof baseQueries] || "latest news today"
    }

    const isRefresh = lastFetch > 0
    const searchQuery = getSearchQuery(category, isRefresh)

    // Try Perplexity API for real-time news
    if (process.env.PERPLEXITY_API_KEY) {
      try {
        console.log(`🔍 ${isRefresh ? "Refreshing" : "Searching"} for: ${searchQuery}`)

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: [
              {
                role: "user",
                content: `Find the very latest ${searchQuery}. I need comprehensive news coverage with at least 15-20 recent news stories from the last 24 hours. For each news story, provide: title, brief description, source, and estimated time (like "2 hours ago", "30 minutes ago"). Include a mix of breaking news, trending stories, and important updates. Cover different topics within the category. Format as a structured list with clear numbering. Focus on current events that are happening RIGHT NOW and include diverse sources and perspectives.`,
              },
            ],
            max_tokens: 4000,
            temperature: 0.2,
            return_citations: true,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const newsContent = data.choices?.[0]?.message?.content || ""
          const citations = data.citations || []

          console.log("✅ Perplexity news fetch successful!")

          // Parse the news content and create articles
          const articles = parseNewsContent(newsContent, citations, category, requestTime)

          return Response.json({
            articles: articles,
            category: category,
            source: "Perplexity AI",
            timestamp: new Date().toISOString(),
            requestTime: requestTime,
            isRefresh: isRefresh,
            status: "success",
          })
        }
      } catch (error) {
        console.log("❌ Perplexity API error:", error.message)
      }
    }

    // Enhanced fallback with LOTS more articles
    console.log("📰 Using comprehensive demo articles as fallback...")
    const demoArticles = getComprehensiveDemoArticles(category, requestTime, isRefresh)

    return Response.json({
      articles: demoArticles,
      category: category,
      source: "Demo Content",
      timestamp: new Date().toISOString(),
      requestTime: requestTime,
      isRefresh: isRefresh,
      status: "fallback",
      note: "Add PERPLEXITY_API_KEY for real-time news updates",
    })
  } catch (error) {
    console.error("💥 Discover API error:", error)

    return Response.json(
      {
        error: "Failed to fetch news",
        articles: getComprehensiveDemoArticles("For You", Date.now(), false),
        category: "For You",
        source: "Error Fallback",
        timestamp: new Date().toISOString(),
        status: "error",
      },
      { status: 500 },
    )
  }
}

function parseNewsContent(content: string, citations: any[], category: string, requestTime: number) {
  const articles = []
  const lines = content.split("\n").filter((line) => line.trim())

  let currentArticle: any = {}
  let articleCount = 0

  for (const line of lines) {
    if (
      line.match(/^\d+\./) || // Matches "1.", "2.", etc.
      line.includes("**") || // Bold titles
      line.toLowerCase().includes("breaking:")
    ) {
      if (currentArticle.title) {
        articles.push({
          id: `news-${requestTime}-${articleCount}`,
          title: currentArticle.title || "Breaking News",
          description: currentArticle.description || "Latest news update",
          image: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(currentArticle.title || "news")}`,
          source: currentArticle.source || getRandomSource(),
          url: citations[articleCount]?.url || "#",
          publishedAt: currentArticle.time || getRandomRecentTime(),
          category: category,
          timestamp: requestTime - articleCount * 1000,
        })
        articleCount++
      }
      currentArticle = { title: line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "") }
    } else if (line.toLowerCase().includes("source:")) {
      currentArticle.source = line.replace(/source:\s*/i, "")
    } else if (line.toLowerCase().includes("time:") || line.includes("ago")) {
      currentArticle.time = line.replace(/time:\s*/i, "")
    } else if (currentArticle.title && !currentArticle.description && line.length > 20) {
      currentArticle.description = line
    }
  }

  // Add the last article
  if (currentArticle.title && articleCount < 20) {
    articles.push({
      id: `news-${requestTime}-${articleCount}`,
      title: currentArticle.title,
      description: currentArticle.description || "Latest news update",
      image: `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(currentArticle.title)}`,
      source: currentArticle.source || getRandomSource(),
      url: citations[articleCount]?.url || "#",
      publishedAt: currentArticle.time || getRandomRecentTime(),
      category: category,
      timestamp: requestTime - articleCount * 1000,
    })
  }

  return articles.slice(0, 20)
}

function getRandomRecentTime(): string {
  const times = [
    "Just now",
    "2 minutes ago",
    "5 minutes ago",
    "10 minutes ago",
    "15 minutes ago",
    "30 minutes ago",
    "45 minutes ago",
    "1 hour ago",
    "2 hours ago",
    "3 hours ago",
    "4 hours ago",
    "5 hours ago",
    "6 hours ago",
    "8 hours ago",
    "12 hours ago",
  ]
  return times[Math.floor(Math.random() * times.length)]
}

function getRandomSource(): string {
  const sources = [
    "Reuters",
    "BBC News",
    "CNN",
    "The Times of India",
    "NDTV",
    "India Today",
    "TechCrunch",
    "The Verge",
    "Wired",
    "Bloomberg",
    "Economic Times",
    "Business Standard",
    "ESPN",
    "Cricbuzz",
    "Bollywood Hungama",
    "Variety",
    "The Hindu",
    "Indian Express",
    "Mint",
    "Forbes India",
  ]
  return sources[Math.floor(Math.random() * sources.length)]
}

function getComprehensiveDemoArticles(category: string, requestTime: number, isRefresh: boolean) {
  const allArticles = {
    "For You": [
      {
        title: "BREAKING: Major Earthquake Hits Japan, Tsunami Warning Issued",
        description:
          "A powerful 7.2 magnitude earthquake struck off Japan's coast, prompting immediate tsunami warnings and evacuations.",
        image: "/japan-earthquake-tsunami.png",
        source: "Reuters",
        category: "Breaking News",
      },
      {
        title: "India's GDP Growth Surpasses Expectations at 7.8%",
        description:
          "Latest economic data shows India's economy growing faster than predicted, driven by strong domestic consumption.",
        image: "/india-gdp-growth.png",
        source: "Economic Times",
        category: "Business",
      },
      {
        title: "OpenAI Announces GPT-5 with Revolutionary Capabilities",
        description:
          "The next generation of AI promises human-level reasoning and multimodal understanding across all domains.",
        image: "/openai-gpt5-ai.png",
        source: "TechCrunch",
        category: "Tech & Science",
      },
      {
        title: "Cricket World Cup: India Defeats Australia in Thrilling Final",
        description:
          "Historic victory as Team India clinches the World Cup with a nail-biting 3-run win over Australia.",
        image: "/placeholder-ffzkd.png",
        source: "Cricbuzz",
        category: "Sports",
      },
      {
        title: "Climate Summit: 50 Nations Pledge Net Zero by 2040",
        description: "Unprecedented global commitment to accelerate climate action with binding emissions targets.",
        image: "/climate-summit-net-zero.png",
        source: "BBC News",
        category: "Environment",
      },
      {
        title: "Bollywood Star Announces Surprise Hollywood Debut",
        description: "A-list actor set to star in major Marvel production, marking biggest crossover in recent years.",
        image: "/bollywood-hollywood-marvel.png",
        source: "Variety",
        category: "Entertainment",
      },
      {
        title: "SpaceX Successfully Lands Crew on Mars",
        description: "Historic achievement as first human crew touches down on Mars after 7-month journey.",
        image: "/spacex-mars-landing-astronauts.png",
        source: "Space News",
        category: "Tech & Science",
      },
      {
        title: "New COVID Variant Detected, WHO Calls Emergency Meeting",
        description:
          "Health officials monitor new strain with enhanced transmissibility but potentially milder symptoms.",
        image: "/covid-variant-who-health.png",
        source: "CNN",
        category: "Health",
      },
      {
        title: "Bitcoin Reaches All-Time High of $150,000",
        description: "Cryptocurrency market surges as institutional adoption accelerates and regulations clarify.",
        image: "/bitcoin-high-price.png",
        source: "Bloomberg",
        category: "Business",
      },
      {
        title: "ISRO Launches Record 104 Satellites in Single Mission",
        description:
          "Indian Space Research Organisation sets new world record with successful multi-satellite deployment.",
        image: "/isro-rocket-launch.png",
        source: "The Hindu",
        category: "Tech & Science",
      },
      {
        title: "Electric Vehicle Sales Overtake Petrol Cars in India",
        description:
          "Milestone moment as EV adoption accelerates with government incentives and charging infrastructure.",
        image: "/electric-vehicles-india.png",
        source: "Mint",
        category: "Business",
      },
      {
        title: "Breakthrough Gene Therapy Cures Type 1 Diabetes",
        description: "Revolutionary treatment shows 95% success rate in clinical trials, offering hope to millions.",
        image: "/gene-therapy-diabetes-cure.png",
        source: "Nature Medicine",
        category: "Health",
      },
      {
        title: "India Wins Bid to Host 2036 Olympics",
        description: "Historic decision as India selected to host Summer Olympics, with events across multiple cities.",
        image: "/placeholder.svg?height=300&width=400",
        source: "ESPN",
        category: "Sports",
      },
      {
        title: "Quantum Internet Successfully Tested Between Cities",
        description: "Scientists achieve quantum communication over 1000km, paving way for ultra-secure networks.",
        image: "/quantum-computer.png",
        source: "Science Daily",
        category: "Tech & Science",
      },
      {
        title: "Renewable Energy Now 70% of India's Power Grid",
        description: "Major milestone achieved ahead of schedule as solar and wind capacity expansion accelerates.",
        image: "/india-renewable-energy.png",
        source: "Energy Today",
        category: "Environment",
      },
    ],
    "Tech & Science": [
      {
        title: "Apple Unveils Revolutionary AR Glasses with Neural Interface",
        description:
          "Next-generation augmented reality device controlled by thought patterns, set to launch next year.",
        image: "/apple-vr-headset.png",
        source: "The Verge",
        category: "Tech & Science",
      },
      {
        title: "Google's Quantum Computer Solves Climate Modeling Problem",
        description:
          "Breakthrough calculation completed in minutes that would take classical computers thousands of years.",
        image: "/quantum-computer.png",
        source: "Wired",
        category: "Tech & Science",
      },
      {
        title: "CRISPR Gene Editing Eliminates Hereditary Blindness",
        description: "Clinical trial shows 100% success rate in restoring sight to patients with genetic vision loss.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Nature",
        category: "Tech & Science",
      },
      {
        title: "Tesla Announces Fully Autonomous Robotaxi Fleet",
        description: "Self-driving vehicles to begin commercial operations in major cities worldwide by 2025.",
        image: "/placeholder.svg?height=300&width=400",
        source: "TechCrunch",
        category: "Tech & Science",
      },
      {
        title: "NASA Discovers Water on Moon's South Pole",
        description:
          "Significant ice deposits found in permanently shadowed craters, crucial for future lunar missions.",
        image: "/placeholder.svg?height=300&width=400",
        source: "NASA News",
        category: "Tech & Science",
      },
      {
        title: "AI System Predicts Alzheimer's 15 Years Before Symptoms",
        description: "Machine learning model analyzes brain scans with 99% accuracy for early disease detection.",
        image: "/ai-healthcare-india.png",
        source: "Medical AI Journal",
        category: "Tech & Science",
      },
      {
        title: "Fusion Power Plant Achieves Net Energy Gain",
        description:
          "Historic milestone as fusion reaction produces more energy than consumed, clean power breakthrough.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Science Magazine",
        category: "Tech & Science",
      },
      {
        title: "Brain-Computer Interface Allows Paralyzed Patient to Walk",
        description:
          "Neuralink-style implant restores mobility to spinal cord injury patient through neural stimulation.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Nature Neuroscience",
        category: "Tech & Science",
      },
      {
        title: "Quantum Sensors Detect Dark Matter Particles",
        description: "Revolutionary detection method confirms existence of dark matter, solving cosmic mystery.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Physics Today",
        category: "Tech & Science",
      },
      {
        title: "Lab-Grown Organs Successfully Transplanted in Humans",
        description: "3D bioprinted hearts and kidneys show perfect compatibility, ending organ shortage crisis.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Cell Medicine",
        category: "Tech & Science",
      },
    ],
    Business: [
      {
        title: "Reliance Industries Becomes World's Largest Clean Energy Company",
        description: "Massive investment in solar, wind, and hydrogen positions Indian conglomerate as global leader.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Business Standard",
        category: "Business",
      },
      {
        title: "Indian Startup Unicorns Cross 200 Mark",
        description:
          "Record year for Indian entrepreneurship with unprecedented venture capital funding and valuations.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Forbes India",
        category: "Business",
      },
      {
        title: "Amazon Announces $50 Billion India Investment",
        description: "Massive expansion plan includes new fulfillment centers, cloud infrastructure, and job creation.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Economic Times",
        category: "Business",
      },
      {
        title: "Cryptocurrency Exchange Launches in 15 New Countries",
        description:
          "Major expansion of digital asset trading platform amid growing global adoption of cryptocurrencies.",
        image: "/placeholder.svg?height=300&width=400",
        source: "CoinDesk",
        category: "Business",
      },
      {
        title: "Green Bonds Market Reaches $2 Trillion Globally",
        description: "Sustainable finance milestone as environmental projects attract record institutional investment.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Financial Times",
        category: "Business",
      },
      {
        title: "AI Startup Valued at $100 Billion in Latest Funding",
        description: "Artificial intelligence company reaches unprecedented valuation amid enterprise adoption surge.",
        image: "/placeholder.svg?height=300&width=400",
        source: "TechCrunch",
        category: "Business",
      },
      {
        title: "Electric Vehicle Charging Network Expands to Rural Areas",
        description:
          "Major infrastructure investment brings EV charging stations to underserved communities nationwide.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Clean Energy News",
        category: "Business",
      },
      {
        title: "Digital Payment Transactions Cross $10 Trillion Mark",
        description: "Cashless economy milestone achieved as mobile payments dominate consumer transactions globally.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Payment Industry",
        category: "Business",
      },
    ],
    Sports: [
      {
        title: "Virat Kohli Breaks Sachin's Record with 50th ODI Century",
        description:
          "Cricket legend achieves historic milestone in World Cup final, cementing status as batting great.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Cricbuzz",
        category: "Sports",
      },
      {
        title: "Indian Women's Hockey Team Wins Olympic Gold",
        description: "Historic victory as team defeats Netherlands 3-2 in thrilling final at Paris Olympics.",
        image: "/placeholder.svg?height=300&width=400",
        source: "ESPN",
        category: "Sports",
      },
      {
        title: "Neeraj Chopra Sets New World Record in Javelin",
        description: "Olympic champion throws 98.48m to break 29-year-old world record at Diamond League final.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Athletics Weekly",
        category: "Sports",
      },
      {
        title: "IPL Auction: Record ₹500 Crore Spent on Players",
        description: "Unprecedented spending as franchises build squads for expanded 12-team tournament format.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Cricinfo",
        category: "Sports",
      },
      {
        title: "Indian Football Team Qualifies for FIFA World Cup",
        description: "Historic achievement as Blue Tigers secure World Cup berth after 60-year absence.",
        image: "/placeholder.svg?height=300&width=400",
        source: "Goal.com",
        category: "Sports",
      },
      {
        title: "Badminton: PV Sindhu Wins All England Championship",
        description: "Star shuttler claims prestigious title with dominant straight-sets victory in final.",
        image: "/placeholder.svg?height=300&width=400",
        source: "BWF News",
        category: "Sports",
      },
    ],
    Entertainment: [
      {
        title: "RRR Wins Oscar for Best International Feature Film",
        description: "SS Rajamouli's epic becomes first Indian film to win in major category at Academy Awards.",
        image: "/bollywood-hollywood-marvel.png",
        source: "Variety",
        category: "Entertainment",
      },
      {
        title: "Netflix Announces ₹5000 Crore Investment in Indian Content",
        description: "Streaming giant commits to producing 100+ original series and films over next three years.",
        image: "/bitcoin-high-price.png",
        source: "Hollywood Reporter",
        category: "Entertainment",
      },
      {
        title: "Shah Rukh Khan's Comeback Film Breaks Box Office Records",
        description: "King Khan's return to cinema after 4 years generates ₹1000 crore worldwide in opening week.",
        image: "/electric-vehicles-india.png",
        source: "Bollywood Hungama",
        category: "Entertainment",
      },
      {
        title: "Indian Web Series Tops Global Netflix Charts",
        description: "Crime thriller becomes most-watched non-English series worldwide, breaking viewership records.",
        image: "/gene-therapy-diabetes-cure.png",
        source: "Entertainment Weekly",
        category: "Entertainment",
      },
      {
        title: "AR Rahman Collaborates with Hans Zimmer on Hollywood Epic",
        description:
          "Oscar-winning composers team up for major studio blockbuster, blending Eastern and Western music.",
        image: "/covid-variant-who-health.png",
        source: "Rolling Stone",
        category: "Entertainment",
      },
    ],
  }

  const categoryArticles = allArticles[category as keyof typeof allArticles] || allArticles["For You"]

  // Add more variety for refresh
  const refreshArticles = [
    {
      title: "LIVE: Breaking News Update - Major Development",
      description: "Stay tuned for live updates on this developing story that's capturing global attention.",
      image: "/placeholder.svg?height=300&width=400",
      source: "Live News",
      category: category,
    },
    {
      title: "Trending Now: Viral Story Takes Internet by Storm",
      description:
        "Social media phenomenon spreads globally as millions share and discuss this unexpected development.",
      image: "/placeholder.svg?height=300&width=400",
      source: "Social Today",
      category: category,
    },
    {
      title: "Just In: Expert Analysis on Latest Developments",
      description: "Industry experts weigh in on recent events and their potential long-term implications.",
      image: "/placeholder.svg?height=300&width=400",
      source: "Expert Views",
      category: category,
    },
  ]

  const articlesToUse = isRefresh ? [...refreshArticles, ...categoryArticles] : categoryArticles

  return articlesToUse.slice(0, 25).map((article, index) => ({
    id: `${isRefresh ? "refresh" : "initial"}-${requestTime}-${index}`,
    title: article.title,
    description: article.description,
    image: article.image,
    source: article.source,
    url: "#",
    publishedAt: getRandomRecentTime(),
    category: article.category,
    timestamp: requestTime - index * 1000,
  }))
}
