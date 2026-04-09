import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";

type View = "browse" | "profile" | "messages" | "conversation";

interface Creator {
  _id: Id<"creators">;
  name: string;
  username: string;
  avatar: string;
  city: string;
  country: string;
  bio: string;
  skills: string[];
  specialties: string[];
  portfolioImages: string[];
  instagramHandle: string;
  email: string;
  hourlyRate?: number;
  featured: boolean;
}

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const seed = useMutation(api.creators.seed);

  useEffect(() => {
    if (isAuthenticated) {
      seed();
    }
  }, [isAuthenticated, seed]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <MainApp />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#FF6B4A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-display text-2xl text-white">Loading</p>
      </div>
    </div>
  );
}

function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Film grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#FF6B4A]/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FF6B4A]/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-5xl md:text-6xl text-white mb-3 tracking-tight">
              Cre<span className="text-[#FF6B4A]">8</span>tors
            </h1>
            <p className="text-[#888] font-body text-lg">Find your perfect visual storyteller</p>
          </div>

          {/* Auth Card */}
          <div className="bg-[#111]/80 backdrop-blur-xl border border-[#222] rounded-2xl p-8 animate-slide-up">
            <h2 className="font-display text-2xl text-white mb-6">
              {flow === "signIn" ? "Welcome back" : "Join the community"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[#666] text-sm mb-2 font-body">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white font-body placeholder-[#555] focus:outline-none focus:border-[#FF6B4A] transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[#666] text-sm mb-2 font-body">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white font-body placeholder-[#555] focus:outline-none focus:border-[#FF6B4A] transition-colors"
                  placeholder="Enter password"
                />
              </div>
              <input name="flow" type="hidden" value={flow} />

              {error && (
                <p className="text-red-400 text-sm font-body">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B4A] hover:bg-[#ff5a35] text-white font-body font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
              >
                {loading ? "..." : flow === "signIn" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-[#888] hover:text-white transition-colors font-body text-sm"
              >
                {flow === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#222]">
              <button
                onClick={() => signIn("anonymous")}
                className="w-full border border-[#333] hover:border-[#FF6B4A] text-[#888] hover:text-white py-3 rounded-lg transition-all font-body text-sm"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

function MainApp() {
  const [view, setView] = useState<View>("browse");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [conversationUserId, setConversationUserId] = useState<Id<"users"> | null>(null);

  const openProfile = (creator: Creator) => {
    setSelectedCreator(creator);
    setView("profile");
  };

  const openConversation = (userId: Id<"users">) => {
    setConversationUserId(userId);
    setView("conversation");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      {/* Film grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {view === "browse" && <BrowseView onSelectCreator={openProfile} onOpenMessages={() => setView("messages")} />}
      {view === "profile" && selectedCreator && (
        <ProfileView
          creator={selectedCreator}
          onBack={() => setView("browse")}
          onMessage={openConversation}
        />
      )}
      {view === "messages" && (
        <MessagesView onBack={() => setView("browse")} onOpenConversation={openConversation} />
      )}
      {view === "conversation" && conversationUserId && (
        <ConversationView userId={conversationUserId} onBack={() => setView("messages")} />
      )}
    </div>
  );
}

function BrowseView({
  onSelectCreator,
  onOpenMessages,
}: {
  onSelectCreator: (c: Creator) => void;
  onOpenMessages: () => void;
}) {
  const { signOut } = useAuthActions();
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const unreadCount = useQuery(api.messages.getUnreadCount) ?? 0;

  const creators = useQuery(api.creators.list, {
    city: search,
    skills: skillFilter.length > 0 ? skillFilter : undefined,
  });

  const toggleSkill = (skill: string) => {
    setSkillFilter((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl md:text-3xl text-white">
            Cre<span className="text-[#FF6B4A]">8</span>tors
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMessages}
              className="relative p-2 text-[#888] hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6B4A] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => signOut()}
              className="text-[#666] hover:text-white transition-colors text-sm font-body"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="sticky top-[73px] z-30 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#1a1a1a] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by city or country..."
                className="w-full bg-[#111] border border-[#222] rounded-xl pl-12 pr-4 py-3 text-white font-body placeholder-[#555] focus:outline-none focus:border-[#FF6B4A] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {["photo", "video"].map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-5 py-3 rounded-xl font-body text-sm font-medium transition-all ${
                    skillFilter.includes(skill)
                      ? "bg-[#FF6B4A] text-white"
                      : "bg-[#111] border border-[#222] text-[#888] hover:border-[#FF6B4A] hover:text-white"
                  }`}
                >
                  {skill === "photo" ? "Photography" : "Videography"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {creators === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111] rounded-2xl h-[400px] animate-pulse" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#666] font-body text-lg">No creators found</p>
            <p className="text-[#444] font-body text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator: Creator, idx: number) => (
              <CreatorCard
                key={creator._id}
                creator={creator as Creator}
                onClick={() => onSelectCreator(creator as Creator)}
                delay={idx * 0.05}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function CreatorCard({
  creator,
  onClick,
  delay,
}: {
  creator: Creator;
  onClick: () => void;
  delay: number;
}) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative bg-[#111] rounded-2xl overflow-hidden border border-[#1a1a1a] transition-all duration-500 hover:border-[#FF6B4A]/50 hover:shadow-2xl hover:shadow-[#FF6B4A]/10 transform hover:-translate-y-2 hover:rotate-[0.5deg]">
        {/* Portfolio Preview */}
        <div className="aspect-[4/5] relative overflow-hidden">
          <img
            src={creator.portfolioImages[0]}
            alt={creator.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

          {/* Featured Badge */}
          {creator.featured && (
            <div className="absolute top-4 left-4 bg-[#FF6B4A] text-white text-xs font-body font-semibold px-3 py-1 rounded-full">
              Featured
            </div>
          )}

          {/* Skills Tags */}
          <div className="absolute top-4 right-4 flex gap-2">
            {creator.skills.includes("photo") && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-body">
                Photo
              </span>
            )}
            {creator.skills.includes("video") && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-body">
                Video
              </span>
            )}
          </div>

          {/* Creator Info */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
              />
              <div>
                <h3 className="font-display text-xl text-white">{creator.name}</h3>
                <p className="text-[#888] text-sm font-body">{creator.instagramHandle}</p>
              </div>
            </div>
            <p className="text-[#aaa] text-sm font-body flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {creator.city}, {creator.country}
            </p>
          </div>
        </div>

        {/* Specialties */}
        <div className="p-5 pt-0">
          <div className="flex flex-wrap gap-2">
            {creator.specialties.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="text-xs font-body text-[#666] border border-[#222] px-2 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({
  creator,
  onBack,
  onMessage,
}: {
  creator: Creator;
  onBack: () => void;
  onMessage: (userId: Id<"users">) => void;
}) {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 bg-[#111]/90 backdrop-blur-sm border border-[#222] p-3 rounded-full text-white hover:bg-[#222] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <img
          src={creator.portfolioImages[0]}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
      </div>

      {/* Profile Content */}
      <div className="relative -mt-32 md:-mt-48 z-10 max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-[#111] border border-[#1a1a1a] rounded-3xl p-6 md:p-10 animate-slide-up">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-8">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-[#FF6B4A]/30 object-cover"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-3xl md:text-4xl text-white">{creator.name}</h1>
                {creator.featured && (
                  <span className="bg-[#FF6B4A] text-white text-xs font-body font-semibold px-3 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-[#FF6B4A] font-body mb-1">{creator.instagramHandle}</p>
              <p className="text-[#888] font-body flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {creator.city}, {creator.country}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-[#FF6B4A] hover:bg-[#ff5a35] text-white font-body font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105"
              >
                Contact Creator
              </button>
              {creator.hourlyRate && (
                <p className="text-center text-[#666] font-body text-sm">
                  From ${creator.hourlyRate}/hour
                </p>
              )}
            </div>
          </div>

          {/* Skills & Specialties */}
          <div className="flex flex-wrap gap-2 mb-8">
            {creator.skills.map((skill) => (
              <span
                key={skill}
                className="bg-[#FF6B4A]/10 text-[#FF6B4A] font-body text-sm font-medium px-4 py-2 rounded-full"
              >
                {skill === "photo" ? "Photography" : "Videography"}
              </span>
            ))}
            {creator.specialties.map((spec) => (
              <span
                key={spec}
                className="bg-[#1a1a1a] text-[#888] font-body text-sm px-4 py-2 rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Bio */}
          <div className="mb-10">
            <h2 className="font-display text-xl text-white mb-4">About</h2>
            <p className="text-[#aaa] font-body leading-relaxed">{creator.bio}</p>
          </div>

          {/* Portfolio */}
          <div>
            <h2 className="font-display text-xl text-white mb-6">Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creator.portfolioImages.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`Portfolio ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          creator={creator}
          onClose={() => setShowContactModal(false)}
          onMessage={onMessage}
        />
      )}

      <Footer />
    </div>
  );
}

function ContactModal({
  creator,
  onClose,
  onMessage,
}: {
  creator: Creator;
  onClose: () => void;
  onMessage: (userId: Id<"users">) => void;
}) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const sendMessage = useMutation(api.messages.send);
  const users = useQuery(api.users.getCurrentUser);

  const handleSend = async () => {
    if (!message.trim() || !users) return;

    // For demo, we'll use the current user's ID as receiver since we don't have creator user IDs
    // In a real app, creators would have associated user accounts
    try {
      await sendMessage({
        receiverId: users._id, // This is a demo - in production, map creator to user
        content: `Message for ${creator.name}: ${message}`,
        creatorId: creator._id,
      });
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      // Handle error silently for demo
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#222] rounded-3xl p-6 md:p-8 w-full max-w-lg animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#FF6B4A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#FF6B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2">Message Sent!</h3>
            <p className="text-[#888] font-body">{creator.name} will get back to you soon</p>
          </div>
        ) : (
          <>
            <h3 className="font-display text-2xl text-white mb-6">Contact {creator.name}</h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-xl">
                <svg className="w-5 h-5 text-[#FF6B4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-white font-body">{creator.email}</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-xl">
                <svg className="w-5 h-5 text-[#FF6B4A]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
                <span className="text-white font-body">{creator.instagramHandle}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[#666] text-sm mb-2 font-body">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white font-body placeholder-[#555] focus:outline-none focus:border-[#FF6B4A] transition-colors resize-none"
                placeholder="Hi! I'm interested in working with you..."
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-full bg-[#FF6B4A] hover:bg-[#ff5a35] disabled:opacity-50 disabled:hover:bg-[#FF6B4A] text-white font-body font-semibold py-3 rounded-xl transition-all"
            >
              Send Message
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MessagesView({
  onBack,
  onOpenConversation,
}: {
  onBack: () => void;
  onOpenConversation: (userId: Id<"users">) => void;
}) {
  const conversations = useQuery(api.messages.listConversations);
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-[#888] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-display text-2xl text-white">Messages</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {conversations === undefined ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#111] rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[#666] font-body text-lg">No messages yet</p>
            <p className="text-[#444] font-body text-sm mt-2">Start a conversation with a creator</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv: { _id: string; participantIds: Id<"users">[]; lastMessagePreview: string; lastMessageAt: number }) => {
              const otherUserId = conv.participantIds.find(
                (id: Id<"users">) => id !== currentUser?._id
              );
              if (!otherUserId) return null;

              return (
                <button
                  key={conv._id}
                  onClick={() => onOpenConversation(otherUserId)}
                  className="w-full bg-[#111] hover:bg-[#161616] border border-[#1a1a1a] rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FF6B4A]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#FF6B4A] font-display text-lg">C</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-body font-medium truncate">Conversation</p>
                      <p className="text-[#666] font-body text-sm truncate">{conv.lastMessagePreview}</p>
                    </div>
                    <span className="text-[#444] text-xs font-body">
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ConversationView({
  userId,
  onBack,
}: {
  userId: Id<"users">;
  onBack: () => void;
}) {
  const [newMessage, setNewMessage] = useState("");
  const messages = useQuery(api.messages.getConversation, { otherUserId: userId });
  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.messages.markAsRead);
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    markAsRead({ otherUserId: userId });
  }, [userId, markAsRead]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage({
      receiverId: userId,
      content: newMessage,
    });
    setNewMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-[#888] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF6B4A]/20 rounded-full flex items-center justify-center">
              <span className="text-[#FF6B4A] font-display">C</span>
            </div>
            <span className="font-body text-white">Conversation</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 overflow-y-auto">
        {messages === undefined ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className="bg-[#111] rounded-xl h-16 w-48 animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#666] font-body">No messages yet. Say hi!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: { _id: string; senderId: Id<"users">; content: string; createdAt: number }) => {
              const isMine = msg.senderId === currentUser?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isMine
                        ? "bg-[#FF6B4A] text-white rounded-br-sm"
                        : "bg-[#1a1a1a] text-white rounded-bl-sm"
                    }`}
                  >
                    <p className="font-body">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-[#666]"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#1a1a1a] p-4">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-3 text-white font-body placeholder-[#555] focus:outline-none focus:border-[#FF6B4A] transition-colors"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#FF6B4A] hover:bg-[#ff5a35] disabled:opacity-50 text-white px-5 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-6 text-center border-t border-[#1a1a1a] bg-[#0a0a0a]">
      <p className="text-[#444] text-xs font-body">
        Requested by <a href="https://twitter.com/kevinfine" target="_blank" rel="noopener noreferrer" className="text-[#666] hover:text-[#FF6B4A] transition-colors">@kevinfine</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="text-[#666] hover:text-[#FF6B4A] transition-colors">@clonkbot</a>
      </p>
    </footer>
  );
}

export default App;
