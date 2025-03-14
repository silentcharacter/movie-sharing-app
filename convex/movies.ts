import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// Check if a movie with the given imdbID already exists
export const getByImdbId = query({
  args: { imdbID: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .withIndex("by_imdbID", (q) => q.eq("imdbID", args.imdbID))
      .first();
  },
});

// Add a new movie, ensuring uniqueness of imdbID
export const add = mutation({
  args: {
    imdbID: v.string(),
    title: v.string(),
    year: v.number(),
    genre: v.string(),
    description: v.string(),
    likesCount: v.number(),
    dislikesCount: v.number(),
    poster: v.string(),
    imdbRating: v.string(),
    suggestedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if a movie with this imdbID already exists
    const existing = await ctx.db
      .query("movies")
      .withIndex("by_imdbID", (q) => q.eq("imdbID", args.imdbID))
      .first();
    
    if (existing) {
      throw new Error(`Movie "${args.title}" with imdbID ${args.imdbID} already exists`);
    }
    
    // If we got here, no movie with this imdbID exists, so we can insert it
    const movieId = await ctx.db.insert("movies", {
      imdbID: args.imdbID,
      title: args.title,
      year: args.year,
      genre: args.genre,
      description: args.description,
      likesCount: args.likesCount,
      dislikesCount: args.dislikesCount,
      poster: args.poster,
      imdbRating: args.imdbRating,
      suggestedBy: args.suggestedBy,
    });

    // Create a like record for the user who suggested the movie
    await ctx.db.insert("likes", {
      movieId: movieId,
      userId: args.suggestedBy,
      positive: true
    });

    return movieId;
  },
});

// Update movie likes/dislikes count
export const likeMovie = mutation({
  args: {
    imdbID: v.string(),
    isLike: v.boolean(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const movie = await ctx.db
      .query("movies")
      .withIndex("by_imdbID", (q) => q.eq("imdbID", args.imdbID))
      .first();

    if (!movie) {
      throw new Error(`Movie with imdbID ${args.imdbID} not found`);
    }

    if (args.isLike) {
      await ctx.db.patch(movie._id, { likesCount: movie.likesCount + 1 });
    } else {
      await ctx.db.patch(movie._id, { dislikesCount: movie.dislikesCount + 1 });
    }
    // Create new like record
    await ctx.db.insert("likes", {
      movieId: movie._id,
      userId: args.userId,
      positive: args.isLike
    });
  },
});

// Helper function to populate movie with users who liked/disliked it
async function populateMovieWithUsers(
  ctx: any, 
  movie: any
) {
  // Get all positive likes for this movie
  const movieLikes = await ctx.db
    .query("likes")
    .withIndex("by_movie_positive", (q: any) => 
      q.eq("movieId", movie._id).eq("positive", true)
    )
    .collect();
  
  // Get all negative likes (dislikes) for this movie
  const movieDislikes = await ctx.db
    .query("likes")
    .withIndex("by_movie_positive", (q: any) => 
      q.eq("movieId", movie._id).eq("positive", false)
    )
    .collect();
  
  // Get the user IDs from the likes and dislikes
  const likeUserIds = movieLikes.map((like: any) => like.userId);
  const dislikeUserIds = movieDislikes.map((dislike: any) => dislike.userId);
  
  // Fetch all the users who liked this movie
  const likedByUsers = await Promise.all(
    likeUserIds.map(async (userId: any) => {
      const user = await ctx.db.get(userId);
      // Only return the name field if user exists
      return user ? { name: user.name } : null;
    })
  );
  
  // Fetch all the users who disliked this movie
  const dislikedByUsers = await Promise.all(
    dislikeUserIds.map(async (userId: any) => {
      const user = await ctx.db.get(userId);
      // Only return the name field if user exists
      return user ? { name: user.name } : null;
    })
  );
  
  // Return the movie with the users who liked/disliked it
  return {
    ...movie,
    likedByUsers: likedByUsers.filter(user => user !== null),
    dislikedByUsers: dislikedByUsers.filter(user => user !== null)
  };
}

// Get all movies that haven't been rated by the specified user
export const getUnratedMovies = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // First get all movies
    const allMovies = await ctx.db.query("movies").collect();
    
    // Get all likes for this user
    const userLikes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Create a set of movieIds that the user has rated
    const ratedMovieIds = new Set(userLikes.map(like => like.movieId));
    
    // Filter out movies that the user has already rated
    const unratedMovies = allMovies.filter(movie => !ratedMovieIds.has(movie._id));
    
    // For each unrated movie, populate with user information
    return Promise.all(unratedMovies.map(movie => populateMovieWithUsers(ctx, movie)));
  },
});

// Get movies suggested by a specific user
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;
    if (!userId) return [];
    
    // Get movies suggested by this user
    const movies = await ctx.db
      .query("movies")
      .filter((q) => q.eq(q.field("suggestedBy"), userId))
      .collect();
    
    // Populate each movie with user information
    return Promise.all(movies.map(movie => populateMovieWithUsers(ctx, movie)));
  },
});

// Get movies liked by a specific user
export const listLikedByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const { userId } = args;
    if (!userId) return [];
    
    // Get all the user's positive likes using the new index
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user_positive", (q) => 
        q.eq("userId", userId).eq("positive", true)
      )
      .collect();
    
    // Get the movie IDs from the likes
    const movieIds = likes.map(like => like.movieId);
    
    // No likes? Return empty array
    if (movieIds.length === 0) return [];
    
    // Get all the movies that match these IDs
    const movies = await Promise.all(
      movieIds.map(id => ctx.db.get(id))
    );
    
    // Filter out any null values (in case a movie was deleted)
    const validMovies = movies.filter(movie => movie !== null);
    
    // Populate each movie with user information
    return Promise.all(validMovies.map(movie => populateMovieWithUsers(ctx, movie)));
  },
}); 