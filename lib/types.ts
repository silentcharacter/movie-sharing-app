export interface Movie {
  _id: string
  imdbID: string
  title: string
  year: number
  genre: string
  description: string
  likesCount: number
  dislikesCount: number
  poster: string
  imdbRating: string
  suggestedBy: string
  likedByUsers?: { name: string }[]
  dislikedByUsers?: { name: string }[]
}

