import { Link, useLocation } from "react-router-dom";
import { Car, Heart, BarChart3, Sparkles } from "lucide-react";
import { useShortlist } from "../contexts/ShortlistContext";

export default function Navbar() {
  const location = useLocation();
  const { shortlistCount } = useShortlist();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Brand Brand */}
        <Link to="/" className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight">
          <Car size={26} strokeWidth={2.5} className="text-blue-500" />
          <span>
            Car<span className="text-blue-500">Sense</span>
          </span>
        </Link>

        {/* Links Navigation */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-semibold transition-colors duration-200 py-2 ${
              isActive("/") ? "text-blue-500" : "text-slate-400 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/quiz"
            className={`text-sm font-semibold transition-colors duration-200 py-2 flex items-center gap-1.5 ${
              isActive("/quiz") ? "text-blue-500" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            Car Finder Quiz
          </Link>
          <Link
            to="/browse"
            className={`text-sm font-semibold transition-colors duration-200 py-2 ${
              isActive("/browse") ? "text-blue-500" : "text-slate-400 hover:text-white"
            }`}
          >
            Browse Cars
          </Link>
          <Link
            to="/compare"
            className={`text-sm font-semibold transition-colors duration-200 py-2 flex items-center gap-1.5 ${
              isActive("/compare") ? "text-blue-500" : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 size={14} />
            Compare
          </Link>
          <Link
            to="/shortlist"
            className={`text-sm font-semibold transition-colors duration-200 py-2 flex items-center gap-1.5 relative ${
              isActive("/shortlist") ? "text-blue-500" : "text-slate-400 hover:text-white"
            }`}
          >
            <Heart size={14} />
            Shortlist
            {shortlistCount > 0 && (
              <span className="absolute -top-1 -right-4 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-4 h-4">
                {shortlistCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
