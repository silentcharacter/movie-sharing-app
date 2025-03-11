"use client"

import { ChevronLeft, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import MovieCard from "@/components/movie-card"
import GenreFilter from "@/components/genre-filter"
import AddMovieForm from "@/components/add-movie-form"
import { useState, useEffect, useRef } from "react"
import type { Movie } from "@/lib/types"
import { toast } from "sonner"

export default function MyMovies() {
  const router = useRouter()
  const currentUser = useQuery(api.users.getByTelegramId, { telegramId: "123456" })
  const myMovies = useQuery(api.movies.listByUser, 
    currentUser?._id ? { userId: currentUser._id } : "skip"
  ) || []
  const addNewMovie = useMutation(api.movies.add)

  const [activeGenre, setActiveGenre] = useState<string>("all")
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [showFab, setShowFab] = useState(true)
  const prevMoviesRef = useRef<Movie[]>([])
  const prevActiveGenreRef = useRef<string>("all")
  const activeSwipeRef = useRef<string | null>(null)

  // Update filtered movies when movies or activeGenre change
  useEffect(() => {
    const moviesChanged = JSON.stringify(prevMoviesRef.current) !== JSON.stringify(myMovies)
    const genreChanged = prevActiveGenreRef.current !== activeGenre
    
    if (moviesChanged || genreChanged) {
      if (activeGenre === "all") {
        setFilteredMovies(myMovies)
      } else {
        setFilteredMovies(myMovies.filter((movie) => 
          movie.genre.toLowerCase().includes(activeGenre.toLowerCase())
        ))
      }
      
      prevMoviesRef.current = myMovies
      prevActiveGenreRef.current = activeGenre
    }
  }, [activeGenre, myMovies])

  const addMovie = async (newMovie: Movie) => {
    try {
      if (!currentUser) {
        throw new Error("User not found")
      }
      
      await addNewMovie({
        imdbID: newMovie.imdbID,
        title: newMovie.title,
        year: newMovie.year,
        genre: newMovie.genre,
        description: newMovie.description,
        likesCount: 1,
        dislikesCount: 0,
        poster: newMovie.poster,
        imdbRating: newMovie.imdbRating,
        suggestedBy: currentUser._id,
      })
      toast.success("Movie added", {
        description: `${newMovie.title} has been suggested to your friends`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.toLowerCase().includes("already exists")) {
        toast.error("Movie already exists", {
          description: `${newMovie.title} was already suggested before`,
        })
      } else {
        toast.error("Failed to add movie", {
          description: error instanceof Error ? error.message : "An error occurred",
        })
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const addMovieSection = document.querySelector(".add-movie-section")
      if (addMovieSection) {
        const rect = addMovieSection.getBoundingClientRect()
        const isPartiallyVisible = rect.top < window.innerHeight && rect.bottom > 0
        setShowFab(!isPartiallyVisible)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToAddMovie = () => {
    const addMovieSection = document.querySelector(".add-movie-section")
    if (addMovieSection) {
      addMovieSection.scrollIntoView({ behavior: "smooth" })
      setTimeout(() => {
        const input = document.getElementById("imdbUrl")
        if (input) input.focus()
      }, 500)
    }
  }

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
        <span>My Movies</span>
      </h1>

      {myMovies.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          You haven't suggested any movies yet. Go back to the main page to suggest your first movie!
        </p>
      ) : (
        <div className="mt-4">
          <GenreFilter 
            activeGenre={activeGenre} 
            setActiveGenre={setActiveGenre}
            moviesCount={myMovies.length}
            filteredMoviesCount={filteredMovies.length}
          />

          <p className="text-sm text-muted-foreground my-4">
            Movies you've suggested ({filteredMovies.length})
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

      <div className="add-movie-section mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-medium mb-4">Suggest Movie</h3>
        <AddMovieForm onAddMovie={addMovie} />
      </div>

      {showFab && (
        <button
          onClick={scrollToAddMovie}
          className="fixed bottom-5 right-5 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-50 transition-transform hover:scale-105"
          aria-label="Suggest"
        >
          <Plus size={24} />
        </button>
      )}
    </main>
  )
} 