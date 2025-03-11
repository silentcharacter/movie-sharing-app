"use client"

import type { Movie } from "@/lib/types"
import Image from "next/image"

export default function StaticMovieList({ movies }: { movies: Movie[] }) {
  return (
    <div className="space-y-4">
      {movies.map((movie) => (
        <div 
          key={movie.imdbID}
          className="relative bg-card rounded-lg overflow-hidden shadow-md"
        >
          <div className="flex gap-4 p-4">
            <div className="relative w-24 h-36 flex-shrink-0">
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl">{movie.title} 
                    <span className="text-muted-foreground">({movie.year})</span>
                  </h3>
                  <p className="text-muted-foreground">{movie.genre}</p>
                </div>
                <div className="bg-[#ffd700] text-black font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <span>★</span>
                  <span>{movie.imdbRating}</span>
                </div>
              </div>
              <p className="text-sm mt-3 text-muted-foreground">{movie.description}</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-green-500">👍</span>
                  <span className="text-sm">{movie.likesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-red-500">👎</span>
                  <span className="text-sm">{movie.dislikesCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 