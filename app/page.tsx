"use client"

import { useEffect, useState, useRef } from "react"
import MovieList from "@/components/movie-list"
import GenreFilter from "@/components/genre-filter"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Plus, Menu, ChevronLeft } from "lucide-react"
import { toast } from "sonner"

export default function Home() {
  // Get current user data
  const currentUser = useQuery(api.users.getByTelegramId, { telegramId: "123456" })
  const movies = useQuery(api.movies.getUnratedMovies, 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || []
  const likeMovie = useMutation(api.movies.likeMovie)
  const [originalMovies, setOriginalMovies] = useState<Movie[]>([])
  const [activeGenre, setActiveGenre] = useState<string>("all")
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isTelegram, setIsTelegram] = useState(false)
  const prevMoviesRef = useRef<Movie[]>([])
  const prevActiveGenreRef = useRef<string>("all")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  
  // Initialize originalMovies only once when movies are first loaded
  useEffect(() => {
    if (movies.length > 0 && originalMovies.length === 0) {
      setOriginalMovies(movies)
    }
  }, [movies, originalMovies.length])

  useEffect(() => {
    // Check if running in Telegram WebApp
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      setIsTelegram(true)
      const webApp = window.Telegram.WebApp

      // Expand to maximum allowed height
      webApp.expand()

      // Trigger closing animation when ready
      webApp.ready()
    }
  }, [])

  // Update filtered movies only when movies or activeGenre actually change
  useEffect(() => {
    const moviesChanged = JSON.stringify(prevMoviesRef.current) !== JSON.stringify(movies)
    const genreChanged = prevActiveGenreRef.current !== activeGenre
    
    if (moviesChanged || genreChanged) {
      if (activeGenre === "all") {
        setFilteredMovies(movies)
      } else {
        setFilteredMovies(movies.filter((movie) => movie.genre.toLowerCase().includes(activeGenre.toLowerCase())))
      }
      
      prevMoviesRef.current = movies
      prevActiveGenreRef.current = activeGenre
    }
  }, [activeGenre, movies])

  const resetMovieList = () => {
    setFilteredMovies(movies)
    toast.success("Movie list reset", {
      description: "All movies have been restored",
    })
  }

  const onLikeMovie = async (movieId: string, isLike: boolean) => {
    try {
      if (!currentUser?._id) {
        throw new Error("User not found");
      }
      await likeMovie({ imdbID: movieId, isLike, userId: currentUser._id })
    } catch (error) {
      toast.error("Failed to update movie", {
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  return (
    <main className="container mx-auto px-4 py-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4 flex justify-between items-center">
        {pathname !== "/" && (
          <button 
            onClick={() => router.push("/")}
            className="p-2 hover:bg-accent rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <span>Friends recommendations</span>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-accent rounded-full"
          >
            <Menu size={24} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-popover border border-border">
              <div className="py-1">
                <Link 
                  href="/my-movies"
                  className="block px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Movies
                </Link>
                <Link 
                  href="/my-likes"
                  className="block px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Likes
                </Link>
              </div>
            </div>
          )}
        </div>
      </h1>

      {!isTelegram && (
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-4 text-center text-sm">
          This app works best within the Telegram application.
        </div>
      )}

      <GenreFilter 
        activeGenre={activeGenre} 
        setActiveGenre={setActiveGenre}
        moviesCount={movies.length}
        filteredMoviesCount={filteredMovies.length}
      />

      <div className="text-center text-muted-foreground text-sm my-2 p-2 bg-muted/20 rounded-lg">
        Swipe right to LIKE, swipe left to DISLIKE
      </div>

      {filteredMovies.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>
            {activeGenre !== "all" ? `No movies found in the "${activeGenre}" genre` : "No more movies in your list"}
          </p>
        </div>
      ) : (
        <MovieList movies={filteredMovies} onLikeMovie={onLikeMovie} />
      )}
    </main>
  )
}

