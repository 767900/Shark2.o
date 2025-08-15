"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, RefreshCw, Headphones, ExternalLink, Bookmark } from "lucide-react"

interface NewsArticle {
  id: string
  title: string
  summary: string
  url: string
  image: string
  source: string
  publishedAt: string
  category: string
}

interface DiscoverPageProps {
  onBack: () => void
}

const categories = [
  { id: "for-you", name: "For You", count: 18 },
  { id: "top-stories", name: "Top Stories", count: 12 },
  { id: "tech", name: "Tech & Science", count: 8 },
  { id: "business", name: "Business", count: 6 },
  { id: "sports", name: "Sports", count: 10 },
  { id: "entertainment", name: "Entertainment", count: 7 },
]

const sampleArticles: NewsArticle[] = [
  {
    id: "1",
    title: "LIVE: Breaking News Update - Major Development",
    summary: "Stay tuned for live updates on this developing story that's capturing global attention.",
    url: "#",
    image: "/news-article.png",
    source: "Live News",
    publishedAt: "2 hours ago",
    category: "top-stories",
  },
  {
    id: "2",
    title: "Apple Vision Pro Headset Revolutionizes AR Experience",
    summary: "Apple's latest AR headset brings unprecedented immersive technology to consumers worldwide.",
    url: "#",
    image: "/apple-vr-headset.png",
    source: "Tech Today",
    publishedAt: "4 hours ago",
    category: "tech",
  },
  {
    id: "3",
    title: "ISRO Successfully Launches Advanced Communication Satellite",
    summary:
      "India's space agency achieves another milestone with the successful deployment of next-gen satellite technology.",
    url: "#",
    image: "/isro-rocket-launch.png",
    source: "Space News",
    publishedAt: "6 hours ago",
    category: "tech",
  },
  {
    id: "4",
    title: "AI Healthcare Revolution Transforms Medical Diagnosis in India",
    summary: "Artificial intelligence is revolutionizing healthcare delivery across Indian hospitals and clinics.",
    url: "#",
    image: "/ai-healthcare-india.png",
    source: "Health Tech",
    publishedAt: "8 hours ago",
    category: "tech",
  },
  {
    id: "5",
    title: "Quantum Computing Breakthrough Achieved by Research Team",
    summary: "Scientists make significant progress in quantum computing technology with new algorithmic approach.",
    url: "#",
    image: "/quantum-computer.png",
    source: "Science Daily",
    publishedAt: "10 hours ago",
    category: "tech",
  },
  {
    id: "6",
    title: "India's Renewable Energy Sector Reaches New Heights",
    summary: "The country's commitment to clean energy shows remarkable progress with record-breaking installations.",
    url: "#",
    image: "/india-renewable-energy.png",
    source: "Energy News",
    publishedAt: "12 hours ago",
    category: "business",
  },
]

export default function DiscoverPage({ onBack }: DiscoverPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("for-you")
  const [articles, setArticles] = useState<NewsArticle[]>(sampleArticles)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Auto-refresh articles every 45 seconds (silently)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // Simulate new articles (in real app, this would fetch from API)
      setArticles((prev) => [...prev])
    }, 45000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  const filteredArticles = articles.filter((article) =>
    selectedCategory === "for-you" ? true : article.category === selectedCategory,
  )

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    return `${diffInHours}h ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-purple-500/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Discover 📈
              </h1>
              <p className="text-sm text-purple-300 font-medium">
                {filteredArticles.length} articles • Updated {getTimeAgo(lastUpdated)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button className="p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 transition-colors">
              <Headphones className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide category-tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-tab flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="p-4 space-y-6">
        <AnimatePresence mode="wait">
          {filteredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-purple-500/20 overflow-hidden hover:border-purple-400/40 transition-all group"
            >
              {/* Article Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-bold rounded-full">
                    {categories.find((c) => c.id === article.category)?.name || "Top Stories"}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors">
                    <Bookmark className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-300 transition-colors">
                  {article.title}
                </h2>
                <p className="text-slate-300 mb-4 leading-relaxed font-medium">{article.summary}</p>

                {/* Article Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {article.source.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{article.source}</p>
                      <p className="text-xs text-slate-400 font-medium">{article.publishedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 transition-colors">
                      <Headphones className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
