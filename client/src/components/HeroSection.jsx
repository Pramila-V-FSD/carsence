import { Link } from "react-router-dom";
import { Search, MessageCircle, Sparkles, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
      {/* Background glow effects */}
      <div className="absolute -top-40 left-1/4 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -top-20 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-xs font-semibold text-blue-400 mb-8">
          <Sparkles size={14} className="text-blue-400 animate-pulse" />
          <span>AI-Powered Car Recommendations</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] max-w-4xl">
          Find Your <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Perfect Car</span>
          <br />
          With Confidence
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-3xl mb-10 leading-relaxed">
          Confused about which car to buy? Our AI advisor analyzes 50+ cars across
          every segment — from budget hatchbacks to premium SUVs — and gives you
          personalized recommendations in seconds.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link to="/quiz" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200">
            <Sparkles size={18} className="text-amber-500 fill-amber-500/80" />
            Take Finder Quiz
            <ArrowRight size={16} />
          </Link>
          <Link to="/browse" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-3.5 rounded-xl hover:-translate-y-0.5 transition-all duration-200">
            <Search size={18} />
            Browse Catalog
          </Link>
          <button 
            className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold px-6 py-3 transition-colors duration-200" 
            onClick={() => document.getElementById('chat-toggle-btn')?.click()}
          >
            <MessageCircle size={18} />
            Chat with AI
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-6 max-w-4xl w-full border-t border-white/5 pt-10 text-slate-400 items-center justify-center">
          <div className="flex flex-col gap-1 items-center">
            <span className="text-3xl font-black text-white tracking-tight">50+</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cars in Database</span>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/5 mx-auto"></div>
          <div className="flex flex-col gap-1 items-center">
            <span className="text-3xl font-black text-white tracking-tight">15+</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Brands</span>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/5 mx-auto"></div>
          <div className="flex flex-col gap-1 items-center">
            <span className="text-3xl font-black text-white tracking-tight">6</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Car Segments</span>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/5 mx-auto"></div>
          <div className="flex flex-col gap-1 items-center">
            <span className="text-3xl font-black text-white tracking-tight">AI</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Smart Advisor</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mt-24 relative z-10">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-left hover:border-white/10 transition-colors duration-200">
          <div className="text-2xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-white mb-2">Smart Search</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Filter by budget, fuel type, body style, and more</p>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-left hover:border-white/10 transition-colors duration-200">
          <div className="text-2xl mb-4">🤖</div>
          <h3 className="text-lg font-bold text-white mb-2">AI Advisor</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Tell us your needs, get personalized recommendations</p>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-left hover:border-white/10 transition-colors duration-200">
          <div className="text-2xl mb-4">⚖️</div>
          <h3 className="text-lg font-bold text-white mb-2">Compare Cars</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Side-by-side comparison of specs, features & reviews</p>
        </div>
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-left hover:border-white/10 transition-colors duration-200">
          <div className="text-2xl mb-4">❤️</div>
          <h3 className="text-lg font-bold text-white mb-2">Shortlist</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Save favorites and build your confident shortlist</p>
        </div>
      </div>
    </section>
  );
}
