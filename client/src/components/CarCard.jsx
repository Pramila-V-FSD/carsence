import { Link } from "react-router-dom";
import { Heart, Fuel, Gauge, Shield, Zap } from "lucide-react";
import { useShortlist } from "../contexts/ShortlistContext";
import { formatPriceCompact, formatMileage, getCarImageUrl, getLocalSVGPlaceholder } from "../utils/formatters";
import StarRating from "./StarRating";

export default function CarCard({ car }) {
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();
  const shortlisted = isInShortlist(car._id);

  const handleShortlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (shortlisted) {
      await removeFromShortlist(car._id);
    } else {
      await addToShortlist(car._id);
    }
  };

  const avgRating =
    car.reviews && car.reviews.length > 0
      ? (car.reviews.reduce((sum, r) => sum + r.rating, 0) / car.reviews.length).toFixed(1)
      : 0;

  return (
    <Link to={`/car/${car._id}`} className="group relative flex flex-col bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/40" id={`car-${car._id}`}>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
        <img
          src={getCarImageUrl(car, 664, 374)}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = getLocalSVGPlaceholder(`${car.make} ${car.model}`, 664, 374);
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-sm text-slate-300">{car.bodyType}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-sm text-slate-300" data-fuel={car.fuelType}>
            {car.fuelType}
          </span>
        </div>
        <button
          className={`absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-sm border transition-colors duration-200 z-10 ${
            shortlisted ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-white/10 text-slate-400 hover:text-white"
          }`}
          onClick={handleShortlistToggle}
          aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
        >
          <Heart size={18} fill={shortlisted ? "#ef4444" : "none"} stroke={shortlisted ? "#ef4444" : "white"} />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors duration-200">
            {car.make} {car.model}
          </h3>
          <span className="text-xs text-slate-400 self-start text-right">{car.variant}</span>
        </div>

        <div className="text-xl font-extrabold text-blue-500 mb-4">{formatPriceCompact(car.price)}</div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-slate-400 border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <Fuel size={14} className="text-slate-500" />
            <span>{formatMileage(car.mileage, car.fuelType)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-slate-500" />
            <span>{car.engine?.power || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge size={14} className="text-slate-500" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-slate-500" />
            <span>{car.safetyRating ? `${car.safetyRating}★ Safe` : "N/A"}</span>
          </div>
        </div>

        {avgRating > 0 && (
          <div className="flex items-center gap-1.5 mt-auto border-t border-white/5 pt-3">
            <StarRating rating={parseFloat(avgRating)} size={12} />
            <span className="text-xs text-slate-400">
              {avgRating} ({car.reviews.length} reviews)
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
