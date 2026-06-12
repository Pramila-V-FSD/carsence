import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Plus, BarChart3 } from "lucide-react";
import { useShortlist } from "../contexts/ShortlistContext";
import { carsAPI, advisorAPI } from "../utils/api";
import { formatPrice, formatMileage, getCarImageUrl, getLocalSVGPlaceholder } from "../utils/formatters";
import StarRating from "./StarRating";

export default function CompareView() {
  const { shortlist } = useShortlist();
  const [compareCars, setCompareCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // AI Analysis states
  const [analysis, setAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const getAIAnalysis = async () => {
    if (compareCars.length < 2) return;
    setLoadingAnalysis(true);
    setAnalysisError("");
    try {
      const ids = compareCars.map(c => c._id);
      const res = await advisorAPI.compareAnalysis(ids);
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error("Failed to get comparison analysis:", err);
      setAnalysisError("Failed to generate AI advice. Please try again.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  useEffect(() => {
    // Auto-load shortlisted cars for comparison (up to 4)
    const shortlistedCars = shortlist
      .filter((s) => s.carId)
      .map((s) => s.carId)
      .slice(0, 4);
    setCompareCars(shortlistedCars);
    setAnalysis(""); // Reset AI analysis on shortlist change
  }, [shortlist]);

  const openPicker = async () => {
    try {
      const res = await carsAPI.getAll({ limit: 100 });
      setAllCars(res.data.cars);
      setShowPicker(true);
    } catch (err) {
      console.error("Failed to fetch cars for picker:", err);
    }
  };

  const addCar = (car) => {
    if (compareCars.length >= 4) return;
    if (compareCars.find((c) => c._id === car._id)) return;
    setCompareCars([...compareCars, car]);
    setAnalysis(""); // Reset AI analysis on car addition
    setShowPicker(false);
    setSearchTerm("");
  };

  const removeCar = (carId) => {
    setCompareCars(compareCars.filter((c) => c._id !== carId));
    setAnalysis(""); // Reset AI analysis on car removal
  };

  const filteredCars = allCars.filter(
    (car) =>
      !compareCars.find((c) => c._id === car._id) &&
      (`${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const specRows = [
    { label: "Price", getValue: (car) => formatPrice(car.price) },
    { label: "Body Type", getValue: (car) => car.bodyType },
    { label: "Fuel Type", getValue: (car) => car.fuelType },
    { label: "Transmission", getValue: (car) => car.transmission },
    { label: "Engine", getValue: (car) => car.engine?.power || "N/A" },
    { label: "Displacement", getValue: (car) => car.engine?.displacement ? `${car.engine.displacement}cc` : "N/A" },
    { label: "Torque", getValue: (car) => car.engine?.torque || "N/A" },
    { label: "Mileage", getValue: (car) => formatMileage(car.mileage, car.fuelType) },
    { label: "Safety Rating", getValue: (car) => car.safetyRating ? `${car.safetyRating} ★` : "N/A" },
    { label: "Seating", getValue: (car) => `${car.seatingCapacity} seats` },
    {
      label: "User Rating",
      getValue: (car) => {
        if (!car.reviews || car.reviews.length === 0) return "N/A";
        const avg = car.reviews.reduce((s, r) => s + r.rating, 0) / car.reviews.length;
        return `${avg.toFixed(1)} / 5`;
      },
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex items-center gap-3 border-b border-white/5 pb-6">
        <BarChart3 size={24} className="text-blue-500" />
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-none">Compare Cars</h1>
          <p className="text-sm text-slate-400 mt-1.5">Select up to 4 cars to compare side by side</p>
        </div>
      </div>

      {compareCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border border-dashed border-white/10 rounded-2xl bg-slate-900">
          <div className="text-4xl">⚖️</div>
          <h3 className="text-lg font-bold text-white">No cars to compare</h3>
          <p className="text-sm text-slate-400">Add cars from your shortlist or browse to start comparing.</p>
          <div className="flex items-center gap-4 mt-2">
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200" onClick={openPicker}>
              <Plus size={16} /> Add Cars
            </button>
            <Link to="/browse" className="bg-white/5 border border-white/10 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
              Browse Cars
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            {compareCars.map((car) => (
              <div key={car._id} className="relative bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center group">
                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white transition-colors duration-200 z-10" onClick={() => removeCar(car._id)}>
                  <X size={14} />
                </button>
                <img
                  src={getCarImageUrl(car, 300, 170)}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-24 object-cover rounded-lg mb-4 border border-white/5"
                  onError={(e) => {
                    e.target.src = getLocalSVGPlaceholder(`${car.make} ${car.model}`, 300, 170);
                  }}
                />
                <h4 className="text-sm font-bold text-white">{car.make} {car.model}</h4>
                <p className="text-[11px] text-slate-400 mt-1 truncate w-full">{car.variant}</p>
              </div>
            ))}
            {compareCars.length < 4 && (
              <button className="flex flex-col items-center justify-center bg-slate-900 border border-dashed border-white/10 hover:border-blue-500 hover:bg-blue-500/10 rounded-2xl p-8 min-h-[160px] gap-2.5 text-slate-500 hover:text-blue-500 transition-all duration-200 cursor-pointer" onClick={openPicker}>
                <Plus size={24} />
                <span className="text-xs font-bold uppercase tracking-wider">Add Car</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-white/5 rounded-2xl bg-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-48 bg-white/[0.01]">Specification</th>
                  {compareCars.map((car) => (
                    <th key={car._id} className="p-4 text-sm font-bold text-white">
                      {car.make} {car.model}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specRows.map((row) => (
                  <tr key={row.label} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-48 bg-white/[0.01]">{row.label}</td>
                    {compareCars.map((car) => (
                      <td key={car._id} className="p-4 text-sm text-slate-200">{row.getValue(car)}</td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-white/5 hover:bg-white/[0.01]">
                  <td className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-48 bg-white/[0.01]">Key Features</td>
                  {compareCars.map((car) => (
                    <td key={car._id} className="p-4 text-sm text-slate-200">
                      <ul className="list-disc pl-4 flex flex-col gap-1 text-xs text-slate-400">
                        {(car.features || []).slice(0, 5).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI Advisor Comparison Critique */}
          {compareCars.length >= 2 && (
            <div className="mt-10 bg-gradient-to-b from-blue-500/5 to-purple-500/5 border border-blue-500/10 rounded-2xl p-6 md:p-8 shadow-lg shadow-black/20">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl animate-pulse text-blue-400">✨</span>
                  <h3 className="text-base font-extrabold text-white">AI Advisor Smart Critique</h3>
                </div>
                {!analysis && !loadingAnalysis && (
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg transition-transform hover:-translate-y-0.5" onClick={getAIAnalysis}>
                    Generate AI Verdict
                  </button>
                )}
              </div>

              {loadingAnalysis && (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs">AI Advisor is comparing specs, customer feedback & market positioning...</p>
                </div>
              )}

              {analysisError && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <p className="text-sm text-rose-500">⚠️ {analysisError}</p>
                  <button onClick={getAIAnalysis} className="text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10">Retry Analysis</button>
                </div>
              )}

              {analysis && !loadingAnalysis && (
                <div className="animate-fadeIn">
                  <div
                    className="text-sm text-slate-300 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Car Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowPicker(false)}>
          <div className="bg-slate-900 border border-white/10 w-[450px] max-w-[calc(100vw-32px)] rounded-2xl flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h3 className="text-base font-bold text-white">Select a Car</h3>
              <button className="text-slate-400 hover:text-white" onClick={() => setShowPicker(false)}>
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              className="bg-slate-950 border border-white/5 rounded-xl px-4 py-3 mx-6 my-4 text-sm text-white outline-none focus:border-blue-500"
              placeholder="Search cars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="flex flex-col overflow-y-auto max-h-[300px] border-t border-white/5">
              {filteredCars.slice(0, 20).map((car) => (
                <button key={car._id} className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 text-left transition-colors duration-200 w-full" onClick={() => addCar(car)}>
                  <img
                    src={getCarImageUrl(car, 80, 50, car.make)}
                    alt=""
                    className="w-16 h-10 object-cover rounded border border-white/5"
                    onError={(e) => {
                      e.target.src = getLocalSVGPlaceholder(car.make, 80, 50);
                    }}
                  />
                  <div>
                    <span className="text-sm font-bold text-white block">{car.make} {car.model}</span>
                    <span className="text-xs text-slate-400">{car.variant} • {formatPrice(car.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
