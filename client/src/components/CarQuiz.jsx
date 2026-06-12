import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, HelpCircle, Check, ArrowRight, ArrowLeft, Heart, RotateCcw } from "lucide-react";
import { carsAPI } from "../utils/api";
import { useShortlist } from "../contexts/ShortlistContext";
import { formatPriceCompact, getCarImageUrl, getLocalSVGPlaceholder } from "../utils/formatters";

const QUIZ_STEPS = [
  {
    id: "budget",
    title: "What is your budget range?",
    subtitle: "Select the price bracket that fits your budget comfortably.",
    options: [
      { label: "Under ₹8 Lakhs", desc: "Budget friendly hatchbacks & sub-compacts", min: 0, max: 8 },
      { label: "₹8 - ₹15 Lakhs", desc: "Mid-range sedans, premium hatchbacks & compact SUVs", min: 8, max: 15 },
      { label: "₹15 - ₹25 Lakhs", desc: "Premium SUVs, executive sedans & electric vehicles", min: 15, max: 25 },
      { label: "Above ₹25 Lakhs", desc: "Luxury, high-end performance SUVs & long-range EVs", min: 25, max: 999 },
    ],
  },
  {
    id: "usage",
    title: "What is your primary use case?",
    subtitle: "This helps us understand the size, build, and features you need.",
    options: [
      { label: "Daily City Commute", desc: "Navigating heavy traffic, easy parking, low running costs", key: "city" },
      { label: "Family Trips & Comfort", desc: "Spacious cabin, 5-7 seats, smooth highway ride", key: "family" },
      { label: "Highway Cruising & Travel", desc: "Stable at high speeds, powerful engine, spacious boot", key: "highway" },
      { label: "Off-Roading & Adventure", desc: "High ground clearance, rugged build, commanding stance", key: "offroad" },
    ],
  },
  {
    id: "fuel",
    title: "What is your fuel type preference?",
    subtitle: "Eco-friendliness or conventional high range — your choice.",
    options: [
      { label: "Petrol", desc: "Refined, smooth driving, lower initial cost", value: "Petrol" },
      { label: "Diesel", desc: "Excellent torque, great highway efficiency", value: "Diesel" },
      { label: "Electric / EV", desc: "Zero emissions, extremely low running cost, silent drive", value: "Electric" },
      { label: "Hybrid", desc: "Combining petrol efficiency with electric assist", value: "Hybrid" },
      { label: "No Preference", desc: "I am open to whatever matches my other criteria", value: null },
    ],
  },
  {
    id: "transmission",
    title: "Preferred Transmission Type?",
    subtitle: "Do you prefer manual gear shifts or automatic convenience?",
    options: [
      { label: "Automatic", desc: "Bumper-to-bumper traffic ease (CVT, DCT, AMT)", value: "Automatic,CVT,DCT,AMT,AMT" },
      { label: "Manual", desc: "Maximum control, engaging driving feedback", value: "Manual" },
      { label: "No Preference", desc: "Either manual or automatic works for me", value: null },
    ],
  },
  {
    id: "priority",
    title: "What is your absolute top priority?",
    subtitle: "Select the single feature highlight that matters most.",
    options: [
      { label: "Top-Tier Safety", desc: "NCAP 5-star safety ratings, robust build & airbags", priority: "safety" },
      { label: "Excellent Fuel Economy", desc: "Higher km/l mileage or longer electric battery range", priority: "mileage" },
      { label: "Power & Performance", desc: "Thrilling acceleration, strong bhp & torque outputs", priority: "performance" },
      { label: "Connected Tech & Comfort", desc: "Touchscreens, ventilation, sunroof & ADAS features", priority: "tech" },
    ],
  },
];

export default function CarQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    budget: null,
    usage: null,
    fuel: null,
    transmission: null,
    priority: null,
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const { addToShortlist, removeFromShortlist, isInShortlist } = useShortlist();

  const handleOptionSelect = (option) => {
    setSelections((prev) => ({
      ...prev,
      [QUIZ_STEPS[currentStep].id]: option,
    }));
  };

  const nextStep = () => {
    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResults = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      
      const budgetSel = selections.budget;
      if (budgetSel) {
        params.minPrice = budgetSel.min;
        params.maxPrice = budgetSel.max;
      }

      const fuelSel = selections.fuel;
      if (fuelSel && fuelSel.value) {
        params.fuelType = fuelSel.value;
      }

      const transSel = selections.transmission;
      if (transSel && transSel.value) {
        params.transmission = transSel.value;
      }

      const usageSel = selections.usage;
      if (usageSel && usageSel.key === "offroad") {
        params.bodyType = "SUV";
      }

      const res = await carsAPI.getAll(params);
      let matchedCars = res.data.cars || [];

      if (matchedCars.length < 3) {
        const relaxedParams = {
          limit: 100,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
        };
        const relaxedRes = await carsAPI.getAll(relaxedParams);
        matchedCars = relaxedRes.data.cars || [];
      }

      const scoredCars = matchedCars.map((car) => {
        let score = 50;

        if (budgetSel) {
          const midPoint = (budgetSel.min + budgetSel.max) / 2;
          const diff = Math.abs(car.price - midPoint);
          const range = budgetSel.max - budgetSel.min;
          const budgetFactor = Math.max(0, 1 - diff / range);
          score += budgetFactor * 15;
        }

        if (fuelSel && fuelSel.value && car.fuelType === fuelSel.value) {
          score += 15;
        }

        if (transSel && transSel.value) {
          if (transSel.value.includes(car.transmission)) {
            score += 10;
          }
        }

        if (usageSel) {
          if (usageSel.key === "family" && car.seatingCapacity >= 7) {
            score += 15;
          } else if (usageSel.key === "city" && car.mileage >= 18) {
            score += 15;
          } else if (usageSel.key === "highway" && (car.engine?.power && parseInt(car.engine.power) > 110)) {
            score += 15;
          } else if (usageSel.key === "offroad" && car.bodyType === "SUV") {
            score += 15;
          }
        }

        const prioritySel = selections.priority;
        if (prioritySel) {
          if (prioritySel.priority === "safety" && car.safetyRating) {
            score += car.safetyRating * 4;
          } else if (prioritySel.priority === "mileage" && car.mileage) {
            score += Math.min(20, (car.mileage / 25) * 20);
          } else if (prioritySel.priority === "performance" && car.engine?.power) {
            const powerVal = parseInt(car.engine.power) || 0;
            score += Math.min(20, (powerVal / 200) * 20);
          } else if (prioritySel.priority === "tech") {
            const featureCount = car.features?.length || 0;
            score += Math.min(20, (featureCount / 10) * 20);
          }
        }

        const finalScore = Math.min(98, Math.max(65, Math.round(score)));

        return {
          ...car,
          matchScore: finalScore,
        };
      });

      scoredCars.sort((a, b) => b.matchScore - a.matchScore);
      setResults(scoredCars.slice(0, 3));
      setQuizCompleted(true);
    } catch (err) {
      console.error("Failed to run matching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setSelections({
      budget: null,
      usage: null,
      fuel: null,
      transmission: null,
      priority: null,
    });
    setResults([]);
    setQuizCompleted(false);
  };

  const getPriorityBadge = (car) => {
    const priority = selections.priority?.priority;
    if (priority === "safety" && car.safetyRating) return `⭐ ${car.safetyRating}-Star NCAP`;
    if (priority === "mileage" && car.mileage) return `⛽ ${car.mileage} km/l`;
    if (priority === "performance" && car.engine?.power) return `⚡ ${car.engine.power}`;
    return `${car.bodyType} • ${car.fuelType}`;
  };

  const renderProgress = () => {
    const total = QUIZ_STEPS.length;
    const pct = (currentStep / (total - 1)) * 100;
    return (
      <div className="relative h-1 bg-white/5 rounded-full mb-8 mt-2">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between">
          {QUIZ_STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors duration-200 ${
                idx < currentStep
                  ? "bg-blue-600 border-blue-600 text-white"
                  : idx === currentStep
                  ? "bg-slate-950 border-blue-500 text-white border-2 shadow shadow-blue-500/30"
                  : "bg-slate-900 border border-white/10 text-slate-500"
              }`}
            >
              {idx < currentStep ? <Check size={10} /> : idx + 1}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-white mt-2">Calculating Compatibility Matches...</h2>
        <p className="text-sm text-slate-400">AI Advisor is parsing your responses, searching models, and scoring specs...</p>
      </section>
    );
  }

  if (quizCompleted) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-blue-500/10 border border-blue-500 text-blue-400 text-[10px] font-bold uppercase rounded-full tracking-wider animate-bounce">
            <Sparkles size={12} /> Match Complete
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Your AI Car Shortlist</h1>
          <p className="text-sm text-slate-400 max-w-xl">We analyzed our database against your criteria. Here are your top 3 matching models:</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {results.map((car, idx) => {
            const isShortlisted = isInShortlist(car._id);
            const positionBadge = ["🥇 Top Choice", "🥈 Great Value", "🥉 Smart Choice"][idx];

            return (
              <div key={car._id} className="relative bg-slate-800 border border-white/5 hover:border-white/15 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 flex flex-col" data-rank={idx + 1}>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 z-10">{positionBadge}</div>
                <div className="absolute top-4 right-4 bg-slate-900 border border-white/5 w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg z-10">
                  <span className="text-sm font-black text-blue-500">{car.matchScore}%</span>
                  <span className="text-[7px] text-slate-500 uppercase font-bold tracking-wider">Match</span>
                </div>
                
                <img
                  src={getCarImageUrl(car, 400, 225)}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-48 object-cover border-b border-white/5"
                  onError={(e) => {
                    e.target.src = getLocalSVGPlaceholder(`${car.make} ${car.model}`, 400, 225);
                  }}
                />

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="text-base font-extrabold text-white leading-tight">{car.make} {car.model}</h3>
                    <span className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded text-slate-300 font-semibold uppercase">{getPriorityBadge(car)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{car.variant} • {car.year}</p>
                  <div className="text-2xl font-black text-blue-500 mb-4">{formatPriceCompact(car.price)}</div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6 flex-grow">{car.description}</p>

                  <div className="border-t border-white/5 pt-4 mb-6">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Why it fits:</span>
                    <ul className="flex flex-col gap-2">
                      {car.pros?.slice(0, 2).map((pro, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <Check size={12} className="text-emerald-500 flex-shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Link to={`/car/${car._id}`} className="flex-grow bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 text-blue-500 hover:text-white font-bold py-2.5 rounded-xl text-xs text-center transition-colors duration-200">
                      View Details
                    </Link>
                    <button
                      className={`p-2.5 rounded-xl border transition-colors duration-200 cursor-pointer ${
                        isShortlisted ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-white/10 text-slate-400 hover:text-white"
                      }`}
                      onClick={() => isShortlisted ? removeFromShortlist(car._id) : addToShortlist(car._id)}
                      aria-label="Add to shortlist"
                    >
                      <Heart size={16} fill={isShortlisted ? "#ef4444" : "none"} stroke={isShortlisted ? "#ef4444" : "white"} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center items-center gap-4 border-t border-white/5 pt-8">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 px-6 py-3 rounded-full text-xs font-bold hover:bg-white/10 transition-colors" onClick={resetQuiz}>
            <RotateCcw size={14} /> Retake Finder Quiz
          </button>
          <Link to="/browse" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-xs font-bold transition-colors shadow-lg">
            Browse All Cars
          </Link>
        </div>
      </section>
    );
  }

  const stepData = QUIZ_STEPS[currentStep];
  const selectedOption = selections[stepData.id];

  return (
    <section className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        {renderProgress()}

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 md:p-10 shadow-xl flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl text-blue-500 flex items-center justify-center flex-shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">{stepData.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{stepData.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {stepData.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={idx}
                  className={`flex items-center gap-4 bg-white/[0.01] hover:bg-white/[0.03] border rounded-xl p-5 text-left transition-all duration-200 group cursor-pointer ${
                    isSelected ? "border-blue-500 bg-blue-500/10" : "border-white/5 hover:border-white/15"
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/40 ${
                    isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-white/20"
                  }`}>
                    {isSelected && <Check size={10} />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-tight">{option.label}</span>
                    <span className="text-xs text-slate-400 mt-1 block leading-tight">{option.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-2">
            <button
              className="flex items-center gap-1.5 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft size={14} /> Back
            </button>
            
            <button
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={nextStep}
              disabled={!selectedOption}
            >
              {currentStep === QUIZ_STEPS.length - 1 ? "Get Matches" : "Next"}{" "}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
