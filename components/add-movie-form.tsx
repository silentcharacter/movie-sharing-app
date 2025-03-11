"use client"

import type React from "react"

import { useState } from "react"
import type { Movie } from "@/lib/types"
import { toast } from "sonner"

interface AddMovieFormProps {
  onAddMovie: (movie: Movie) => void
}

export default function AddMovieForm({ onAddMovie }: AddMovieFormProps) {
  const [imdbUrl, setImdbUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const parseImdbIdFromUrl = (url: string) => {
    try {
      const match = url.match(/\/title\/(tt\d+)/i)
      return match ? match[1] : null
    } catch (error) {
      return null
    }
  }

  const fetchMovieData = async (imdbId: string) => {
    const API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY
    if (!API_KEY) {
      throw new Error("OMDB API key is not configured")
    }
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${API_KEY}`)

    if (!response.ok) {
      throw new Error("Failed to fetch movie data")
    }

    return response.json()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const imdbId = parseImdbIdFromUrl(imdbUrl)

      if (!imdbId) {
        throw new Error("Invalid IMDb URL. Please enter a valid URL (e.g., https://www.imdb.com/title/tt0062455)")
      }

      const movieData = await fetchMovieData(imdbId)

      if (movieData.Response === "False") {
        throw new Error(movieData.Error || "Failed to fetch movie data")
      }

      // Create new movie object
      const newMovie: Movie = {
        imdbID: movieData.imdbID,
        title: movieData.Title,
        year: Number.parseInt(movieData.Year),
        genre: movieData.Genre,
        description: movieData.Plot,
        poster: movieData.Poster,
        imdbRating: movieData.imdbRating,
      }

      onAddMovie(newMovie)
      setImdbUrl("")
    } catch (error) {
      toast.error("Error adding movie", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 pb-8">
      <div className="flex-1">
        <input
          type="url"
          id="imdbUrl"
          value={imdbUrl}
          onChange={(e) => setImdbUrl(e.target.value)}
          placeholder="IMDb URL (e.g. https://www.imdb.com/title/tt0062455)"
          className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
          required
          readOnly
          onClick={(e) => {
            // Make the input editable when clicked
            e.currentTarget.readOnly = false;
          }}
          onBlur={(e) => {
            // Make it readonly again when focus is lost
            e.currentTarget.readOnly = true;
          }}
        />
        <div className="text-xs text-muted-foreground mt-1">Paste the full IMDb movie URL</div>
      </div>

      <button
        type="submit"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md h-10 whitespace-nowrap hover:bg-primary/90 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Suggest"}
      </button>
    </form>
  )
}

