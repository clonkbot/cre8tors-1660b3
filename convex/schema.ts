import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  creators: defineTable({
    name: v.string(),
    username: v.string(),
    avatar: v.string(),
    city: v.string(),
    country: v.string(),
    bio: v.string(),
    skills: v.array(v.string()), // ["photo", "video"]
    specialties: v.array(v.string()),
    portfolioImages: v.array(v.string()),
    instagramHandle: v.string(),
    email: v.string(),
    hourlyRate: v.optional(v.number()),
    featured: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_city", ["city"])
    .index("by_country", ["country"])
    .index("by_featured", ["featured"]),

  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    conversationId: v.string(),
    content: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId", "createdAt"])
    .index("by_receiver", ["receiverId", "read"]),

  conversations: defineTable({
    participantIds: v.array(v.id("users")),
    creatorId: v.optional(v.id("creators")),
    lastMessageAt: v.number(),
    lastMessagePreview: v.string(),
  }).index("by_last_message", ["lastMessageAt"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    avatar: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
