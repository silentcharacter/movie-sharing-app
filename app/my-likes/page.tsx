"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import MovieCard from "@/components/movie-card"
import GenreFilter from "@/components/genre-filter"
import { useState, useEffect, useRef } from "react"
import type { Movie } from "@/lib/types"
import { useTelegramUser } from "@/lib/hooks/useTelegramUser"

export default function MyLikes() {
  const router = useRouter()
  const { currentUser } = useTelegramUser()
  
  // Add isLoading state
  const [isLoading, setIsLoading] = useState(true)
  
  const likedMovies = useQuery(api.movies.listLikedByUser, 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || [{}]

  const [activeGenre, setActiveGenre] = useState<string>("all")
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const prevMoviesRef = useRef<Movie[]>([])
  const prevActiveGenreRef = useRef<string>("all")

  // Update filtered movies when movies or activeGenre change
  useEffect(() => {
    const moviesChanged = JSON.stringify(prevMoviesRef.current) !== JSON.stringify(likedMovies)
    const genreChanged = prevActiveGenreRef.current !== activeGenre
    
    if (moviesChanged || genreChanged) {
      const validMovies = likedMovies.filter(movie => movie.imdbID)

      if (activeGenre === "all") {
        setFilteredMovies(validMovies)
      } else {
        setFilteredMovies(validMovies.filter((movie) => 
          movie.genre.toLowerCase().includes(activeGenre.toLowerCase())
        ))
      }
      
      prevMoviesRef.current = likedMovies
      prevActiveGenreRef.current = activeGenre

      if (likedMovies.length === 0 || likedMovies[0].imdbID) {
        setIsLoading(false)
      }
    }
  }, [activeGenre, likedMovies])

  return (
    <main className="container mx-auto px-4 py-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-4">
        <button 
          onClick={() => router.push("/")}
          className="p-2 hover:bg-accent rounded-full"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <span>My Likes</span>
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : likedMovies.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          You haven't liked any movies yet. Go back to the main page to like some movies!
        </p>
      ) : (
        <div className="mt-4">
          <GenreFilter 
            activeGenre={activeGenre} 
            setActiveGenre={setActiveGenre}
            moviesCount={likedMovies.length}
            filteredMoviesCount={filteredMovies.length}
          />

          <p className="text-sm text-muted-foreground my-4">
            Movies you've liked ({filteredMovies.length})
          </p>
          <div className="space-y-4">
            {filteredMovies.map((movie) => (
              <MovieCard 
                key={movie.imdbID} 
                movie={movie}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  )
} 