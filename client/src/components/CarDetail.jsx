import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Fuel, Gauge, Shield, Zap, Users, Palette, Check, X as XIcon, ChevronRight } from "lucide-react";
import { carsAPI } from "../utils/api";
import { useShortlist } from "../contexts/ShortlistContext";
import { formatPrice, formatMileage, getCarImageUrl, getLocalSVGPlaceholder } from "../utils/formatters";
import StarRating from "./StarRating";

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();

  // Review submission state
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) {
      setSubmitError("Please fill out all fields.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      const res = await carsAPI.addReview(car._id, {
        author: author.trim(),
        rating,
        comment: comment.trim(),
      });
      setCar(res.data);
      setAuthor("");
      setRating(5);
      setComment("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to submit review:", err);
      setSubmitError(err.response?.data?.error || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const StarSelector = () => {
    return (
      <div className="flex gap-2 items-center h-10">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            className={`text-2xl transition-all duration-150 cursor-pointer ${
              star <= rating ? "text-amber-500 font-bold scale-110" : "text-white/10 hover:text-amber-500/50"
            }`}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    setLoading(true);
    try {
      const res = await carsAPI.getById(id);
      setCar(res.data);
    } catch (err) {
      console.error("Failed to fetch car:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400">Loading car details...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Car not found</h2>
        <Link to="/browse" className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/10">
          <ArrowLeft size={16} /> Back to Browse
        </Link>
      </div>
    );
  }

  const shortlisted = isInShortlist(car._id);
  const avgRating =
    car.reviews && car.reviews.length > 0
      ? (car.reviews.reduce((sum, r) => sum + r.rating, 0) / car.reviews.length).toFixed(1)
      : 0;

  const specItems = [
    { label: "Engine", val: car.engine?.power || "N/A", sub: car.engine?.displacement ? `${car.engine.displacement}cc` : "", icon: Zap },
    { label: "Mileage", val: formatMileage(car.mileage, car.fuelType), sub: car.fuelType, icon: Fuel },
    { label: "Transmission", val: car.transmission, icon: Gauge },
    { label: "Safety Rating", val: car.safetyRating ? `${car.safetyRating} Stars` : "N/A", icon: Shield },
    { label: "Seating", val: `${car.seatingCapacity} Seats`, icon: Users },
    { label: "Colors", val: `${car.colors?.length || 0} Options`, icon: Palette },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
        <Link to="/browse" className="hover:text-white transition-colors">Browse</Link>
        <ChevronRight size={14} />
        <span className="text-slate-300">{car.make} {car.model}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 relative bg-slate-900 border border-white/5 rounded-2xl overflow-hidden aspect-[16/9]">
          <img
            src={getCarImageUrl(car, 664, 374)}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = getLocalSVGPlaceholder(`${car.make} ${car.model}`, 664, 374);
            }}
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-sm text-slate-300">{car.bodyType}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-sm text-slate-300">{car.fuelType}</span>
            {car.safetyRating >= 5 && <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-500/90 text-white shadow-lg">⭐ 5-Star Safe</span>}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {car.make} {car.model}
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1">{car.variant} • {car.year}</p>
          </div>

          <div className="text-3xl font-black text-blue-500">{formatPrice(car.price)}</div>

          {avgRating > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={parseFloat(avgRating)} size={18} showValue />
              <span className="text-xs text-slate-400">({car.reviews.length} reviews)</span>
            </div>
          )}

          <p className="text-sm text-slate-400 leading-relaxed">{car.description}</p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              className={`flex items-center justify-center gap-2 border rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 ${
                shortlisted ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-white/10 text-slate-300 hover:bg-white/5"
              }`}
              onClick={() => shortlisted ? removeFromShortlist(car._id) : addToShortlist(car._id)}
            >
              <Heart size={18} fill={shortlisted ? "#ef4444" : "none"} />
              {shortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
            </button>
            <Link to="/compare" className="flex items-center justify-center border border-white/10 hover:bg-white/5 rounded-xl px-6 py-3.5 text-sm font-bold text-slate-300 transition-all duration-200">
              Compare Specs
            </Link>
          </div>
        </div>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 border-t border-b border-white/5 py-8 my-4">
        {specItems.map((spec) => {
          const Icon = spec.icon;
          return (
            <div key={spec.label} className="flex items-center gap-3 bg-slate-900 border border-white/5 rounded-xl p-4">
              <Icon size={22} className="text-blue-500 flex-shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{spec.label}</span>
                <span className="text-xs font-bold text-white mt-0.5 truncate">{spec.val}</span>
                <span className="text-[10px] text-slate-500 truncate">{spec.sub || "\u00A0"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
        {car.pros && car.pros.length > 0 && (
          <div className="bg-slate-900 border border-emerald-500/15 rounded-2xl p-6 md:p-8 flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2"><Check size={18} className="text-emerald-500" /> Pros</h3>
            <ul className="flex flex-col gap-3">
              {car.pros.map((pro, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                  <Check size={14} className="text-emerald-500 mt-1 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {car.cons && car.cons.length > 0 && (
          <div className="bg-slate-900 border border-rose-500/15 rounded-2xl p-6 md:p-8 flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2"><XIcon size={18} className="text-rose-500" /> Cons</h3>
            <ul className="flex flex-col gap-3">
              {car.cons.map((con, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                  <XIcon size={14} className="text-rose-500 mt-1 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Features */}
      {car.features && car.features.length > 0 && (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 md:p-8 my-4">
          <h3 className="text-base font-extrabold text-white">Key Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {car.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <Check size={14} className="text-blue-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {car.colors && car.colors.length > 0 && (
        <div>
          <h3 className="text-base font-extrabold text-white mb-4">Available Colors</h3>
          <div className="flex flex-wrap gap-2">
            {car.colors.map((color, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-xs font-semibold text-slate-300">{color}</span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">User Reviews</h3>
        
        {car.reviews && car.reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {car.reviews.map((review, i) => (
              <div key={i} className="bg-slate-900 border border-white/5 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{review.author}</span>
                    <StarRating rating={review.rating} size={12} />
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed pl-11">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">No reviews yet. Be the first to share your thoughts!</p>
        )}

        {/* Review Form */}
        <div className="mt-8 bg-slate-900 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h4 className="text-base font-bold text-white">Share Your Experience</h4>
            <p className="text-xs text-slate-500 mt-1">Help other car buyers by sharing your raw, honest driving feedback.</p>
          </div>

          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">
            {submitError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl">{submitError}</div>}
            {submitSuccess && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-xl">Review submitted successfully! Thank you.</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="review-author" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                <input
                  id="review-author"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  disabled={submitting}
                  className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</label>
                <StarSelector />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="review-comment" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Review</label>
              <textarea
                id="review-comment"
                placeholder="Share your thoughts about engine performance, ride comfort, safety features, and overall value..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                rows={4}
                className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 resize-none"
                required
              />
            </div>

            <button type="submit" className="self-start bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
