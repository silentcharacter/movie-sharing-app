import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByTelegramId = query({
  args: { telegramId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_telegramId", (q) => q.eq("telegramId", args.telegramId))
      .first();
  },
});

export const getOrCreateByTelegramUser = mutation({
  args: { 
    telegramUser: v.object({
      id: v.union(v.number(), v.string()),
      first_name: v.optional(v.string()),
      last_name: v.optional(v.string()),
      username: v.optional(v.string()),
      // Add other telegram user fields as needed
    }) 
  },
  handler: async (ctx, args) => {
    const { telegramUser } = args;
    const telegramId = telegramUser.id.toString();
    
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_telegramId", (q) => q.eq("telegramId", telegramId))
      .first();
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create name from first_name and last_name
    const firstName = telegramUser.first_name || "";
    const lastName = telegramUser.last_name || "";
    const name = `${firstName} ${lastName}`.trim();
    
    // Generate a nickname from username or name
    const nick = telegramUser.username || name.split(" ")[0] || "user";
    
    // User doesn't exist, create a new one
    const userId = await ctx.db.insert("users", {
      telegramId,
      name,
      nick,
    });
    
    return await ctx.db.get(userId);
  },
}); 