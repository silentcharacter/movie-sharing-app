"use client"

import type React from "react"

import { useState, useRef, useEffect, type MutableRefObject } from "react"
import Image from "next/image"
import type { Movie } from "@/lib/types"
import { ExternalLink, X } from "lucide-react"

interface MovieCardProps {
  movie: Movie
  onLike?: (movieId: string, isLike: boolean) => void
  activeSwipeRef?: MutableRefObject<string | null>
}

export default function MovieCard({ movie, onLike, activeSwipeRef }: MovieCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showUsersPopup, setShowUsersPopup] = useState(false)
  const startXRef = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  
  // Calculate percentages for likes/dislikes bar
  const totalVotes = (movie.likesCount ?? 0) + (movie.dislikesCount ?? 0)
  const likesPercentage = totalVotes === 0 ? 50 : Math.round(((movie.likesCount ?? 0) / totalVotes) * 100)
  const dislikesPercentage = 100 - likesPercentage

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!activeSwipeRef || activeSwipeRef.current && activeSwipeRef.current !== movie.imdbID) return

    startXRef.current = e.touches[0].clientX
    setIsDragging(true)
    activeSwipeRef.current = movie.imdbID
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !activeSwipeRef || activeSwipeRef.current !== movie.imdbID) return

    const currentX = e.touches[0].clientX
    const diff = currentX - startXRef.current

    // Limit the drag distance
    if (Math.abs(diff) < 150) {
      setSwipeOffset(diff)
    } else {
      setSwipeOffset(diff > 0 ? 150 : -150)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || !activeSwipeRef || activeSwipeRef.current !== movie.imdbID) return

    if (Math.abs(swipeOffset) > 100) {
      // Remove the card
      setIsRemoving(true)
      const isLike = swipeOffset > 0

      setTimeout(() => {
        if (onLike) onLike(movie.imdbID, isLike)
      }, 300)
    } else {
      // Snap back
      setSwipeOffset(0)
    }

    setIsDragging(false)
    activeSwipeRef.current = null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeSwipeRef || activeSwipeRef.current && activeSwipeRef.current !== movie.imdbID) return

    startXRef.current = e.clientX
    setIsDragging(true)
    activeSwipeRef.current = movie.imdbID
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !activeSwipeRef || activeSwipeRef.current !== movie.imdbID) return

    const diff = e.clientX - startXRef.current

    // Limit the drag distance
    if (Math.abs(diff) < 150) {
      setSwipeOffset(diff)
    } else {
      setSwipeOffset(diff > 0 ? 150 : -150)
    }
  }

  const handleMouseUp = () => {
    if (!isDragging || !activeSwipeRef || activeSwipeRef.current !== movie.imdbID) return

    if (Math.abs(swipeOffset) > 100) {
      // Remove the card
      setIsRemoving(true)
      const isLike = swipeOffset > 0

      setTimeout(() => {
        if (onLike) onLike(movie.imdbID, isLike)
      }, 300)
    } else {
      // Snap back
      setSwipeOffset(0)
    }

    setIsDragging(false)
    activeSwipeRef.current = null
  }

  const handleMouseLeave = () => {
    if (activeSwipeRef && isDragging && activeSwipeRef.current === movie.imdbID) {
      setSwipeOffset(0)
      setIsDragging(false)
      activeSwipeRef.current = null
    }
  }

  // Clean up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (activeSwipeRef && isDragging && activeSwipeRef.current === movie.imdbID) {
        handleMouseUp()
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, movie.imdbID])

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowUsersPopup(false)
      }
    }

    if (showUsersPopup) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUsersPopup])

  const toggleUsersPopup = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowUsersPopup(!showUsersPopup)
  }

  const cardContent = (
    <div className="bg-muted rounded-xl p-4 shadow-sm hover:shadow-md transition-all relative z-10 flex gap-4">
      <div className="flex flex-col gap-3 w-20 flex-shrink-0">
        <div className="w-20 h-30 rounded-md overflow-hidden bg-muted-foreground/10">
          <Image
            src={movie.poster || "/placeholder.svg"}
            alt={`${movie.title} poster`}
            width={80}
            height={120}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="120" viewBox="0 0 80 120"><rect width="80" height="120" fill="%23eee"/><text x="50%" y="50%" fontFamily="Arial" fontSize="12" textAnchor="middle" fill="%23999">No image</text></svg>'
            }}
          />
        </div>

        <div className="h-6 w-full relative">
          <div 
            className="flex h-full rounded overflow-hidden cursor-pointer"
            onClick={toggleUsersPopup}
          >
            <div
              className="bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold"
              style={{ width: `${likesPercentage}%`, minWidth: "24px" }}
            >
              {movie.likesCount}
            </div>
            <div
              className="bg-red-100 text-red-800 flex items-center justify-center text-xs font-bold"
              style={{ width: `${dislikesPercentage}%`, minWidth: "24px" }}
            >
              {movie.dislikesCount}
            </div>
          </div>
          
          {/* Users Popup */}
          {showUsersPopup && (
            <div 
              ref={popupRef}
              className="absolute bottom-8 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-50 w-64 border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm">Who rated this movie</h4>
                <button 
                  onClick={() => setShowUsersPopup(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex gap-4">
                {/* Likes column */}
                <div className="flex-1">
                  <div className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Liked ({movie.likedByUsers?.length || 0})
                  </div>
                  <ul className="text-xs max-h-32 overflow-y-auto">
                    {movie.likedByUsers && movie.likedByUsers.length > 0 ? (
                      movie.likedByUsers.map((user, i) => (
                        <li key={`like-${i}`} className="py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          {user.name}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No likes yet</li>
                    )}
                  </ul>
                </div>
                
                {/* Dislikes column */}
                <div className="flex-1">
                  <div className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Disliked ({movie.dislikedByUsers?.length || 0})
                  </div>
                  <ul className="text-xs max-h-32 overflow-y-auto">
                    {movie.dislikedByUsers && movie.dislikedByUsers.length > 0 ? (
                      movie.dislikedByUsers.map((user, i) => (
                        <li key={`dislike-${i}`} className="py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          {user.name}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No dislikes yet</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 relative">
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0">
            <h3 className="text-lg font-bold inline">{movie.title}</h3>
            <span className="text-muted-foreground ml-1">({movie.year})</span>
          </div>
          <div className="bg-[#f5c518] text-black px-2 py-0.5 rounded flex items-center text-sm font-bold ml-2 whitespace-nowrap">
            <span className="mr-1">★</span>
            <span>{movie.imdbRating}</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-2">{movie.genre}</div>

        <p className="text-sm mb-8">{movie.description}</p>

        <a
          href={`https://www.imdb.com/title/${movie.imdbID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-0 right-0 bg-[#f5c518] text-black px-2 py-1 rounded text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          IMDb
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )

  if (!activeSwipeRef || !onLike) {
    return (
      <div className="relative overflow-hidden rounded-xl">
        {cardContent}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Like/Dislike hints */}
      <div className="absolute inset-0 bg-green-500 flex items-center justify-start pl-5 text-white font-bold"
        style={{ opacity: swipeOffset > 30 ? Math.min(1, Math.abs(swipeOffset) / 100) : 0 }}>
        LIKE
      </div>
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-5 text-white font-bold"
        style={{ opacity: swipeOffset < -30 ? Math.min(1, Math.abs(swipeOffset) / 100) : 0 }}>
        DISLIKE
      </div>

      {/* Swipeable card */}
      <div
        ref={cardRef}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {cardContent}
      </div>
    </div>
  )
}

