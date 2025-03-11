"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import MovieCard from "@/components/movie-card"
import GenreFilter from "@/components/genre-filter"
import { useState, useEffect, useRef } from "react"
import type { Movie } from "@/lib/types"

export default function MyLikes() {
  const router = useRouter()
  const currentUser = useQuery(api.users.getByTelegramId, { telegramId: "123456" })
  const likedMovies = useQuery(api.movies.listLikedByUser, 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || []

  const [activeGenre, setActiveGenre] = useState<string>("all")
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const prevMoviesRef = useRef<Movie[]>([])
  const prevActiveGenreRef = useRef<string>("all")

  // Update filtered movies when movies or activeGenre change
  useEffect(() => {
    const moviesChanged = JSON.stringify(prevMoviesRef.current) !== JSON.stringify(likedMovies)
    const genreChanged = prevActiveGenreRef.current !== activeGenre
    
    if (moviesChanged || genreChanged) {
      if (activeGenre === "all") {
        setFilteredMovies(likedMovies)
      } else {
        setFilteredMovies(likedMovies.filter((movie) => 
          movie.genre.toLowerCase().includes(activeGenre.toLowerCase())
        ))
      }
      
      prevMoviesRef.current = likedMovies
      prevActiveGenreRef.current = activeGenre
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

      {likedMovies.length === 0 ? (
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