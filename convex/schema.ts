import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  movies: defineTable({
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
  })
    .index("by_imdbID", ["imdbID"])
    .index("by_title", ["title"])
    .index("by_year", ["year"])
    .index("by_genre", ["genre"])
    .index("by_suggestedBy", ["suggestedBy"]),

  users: defineTable({
    telegramId: v.string(),
    name: v.string(),
    nick: v.string(),
  })
    .index("by_telegramId", ["telegramId"])
    .index("by_nick", ["nick"]),

  likes: defineTable({
    userId: v.id("users"),
    movieId: v.id("movies"),
    positive: v.boolean(),
    createdAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_movie", ["movieId"])
    .index("by_user_positive", ["userId", "positive"]),
});
