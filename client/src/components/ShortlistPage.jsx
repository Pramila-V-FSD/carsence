import { Link } from "react-router-dom";
import { Heart, Trash2, BarChart3, X } from "lucide-react";
import { useShortlist } from "../contexts/ShortlistContext";
import { formatPriceCompact, getCarImageUrl, getLocalSVGPlaceholder } from "../utils/formatters";

export default function ShortlistPage() {
  const { shortlist, removeFromShortlist, clearShortlist } = useShortlist();

  if (shortlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-500">
          <Heart size={28} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Shortlist is Empty</h2>
        <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
          Explore our catalog and click the heart icon on any car to save it here for quick access and comparison.
        </p>
        <Link to="/browse" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Heart size={24} className="text-rose-500 fill-rose-500" /> My Shortlist
          </h1>
          <p className="text-xs text-slate-400 mt-1">Saved models and compatibility summary</p>
        </div>
        
        <div className="flex gap-3">
          {shortlist.length >= 2 && (
            <Link to="/compare" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors">
              <BarChart3 size={14} /> Compare Saved ({shortlist.length})
            </Link>
          )}
          <button
            className="flex items-center gap-1.5 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            onClick={clearShortlist}
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {shortlist.map((entry) => {
          const car = entry.carId;
          if (!car) return null;

          return (
            <div key={entry._id} className="relative bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors duration-200 group">
              <button
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white transition-colors duration-200 z-10"
                onClick={() => removeFromShortlist(car._id)}
              >
                <X size={14} />
              </button>
              <Link to={`/car/${car._id}`} className="flex flex-col h-full">
                <img
                  src={getCarImageUrl(car, 400, 225)}
                  alt={`${car.make} ${car.model}`}
                  className="w-full aspect-[16/10] object-cover border-b border-white/5 group-hover:scale-[1.01] transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = getLocalSVGPlaceholder(`${car.make} ${car.model}`, 400, 225);
                  }}
                />
                <div className="p-4 flex flex-col justify-between flex-grow gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors duration-200">{car.make} {car.model}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{car.variant}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-1">
                    <span className="text-sm font-extrabold text-blue-500">{formatPriceCompact(car.price)}</span>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 uppercase">{car.fuelType}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 uppercase">{car.bodyType}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
