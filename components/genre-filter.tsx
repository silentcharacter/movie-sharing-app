"use client"

interface GenreFilterProps {
  activeGenre: string
  setActiveGenre: (genre: string) => void
  moviesCount: number
  filteredMoviesCount: number
}

export default function GenreFilter({ 
  activeGenre, 
  setActiveGenre, 
  moviesCount, 
  filteredMoviesCount 
}: GenreFilterProps) {
  const genres = [
    { id: "all", name: "All" },
    { id: "action", name: "Action" },
    { id: "drama", name: "Drama" },
    { id: "sci-fi", name: "Sci-Fi" },
    { id: "crime", name: "Crime" },
    { id: "thriller", name: "Thriller" },
    { id: "comedy", name: "Comedy" },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-4 py-1 overflow-x-auto scrollbar-hide">
      {genres.map((genre) => (
        <button
          key={genre.id}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            activeGenre === genre.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:border-primary hover:text-foreground border border-transparent"
          }`}
          onClick={() => setActiveGenre(genre.id)}
        >
          {genre.name} {genre.id === "all" && moviesCount > 0 && `(${moviesCount})`}
          {genre.id !== "all" && activeGenre === genre.id && filteredMoviesCount > 0 && `(${filteredMoviesCount})`}
        </button>
      ))}
    </div>
  )
}

