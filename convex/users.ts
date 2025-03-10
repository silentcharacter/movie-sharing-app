import { query } from "./_generated/server";
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