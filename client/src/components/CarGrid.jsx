import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { carsAPI } from "../utils/api";
import CarCard from "./CarCard";
import FilterPanel from "./FilterPanel";

export default function CarGrid() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCars();
  }, [filters, sortBy, sortOrder]);

  const fetchCars = async (search = searchQuery) => {
    setLoading(true);
    try {
      const params = { ...filters, sortBy, sortOrder, limit: 60 };
      if (search) params.search = search;
      const res = await carsAPI.getAll(params);
      setCars(res.data.cars);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCars(searchQuery);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    fetchCars("");
  };

  const activeFilterCount = Object.keys(filters).filter(
    (k) => filters[k] && filters[k] !== ""
  ).length;

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6">
        <div className="flex flex-wrap justify-between items-end gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-white">Browse Catalog</h1>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{total} cars found</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <form className="relative flex items-center bg-slate-900 border border-white/5 focus-within:border-blue-500 rounded-xl px-4 py-3 w-full md:max-w-md transition-colors duration-200" onSubmit={handleSearch}>
            <Search size={18} className="text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Search by make, model, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white w-full outline-none placeholder:text-slate-500"
              id="car-search-input"
            />
            {searchQuery && (
              <button type="button" className="p-1 text-slate-500 hover:text-white transition-colors" onClick={() => {
                setSearchQuery("");
                fetchCars("");
              }}>
                <X size={16} />
              </button>
            )}
          </form>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              className={`flex items-center justify-center gap-2 border hover:bg-white/10 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 w-full md:w-auto ${
                showFilters ? "border-blue-500 text-blue-500 bg-blue-500/10" : "border-white/5 bg-white/5 text-slate-200"
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
              )}
            </button>

            <select
              className="bg-slate-900 border border-white/5 text-sm rounded-xl px-4 py-3 w-full md:w-auto text-white outline-none cursor-pointer focus:border-blue-500"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              id="car-sort-select"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="mileage-desc">Mileage: Best First</option>
              <option value="safetyRating-desc">Safety: Best First</option>
              <option value="year-desc">Year: Newest First</option>
            </select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button className="flex items-center gap-1.5 text-xs text-rose-500 hover:underline self-start" onClick={clearFilters}>
            <X size={14} /> Clear all filters
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        <div className="flex-grow w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden h-80 animate-pulse">
                  <div className="h-44 bg-slate-800"></div>
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-800 rounded w-full mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="text-4xl">🔍</div>
              <h3 className="text-lg font-bold text-white">No cars found</h3>
              <p className="text-sm text-slate-400">Try adjusting your filters or search query</p>
              <button className="mt-2 bg-blue-600/20 border border-blue-500 text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
