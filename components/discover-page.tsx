"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Bookmark, Headphones, ExternalLink, RefreshCw, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewsArticle {
  id: string
  title: string
  description: string
  image: string
  source: string
  url: string
  publishedAt: string
  category: string
  isNew?: boolean
  timestamp: number
}

interface DiscoverPageProps {
  onBack: () => void
}

export default function DiscoverPage({ onBack }: DiscoverPageProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("For You")
  const [error, setError] = useState<string | null>(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [newArticlesCount, setNewArticlesCount] = useState(0)
  const [totalArticles, setTotalArticles] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<number>(0)

  const categories = ["For You", "Top Stories", "Tech & Science", "Business", "Sports", "Entertainment"]

  // Auto-refresh interval (45 seconds for more content)
  const REFRESH_INTERVAL = 45000 // 45 seconds
  const MAX_ARTICLES = 50 // Keep more articles

  useEffect(() => {
    fetchNews(true) // Initial fetch
    startAutoRefresh()

    return () => {
      stopAutoRefresh()
    }
  }, [selectedCategory])

  const startAutoRefresh = () => {
    stopAutoRefresh() // Clear any existing interval

    if (isAutoRefreshing) {
      intervalRef.current = setInterval(() => {
        console.log("🔄 Auto-refreshing news...")
        fetchNews(false) // Auto-refresh (don't show loading)
      }, REFRESH_INTERVAL)
    }
  }

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const fetchNews = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }
    setError(null)

    try {
      console.log("🌐 Fetching comprehensive news for:", selectedCategory)

      const currentTime = Date.now()
      const response = await fetch("/api/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          lastFetch: lastFetchRef.current,
          requestTime: currentTime,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`)
      }

      const data = await response.json()

      if (data.articles && Array.isArray(data.articles)) {
        const newArticles = data.articles.map((article: any) => ({
          ...article,
          timestamp: currentTime,
          isNew: !showLoading, // Mark as new if it's an auto-refresh
        }))

        setArticles((prevArticles) => {
          if (showLoading) {
            // Initial load - replace all articles
            setTotalArticles(newArticles.length)
            return newArticles
          } else {
            // Auto-refresh - merge new articles
            const mergedArticles = mergeArticles(prevArticles, newArticles)
            const newCount = mergedArticles.filter((a) => a.isNew).length
            setNewArticlesCount(newCount)
            setTotalArticles(mergedArticles.length)

            // Auto-remove "new" flag after 15 seconds
            setTimeout(() => {
              setArticles((current) =>
                current.map((article) => ({
                  ...article,
                  isNew: false,
                })),
              )
              setNewArticlesCount(0)
            }, 15000)

            return mergedArticles.slice(0, MAX_ARTICLES) // Keep more articles
          }
        })

        lastFetchRef.current = currentTime
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("❌ Error fetching news:", error)
      if (showLoading) {
        setError("Failed to load news")
        // Show demo articles as fallback only on initial load
        const demoArticles = getDemoArticles()
        setArticles(demoArticles)
        setTotalArticles(demoArticles.length)
      }
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  const mergeArticles = (existing: NewsArticle[], newArticles: NewsArticle[]): NewsArticle[] => {
    const existingIds = new Set(existing.map((a) => a.id))
    const uniqueNewArticles = newArticles.filter((article) => !existingIds.has(article.id))

    if (uniqueNewArticles.length === 0) {
      return existing // No new articles
    }

    console.log(`✨ Found ${uniqueNewArticles.length} new articles!`)

    // Add new articles at the top, keep existing ones
    return [...uniqueNewArticles, ...existing].sort((a, b) => b.timestamp - a.timestamp)
  }

  const getDemoArticles = (): NewsArticle[] => {
    // This will be populated by the API, but keeping as fallback
    return []
  }

  const handleRefresh = () => {
    fetchNews(true)
  }

  const toggleAutoRefresh = () => {
    const newState = !isAutoRefreshing
    setIsAutoRefreshing(newState)

    if (newState) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  }

  const formatLastUpdate = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Discover
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </h1>
            <p className="text-sm text-gray-400">
              {totalArticles} articles • Updated {formatLastUpdate()}
            </p>
          </div>
          {newArticlesCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse"
            >
              +{newArticlesCount} new
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleAutoRefresh}
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-white/10 ${isAutoRefreshing ? "text-green-400" : "text-gray-400"}`}
            title={isAutoRefreshing ? "Auto-refresh ON" : "Auto-refresh OFF"}
          >
            <Zap className={`w-4 h-4 ${isAutoRefreshing ? "animate-pulse" : ""}`} />
          </Button>
          <Button onClick={handleRefresh} variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Headphones className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Auto-refresh Status */}
      {isAutoRefreshing && (
        <div className="px-4 py-2 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-b border-green-700/30">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>🔴 LIVE - Auto-updating with fresh news every 45 seconds</span>
            <div className="ml-auto text-xs text-gray-400">
              Next update in {Math.ceil((REFRESH_INTERVAL - (Date.now() - lastFetchRef.current)) / 1000)}s
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "default" : "ghost"}
            className={`whitespace-nowrap ${
              selectedCategory === category
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
                : "text-gray-300 hover:bg-white/10"
            }`}
          >
            {category}
            {category === selectedCategory && (
              <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                {articles.filter((a) => a.category === category || category === "For You").length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="text-center text-red-400 p-8">
            <p>{error}</p>
            <Button onClick={handleRefresh} className="mt-4 bg-cyan-600 hover:bg-cyan-700">
              Try Again
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="bg-gray-700 h-48 rounded-xl mb-4"></div>
                <div className="bg-gray-700 h-6 rounded mb-2"></div>
                <div className="bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-700 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-6">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: article.isNew ? -20 : 20, scale: article.isNew ? 1.02 : 1 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: article.isNew ? 0 : Math.min(index * 0.05, 1), // Faster stagger for more articles
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className={`bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-all relative group ${
                    article.isNew ? "ring-2 ring-green-400 shadow-lg shadow-green-400/20" : ""
                  }`}
                >
                  {/* New Article Badge */}
                  {article.isNew && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-3 left-3 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg"
                    >
                      🔥 FRESH
                    </motion.div>
                  )}

                  {/* Article Image */}
                  <div className="relative h-48 bg-gray-700 overflow-hidden">
                    <img
                      src={article.image || "/news-article.png"}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/news-article.png"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <Button size="sm" variant="ghost" className="bg-black/50 text-white hover:bg-black/70">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-cyan-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-gray-300 mb-4 line-clamp-3 text-sm leading-relaxed">{article.description}</p>

                    {/* Article Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {article.source.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-400 font-medium">{article.source}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{article.publishedAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Headphones className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {!isLoading && articles.length === 0 && !error && (
          <div className="text-center text-gray-400 p-8">
            <p>No articles found for this category.</p>
            <Button onClick={handleRefresh} className="mt-4 bg-cyan-600 hover:bg-cyan-700">
              Refresh
            </Button>
          </div>
        )}

        {/* Load More Indicator */}
        {articles.length > 0 && (
          <div className="text-center py-8">
            <div className="text-sm text-gray-400 mb-4">
              Showing {articles.length} articles • More loading automatically...
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
