import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function getConversationId(id1: string, id2: string): string {
  return [id1, id2].sort().join("_");
}

export const send = mutation({
  args: {
    receiverId: v.id("users"),
    content: v.string(),
    creatorId: v.optional(v.id("creators")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversationId = getConversationId(userId, args.receiverId);

    // Create or update conversation
    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participantIds"), [userId, args.receiverId]),
          q.eq(q.field("participantIds"), [args.receiverId, userId])
        )
      )
      .first();

    if (existingConversation) {
      await ctx.db.patch(existingConversation._id, {
        lastMessageAt: Date.now(),
        lastMessagePreview:
          args.content.substring(0, 50) + (args.content.length > 50 ? "..." : ""),
      });
    } else {
      await ctx.db.insert("conversations", {
        participantIds: [userId, args.receiverId],
        creatorId: args.creatorId,
        lastMessageAt: Date.now(),
        lastMessagePreview:
          args.content.substring(0, 50) + (args.content.length > 50 ? "..." : ""),
      });
    }

    // Create message
    return await ctx.db.insert("messages", {
      senderId: userId,
      receiverId: args.receiverId,
      conversationId,
      content: args.content,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const getConversation = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversationId = getConversationId(userId, args.otherUserId);

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .collect();
  },
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_last_message")
      .order("desc")
      .collect();

    return conversations.filter((c) => c.participantIds.includes(userId));
  },
});

export const markAsRead = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversationId = getConversationId(userId, args.otherUserId);

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", conversationId))
      .filter((q) => q.and(q.eq(q.field("receiverId"), userId), q.eq(q.field("read"), false)))
      .collect();

    for (const msg of unreadMessages) {
      await ctx.db.patch(msg._id, { read: true });
    }
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", userId).eq("read", false))
      .collect();

    return unread.length;
  },
});
