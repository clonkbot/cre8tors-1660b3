import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let creators = await ctx.db.query("creators").collect();

    if (args.city && args.city.trim() !== "") {
      creators = creators.filter((c) =>
        c.city.toLowerCase().includes(args.city!.toLowerCase())
      );
    }

    if (args.country && args.country.trim() !== "") {
      creators = creators.filter((c) =>
        c.country.toLowerCase().includes(args.country!.toLowerCase())
      );
    }

    if (args.skills && args.skills.length > 0) {
      creators = creators.filter((c) =>
        args.skills!.some((skill) => c.skills.includes(skill))
      );
    }

    return creators.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  },
});

export const getById = query({
  args: { id: v.id("creators") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("creators")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("creators").first();
    if (existing) return "Already seeded";

    const mockCreators = [
      {
        name: "Sofia Martinez",
        username: "sofiashootz",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
        city: "Los Angeles",
        country: "USA",
        bio: "Fashion & lifestyle photographer specializing in Instagram content. 5+ years creating viral social media campaigns for brands and influencers.",
        skills: ["photo"],
        specialties: ["Fashion", "Lifestyle", "Product"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@sofiashootz",
        email: "sofia@example.com",
        hourlyRate: 150,
        featured: true,
        createdAt: Date.now(),
      },
      {
        name: "Marcus Chen",
        username: "marcusvisuals",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        city: "New York",
        country: "USA",
        bio: "Cinematic videographer & content creator. I craft visual stories that stop the scroll. Worked with 50+ brands on Reels and TikTok content.",
        skills: ["video"],
        specialties: ["Reels", "TikTok", "Cinematic"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@marcusvisuals",
        email: "marcus@example.com",
        hourlyRate: 200,
        featured: true,
        createdAt: Date.now(),
      },
      {
        name: "Emma Blackwood",
        username: "emmacreates",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop",
        city: "London",
        country: "UK",
        bio: "Full-service content creator for Instagram, YouTube, and TikTok. Photo + video packages available. Specializing in beauty and travel content.",
        skills: ["photo", "video"],
        specialties: ["Beauty", "Travel", "UGC"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@emmacreates",
        email: "emma@example.com",
        hourlyRate: 175,
        featured: true,
        createdAt: Date.now(),
      },
      {
        name: "Kenji Tanaka",
        username: "kenjilens",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
        city: "Tokyo",
        country: "Japan",
        bio: "Street style and editorial photographer. Bringing Tokyo aesthetic to global brands. Expert in creating authentic, candid moments.",
        skills: ["photo"],
        specialties: ["Street Style", "Editorial", "Portrait"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@kenjilens",
        email: "kenji@example.com",
        hourlyRate: 180,
        featured: false,
        createdAt: Date.now(),
      },
      {
        name: "Aria Dupont",
        username: "ariafilms",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        city: "Paris",
        country: "France",
        bio: "Documentary-style videographer capturing authentic brand stories. From luxury fashion to indie startups, I make your story cinematic.",
        skills: ["video"],
        specialties: ["Documentary", "Brand Story", "Luxury"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@ariafilms",
        email: "aria@example.com",
        hourlyRate: 220,
        featured: false,
        createdAt: Date.now(),
      },
      {
        name: "Liam O'Connor",
        username: "liamocontent",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        city: "Dublin",
        country: "Ireland",
        bio: "Photo & video creator for hospitality and food brands. Making restaurants, hotels, and cafes look irresistible on social media.",
        skills: ["photo", "video"],
        specialties: ["Food", "Hospitality", "Interior"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@liamocontent",
        email: "liam@example.com",
        hourlyRate: 140,
        featured: false,
        createdAt: Date.now(),
      },
      {
        name: "Zara Ahmed",
        username: "zaravisual",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
        city: "Dubai",
        country: "UAE",
        bio: "Luxury content creator specializing in high-end fashion and lifestyle. Creating aspirational content for premium brands across the Middle East.",
        skills: ["photo", "video"],
        specialties: ["Luxury", "Fashion", "Lifestyle"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@zaravisual",
        email: "zara@example.com",
        hourlyRate: 250,
        featured: true,
        createdAt: Date.now(),
      },
      {
        name: "Carlos Rivera",
        username: "carlosshots",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
        city: "Mexico City",
        country: "Mexico",
        bio: "Vibrant, colorful photography for brands that want to stand out. Specializing in product launches and influencer collaborations.",
        skills: ["photo"],
        specialties: ["Product", "Colorful", "Campaigns"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@carlosshots",
        email: "carlos@example.com",
        hourlyRate: 120,
        featured: false,
        createdAt: Date.now(),
      },
      {
        name: "Nina Johansson",
        username: "ninaframes",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        city: "Stockholm",
        country: "Sweden",
        bio: "Minimalist aesthetic photographer. Clean lines, natural light, Scandinavian vibes. Perfect for lifestyle brands seeking understated elegance.",
        skills: ["photo"],
        specialties: ["Minimalist", "Lifestyle", "Interior"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@ninaframes",
        email: "nina@example.com",
        hourlyRate: 165,
        featured: false,
        createdAt: Date.now(),
      },
      {
        name: "Raj Patel",
        username: "rajcreates",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
        city: "Mumbai",
        country: "India",
        bio: "Bollywood-inspired content creator. Bringing drama, color, and energy to every frame. Expert in dance, music, and entertainment content.",
        skills: ["video"],
        specialties: ["Entertainment", "Music", "Dance"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@rajcreates",
        email: "raj@example.com",
        hourlyRate: 130,
        featured: false,
        createdAt: Date.now(),
      },
      {
        name: "Olivia Santos",
        username: "oliviavisuals",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
        city: "Sydney",
        country: "Australia",
        bio: "Outdoor and adventure content creator. Capturing the wild beauty of Australia and beyond. Perfect for travel and outdoor brands.",
        skills: ["photo", "video"],
        specialties: ["Adventure", "Travel", "Outdoor"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@oliviavisuals",
        email: "olivia@example.com",
        hourlyRate: 185,
        featured: false,
        createdAt: Date.now(),
      },
      {
        name: "Alex Kim",
        username: "alexkimstudio",
        avatar: "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=400&h=400&fit=crop",
        city: "Seoul",
        country: "South Korea",
        bio: "K-beauty and skincare content specialist. Understanding the Korean aesthetic and creating content that resonates with global beauty audiences.",
        skills: ["photo", "video"],
        specialties: ["Beauty", "Skincare", "K-Beauty"],
        portfolioImages: [
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=800&fit=crop",
        ],
        instagramHandle: "@alexkimstudio",
        email: "alex@example.com",
        hourlyRate: 190,
        featured: true,
        createdAt: Date.now(),
      },
    ];

    for (const creator of mockCreators) {
      await ctx.db.insert("creators", creator);
    }

    return "Seeded " + mockCreators.length + " creators";
  },
});
