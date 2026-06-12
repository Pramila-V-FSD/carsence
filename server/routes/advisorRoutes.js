import express from "express";
import Car from "../models/Car.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Initialize Gemini API client
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("🤖 Gemini AI Advisor initialized successfully!");
  } catch (err) {
    console.error("❌ Failed to initialize GoogleGenerativeAI client:", err);
  }
} else {
  console.log("ℹ️ No GEMINI_API_KEY found. Using rule-based advisor engine fallback.");
}

// Rule-based recommendation engine (for fallback)
function analyzeUserNeeds(message, history) {
  const userHistory = history.filter((h) => h.role === "user");
  const text = (message + " " + userHistory.map((h) => h.content).join(" ")).toLowerCase();

  const needs = {
    budget: null,
    bodyType: null,
    fuelType: null,
    priorities: [],
    useCase: null,
  };

  // Budget detection
  const budgetPatterns = [
    { pattern: /under\s*(\d+)\s*lakh/i, extract: (m) => parseFloat(m[1]) },
    { pattern: /below\s*(\d+)\s*lakh/i, extract: (m) => parseFloat(m[1]) },
    { pattern: /(\d+)\s*-\s*(\d+)\s*lakh/i, extract: (m) => ({ min: parseFloat(m[1]), max: parseFloat(m[2]) }) },
    { pattern: /(\d+)\s*to\s*(\d+)\s*lakh/i, extract: (m) => ({ min: parseFloat(m[1]), max: parseFloat(m[2]) }) },
    { pattern: /budget\s*(?:is|of)?\s*(\d+)/i, extract: (m) => parseFloat(m[1]) },
    { pattern: /around\s*(\d+)\s*lakh/i, extract: (m) => parseFloat(m[1]) },
    { pattern: /(\d+)\s*lakh/i, extract: (m) => parseFloat(m[1]) },
  ];

  for (const bp of budgetPatterns) {
    const match = text.match(bp.pattern);
    if (match) {
      needs.budget = bp.extract(match);
      break;
    }
  }

  // Body type detection
  if (/suv|sport utility/i.test(text)) needs.bodyType = "SUV";
  else if (/sedan/i.test(text)) needs.bodyType = "Sedan";
  else if (/hatchback|hatch/i.test(text)) needs.bodyType = "Hatchback";
  else if (/muv|mpv|people\s*mover/i.test(text)) needs.bodyType = "MUV";

  // Fuel type detection
  if (/electric|ev|battery/i.test(text)) needs.fuelType = "Electric";
  else if (/diesel/i.test(text)) needs.fuelType = "Diesel";
  else if (/petrol|gasoline/i.test(text)) needs.fuelType = "Petrol";
  else if (/hybrid/i.test(text)) needs.fuelType = "Hybrid";
  else if (/cng|gas/i.test(text)) needs.fuelType = "CNG";

  // Priority detection
  if (/safe|safety|ncap|airbag/i.test(text)) needs.priorities.push("safety");
  if (/mileage|fuel[\s-]*effic|economy|km\/l/i.test(text)) needs.priorities.push("mileage");
  if (/fast|speed|power|performance|bhp|torque|quick/i.test(text)) needs.priorities.push("performance");
  if (/family|spacious|space|room|7\s*seat|third\s*row/i.test(text)) needs.priorities.push("family");
  if (/cheap|affordable|budget|low\s*cost|value/i.test(text)) needs.priorities.push("value");
  if (/luxury|premium|comfort|brand/i.test(text)) needs.priorities.push("luxury");
  if (/off\s*road|4x4|4wd|awd|adventure/i.test(text)) needs.priorities.push("offroad");
  if (/city|commute|traffic|parking/i.test(text)) needs.priorities.push("city");
  if (/tech|feature|connected|screen|adas/i.test(text)) needs.priorities.push("tech");
  if (/first\s*car|beginner|new\s*driver|learner/i.test(text)) needs.priorities.push("beginner");
  if (/automatic|auto|no\s*clutch/i.test(text)) needs.priorities.push("automatic");

  // Use case detection
  if (/daily|commut|office|city|traffic/i.test(text)) needs.useCase = "city_commute";
  else if (/road\s*trip|highway|long\s*drive|travel/i.test(text)) needs.useCase = "highway";
  else if (/family|kids|parents|weekend/i.test(text)) needs.useCase = "family";
  else if (/off\s*road|adventure|camp/i.test(text)) needs.useCase = "offroad";

  return needs;
}

async function getRecommendations(needs) {
  const filter = {};

  if (needs.bodyType) filter.bodyType = needs.bodyType;
  if (needs.fuelType) filter.fuelType = needs.fuelType;
  if (needs.budget) {
    if (typeof needs.budget === "object") {
      filter.price = { $gte: needs.budget.min, $lte: needs.budget.max };
    } else {
      filter.price = { $lte: needs.budget };
    }
  }

  let sort = { price: 1 };

  if (needs.priorities.includes("safety")) sort = { safetyRating: -1, price: 1 };
  if (needs.priorities.includes("mileage")) sort = { mileage: -1, price: 1 };
  if (needs.priorities.includes("performance")) sort = { price: -1 };
  if (needs.priorities.includes("value")) sort = { price: 1 };
  if (needs.priorities.includes("luxury")) sort = { price: -1 };
  if (needs.priorities.includes("family")) {
    filter.seatingCapacity = { $gte: 7 };
    sort = { price: 1 };
  }

  if (needs.priorities.includes("automatic")) {
    filter.transmission = { $in: ["Automatic", "CVT", "DCT", "AMT"] };
  }

  const cars = await Car.find(filter).sort(sort).limit(5);
  return cars;
}

function generateResponse(message, needs, cars, history) {
  const isGreeting = /^(hi|hello|hey|good\s*(morning|evening|afternoon)|namaste)/i.test(message.trim());
  const isVague = /don'?t\s*know|confused|help|suggest|recommend|which\s*car|what\s*should|not\s*sure/i.test(message);
  const isCompare = /compare|vs|versus|between|difference|better/i.test(message);
  const isThanks = /thank|thanks|thx|great|awesome|perfect/i.test(message);

  if (isThanks) {
    return "You're welcome! 😊 Feel free to ask if you need more help. You can also use the **shortlist** feature to save cars you like and **compare** them side by side. Happy car hunting! 🚗";
  }

  if (isGreeting && history.length <= 1) {
    return `Hello! Welcome to **CarSense** 🚗✨

I'm your AI car advisor! I can help you find the perfect car based on your needs. 

To get started, tell me about:
- 💰 **Budget** — How much are you looking to spend?
- 🚙 **Type** — SUV, sedan, hatchback, or open to anything?
- ⛽ **Fuel** — Petrol, diesel, electric, hybrid, or CNG?
- 🎯 **Priority** — Safety, mileage, performance, space, or features?
- 🏙️ **Usage** — City commute, highway trips, family car, or adventure?

Or just tell me what's on your mind — like *"I need a safe family SUV under 20 lakhs"* — and I'll find the best options for you!`;
  }

  if (cars.length === 0 && (needs.budget || needs.bodyType || needs.fuelType)) {
    let suggestion = "I couldn't find exact matches for your criteria. ";
    if (needs.budget && typeof needs.budget === "number" && needs.budget < 6) {
      suggestion += "The minimum budget in our database starts around ₹5.5L. ";
    }
    suggestion += "Try adjusting your filters — maybe a wider budget range or different body type? Tell me more about what's important to you and I'll find alternatives! 🔍";
    return suggestion;
  }

  if (isVague && cars.length === 0) {
    return `No worries! Let's narrow it down together 🤝

Here are some questions to help me recommend the right car:

1. **Budget**: What's your comfortable range? (e.g., 8-12 lakhs)
2. **Primary use**: City driving, highway trips, or mixed?
3. **Must-haves**: Safety, mileage, automatic transmission, sunroof, connected tech?
4. **Family size**: Just you, couple, or family with kids?
5. **Fuel preference**: Petrol, diesel, electric, or no preference?

Share as much or as little as you want — I'll work with whatever you tell me!`;
  }

  if (cars.length > 0) {
    let response = "";

    if (isCompare && cars.length >= 2) {
      response = `Here's a quick comparison of the top picks:\n\n`;
    } else {
      response = `Based on your preferences, here are my top recommendations:\n\n`;
    }

    cars.forEach((car, i) => {
      const emoji = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i];
      response += `${emoji} **${car.make} ${car.model} ${car.variant}**\n`;
      response += `   💰 ₹${car.price}L | ⛽ ${car.fuelType} | ⚡ ${car.engine?.power || "N/A"}\n`;
      response += `   📊 ${car.mileage ? car.mileage + (car.fuelType === "Electric" ? " km range" : " km/l") : "N/A"} | ⭐ ${car.safetyRating || "N/A"}-star safety\n`;
      if (car.pros && car.pros.length > 0) {
        response += `   ✅ ${car.pros.slice(0, 2).join(" • ")}\n`;
      }
      response += `\n`;
    });

    // Add contextual advice
    if (needs.priorities.includes("safety")) {
      response += `\n🛡️ **Safety tip**: Look for cars with 5-star NCAP ratings and 6+ airbags. Tata and Hyundai lead in this space.\n`;
    }
    if (needs.priorities.includes("mileage")) {
      response += `\n⛽ **Mileage tip**: Hybrids and CNG cars offer the best running costs. Electric vehicles are cheapest per km!\n`;
    }
    if (needs.priorities.includes("beginner")) {
      response += `\n🎓 **First car tip**: Start with a hatchback or compact SUV. They're easier to park and maintain. AMT/CVT makes city driving stress-free!\n`;
    }

    response += `\n💡 Want me to dive deeper into any of these? Or you can **add them to your shortlist** and compare them side by side!`;
    return response;
  }

  // Generic fallback
  return `I'd love to help! Could you share more details about what you're looking for?

For example:
- *"Best SUV under 15 lakhs for a family"*
- *"Safest car with good mileage around 10 lakhs"*  
- *"Electric car for city commute"*
- *"Compare Creta vs Seltos"*

The more you tell me, the better I can match you with the perfect car! 🎯`;
}

// Gemini API Integration helper for Chat
async function getGeminiChatResponse(message, history, candidateCars) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format chat history for context
    const formattedHistory = history
      .slice(-6) // limit history payload to avoid token bloat
      .map((h) => `${h.role === "user" ? "User" : "CarSense Advisor"}: ${h.content}`)
      .join("\n");

    // Format candidate cars from MongoDB
    const carsContext = candidateCars
      .map(
        (c) =>
          `- **${c.make} ${c.model} ${c.variant}**: Price: ₹${c.price}L, Fuel: ${c.fuelType}, Transmission: ${c.transmission}, Mileage: ${c.mileage} km/l, Safety: ${c.safetyRating} Stars, Seating: ${c.seatingCapacity} seats. Pros: ${c.pros.join(", ")}, Cons: ${c.cons.join(", ")}, Key Features: ${c.features.slice(0, 4).join(", ")}`
      )
      .join("\n");

    const prompt = `You are "CarSense AI Advisor", a friendly and extremely knowledgeable automotive consultant helping a user select their ideal car.

Previous Chat Log:
${formattedHistory}

User's Latest Query: "${message}"

Here are matching cars from our database that fit their preferences. You MUST recommend ONLY cars from this list:
${carsContext || "No exact matching cars in our database."}

Write a helpful, customized recommendation response in Markdown:
1. Recommend 2-3 specific models from the list above that best match their query.
2. Explain *why* you recommend them using facts (price, fuel type, mileage, safety rating, pros/cons).
3. Be professional, objective, and empathetic to the car buyer's confusion.
4. Keep paragraphs short and use lists.
5. End with a suggestion for them to add their favorite choices to their Shortlist or Compare them.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error in chat recommendation:", err);
    return null;
  }
}

// POST /api/advisor/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. Analyze what the user needs using rule-based parsing (to query MongoDB)
    const needs = analyzeUserNeeds(message, history);

    // 2. Query matching cars from our database
    const cars = await getRecommendations(needs);

    // 3. Try to use Gemini LLM if available; otherwise use rule-based response generator
    let responseText = null;
    if (genAI) {
      responseText = await getGeminiChatResponse(message, history, cars);
    }

    if (!responseText) {
      // Fallback
      responseText = generateResponse(message, needs, cars, history);
    }

    res.json({
      response: responseText,
      recommendedCars: cars.map((c) => ({
        _id: c._id,
        make: c.make,
        model: c.model,
        price: c.price,
        imageUrl: c.imageUrl,
      })),
    });
  } catch (err) {
    console.error("Error in advisor chat:", err);
    res.status(500).json({ error: "Advisor failed to respond" });
  }
});

// Gemini comparison analysis generator
async function getGeminiCompareAnalysis(cars) {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const carsDetails = cars
      .map(
        (c) =>
          `🚗 **${c.make} ${c.model} ${c.variant}**
   - Price: ₹${c.price}L
   - Segment/Body Type: ${c.bodyType}
   - Fuel Type: ${c.fuelType} | Transmission: ${c.transmission}
   - Performance: ${c.engine.power} / ${c.engine.torque} torque (${c.engine.displacement}cc)
   - Mileage: ${c.mileage} km/l or km/kWh
   - Safety: ${c.safetyRating} NCAP Stars
   - Pros: ${c.pros.join(", ")}
   - Cons: ${c.cons.join(", ")}
   - Top Features: ${c.features.join(", ")}`
      )
      .join("\n\n");

    const prompt = `You are "CarSense AI Advisor", a premium automotive consultant.
Analyze the following cars that the user is comparing side-by-side:

${carsDetails}

Provide a comparative analysis in Markdown. Include:
1. **Overview**: A 2-sentence summary comparing their value propositions.
2. **Category Winners**: Briefly compare them across Price/Value, Performance, Running Costs/Mileage, and Safety. Declare a clear winner for each category.
3. **Verdict / Who Should Buy What**: Clear advice (e.g. "Buy Car X if you prioritize premium features and comfort... Buy Car Y if you want a reliable city commuter with high mileage").

Be unbiased, specific, and clear.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error in compare analysis:", err);
    return null;
  }
}

// Rule-based comparison fallback
function generateRuleBasedCompareAnalysis(cars) {
  if (cars.length === 0) return "No cars selected for comparison.";

  let cheapest = cars[0];
  let bestMileage = cars[0];
  let safest = cars[0];

  cars.forEach((car) => {
    if (car.price < cheapest.price) cheapest = car;
    if (car.mileage > bestMileage.mileage) bestMileage = car;
    if (car.safetyRating > safest.safetyRating) safest = car;
  });

  let result = `### 📊 AI Advisor Comparison Analysis\n\n`;
  result += `Here is a summary analysis of your compared models:\n\n`;

  result += `- 💰 **Best Value**: **${cheapest.make} ${cheapest.model}** starting at just ₹${cheapest.price}L.\n`;
  result += `- ⛽ **Most Fuel Efficient**: **${bestMileage.make} ${bestMileage.model}** offering **${bestMileage.mileage} km/l** (or equivalent range).\n`;
  if (safest.safetyRating > 0) {
    result += `- 🛡️ **Safest Choice**: **${safest.make} ${safest.model}** with a **${safest.safetyRating}-Star NCAP** safety rating.\n`;
  }
  result += `\n`;

  result += `### 💡 Verdict\n`;
  cars.forEach((car) => {
    result += `- **${car.make} ${car.model}**: Best suited for buyers looking for `;
    let reasons = [];
    if (car._id.toString() === cheapest._id.toString()) reasons.push("affordability and low entry cost");
    if (car._id.toString() === bestMileage._id.toString()) reasons.push("low running costs and excellent fuel efficiency");
    if (car._id.toString() === safest._id.toString() && car.safetyRating >= 4) reasons.push("top-tier occupant safety and crash test performance");

    // Add feature/performance-based reason if not covered
    if (reasons.length === 0) {
      if (car.bodyType === "SUV") reasons.push("high ground clearance and commanding road presence");
      else if (car.fuelType === "Electric") reasons.push("silent electric driving and low maintenance costs");
      else reasons.push("a well-rounded package with modern features");
    }
    result += reasons.join(" as well as ") + ".\n";
  });

  return result;
}

// POST /api/advisor/compare-analysis
router.post("/compare-analysis", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array is required for comparison" });
    }

    const cars = await Car.find({ _id: { $in: ids } });

    if (cars.length === 0) {
      return res.status(404).json({ error: "No cars found for the provided IDs" });
    }

    let analysisText = null;
    if (genAI) {
      analysisText = await getGeminiCompareAnalysis(cars);
    }

    if (!analysisText) {
      analysisText = generateRuleBasedCompareAnalysis(cars);
    }

    res.json({ analysis: analysisText });
  } catch (err) {
    console.error("Error in comparison advisor:", err);
    res.status(500).json({ error: "Compare analysis failed" });
  }
});

export default router;
