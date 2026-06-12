import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { carsAPI } from "../utils/api";

export default function FilterPanel({ filters, onFilterChange, onClose }) {
  const [segments, setSegments] = useState({
    bodyTypes: [],
    fuelTypes: [],
    transmissions: [],
    makes: [],
    priceRange: { minPrice: 0, maxPrice: 100 },
  });
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const res = await carsAPI.getSegments();
      setSegments(res.data);
    } catch (err) {
      console.error("Failed to fetch segments:", err);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...localFilters };
    if (value === "" || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key, value) => {
    const current = localFilters[key] ? localFilters[key].split(",") : [];
    const index = current.indexOf(value);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    updateFilter(key, current.length > 0 ? current.join(",") : "");
  };

  const isSelected = (key, value) => {
    return localFilters[key] ? localFilters[key].split(",").includes(value) : false;
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-slate-900 border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <h3 className="text-base font-bold text-white">Filters</h3>
        <button className="md:hidden text-slate-400 hover:text-white p-1" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {[
        { label: "Body Type", key: "bodyType", options: segments.bodyTypes },
        { label: "Fuel Type", key: "fuelType", options: segments.fuelTypes },
        { label: "Transmission", key: "transmission", options: segments.transmissions },
        { label: "Brand", key: "make", options: segments.makes, scrollable: true },
      ].map((group) => (
        <div key={group.key} className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{group.label}</h4>
          <div className={`flex flex-wrap gap-2 ${group.scrollable ? "max-h-36 overflow-y-auto pr-1" : ""}`}>
            {group.options.map((opt) => (
              <button
                key={opt}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors duration-200 ${
                  isSelected(group.key, opt)
                    ? "border-blue-500 text-blue-500 bg-blue-500/10"
                    : "border-white/5 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
                }`}
                onClick={() => toggleArrayFilter(group.key, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price Range (₹ Lakhs)</h4>
        <div className="flex items-center gap-2.5">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice || ""}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600"
            min="0"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice || ""}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 placeholder:text-slate-600"
            min="0"
          />
        </div>
      </div>
    </aside>
  );
}
