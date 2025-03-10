"use client"

import { useRef } from "react"
import type { Movie } from "@/lib/types"
import MovieCard from "./movie-card"

interface MovieListProps {
  movies: Movie[]
  onLikeMovie: (movieId: string, isLike: boolean) => void
}

export default function MovieList({ movies, onLikeMovie }: MovieListProps) {
  const activeSwipeRef = useRef<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.imdbID} movie={movie} onLike={onLikeMovie} activeSwipeRef={activeSwipeRef} />
      ))}
    </div>
  )
}

