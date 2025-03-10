export interface Movie {
  imdbID: string
  title: string
  year: number
  genre: string
  description: string
  likesCount?: number
  dislikesCount?: number
  poster: string
  imdbRating: string
  suggestedBy?: string
}

