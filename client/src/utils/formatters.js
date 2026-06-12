// Format price in lakhs with ₹ symbol
export function formatPrice(priceLakhs) {
  if (priceLakhs >= 100) {
    return `₹ ${(priceLakhs / 100).toFixed(2)} Crore`;
  }
  return `₹ ${priceLakhs.toFixed(2)} Lakh`;
}

// Format price as compact (e.g., ₹ 8.97 Lakh)
export function formatPriceCompact(priceLakhs) {
  if (priceLakhs >= 100) {
    return `₹ ${(priceLakhs / 100).toFixed(1)} Cr`;
  }
  return `₹ ${priceLakhs.toFixed(2)} Lakh`;
}

// Format mileage based on fuel type
export function formatMileage(mileage, fuelType) {
  if (!mileage) return "N/A";
  if (fuelType === "Electric") {
    return `${mileage} km range`;
  }
  if (fuelType === "CNG") {
    return `${mileage} km/kg`;
  }
  return `${mileage} km/l`;
}

// Generate session ID
export function getSessionId() {
  let sessionId = localStorage.getItem("carSenseSessionId");
  if (!sessionId) {
    sessionId = "cs_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("carSenseSessionId", sessionId);
  }
  return sessionId;
}

// Truncate text
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Get fuel type icon/color
export function getFuelColor(fuelType) {
  const colors = {
    Petrol: "#f59e0b",
    Diesel: "#6b7280",
    Electric: "#10b981",
    Hybrid: "#3b82f6",
    CNG: "#8b5cf6",
  };
  return colors[fuelType] || "#6b7280";
}

// Get safety rating label
export function getSafetyLabel(rating) {
  if (rating >= 5) return "Excellent";
  if (rating >= 4) return "Good";
  if (rating >= 3) return "Average";
  if (rating >= 2) return "Below Average";
  return "Poor";
}

// Generate a local, network-independent SVG placeholder as a data URL (works offline)
export function getLocalSVGPlaceholder(text, width = 664, height = 374) {
  const cleanText = text || "Car Image";
  const fontSize = Math.max(12, Math.round(width / 16));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e1b4b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}px" font-weight="800" fill="#3b82f6">${cleanText.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Get car image URL with fallback to local SVG placeholder
export function getCarImageUrl(car, width = 664, height = 374, customText = null) {
  if (!car) return "";
  const isGenericPlaceholder = !car.imageUrl || 
    car.imageUrl === "https://placehold.co/600x400" || 
    car.imageUrl.includes("placehold.co/600x400") || 
    car.imageUrl.includes("via.placeholder.com");
    
  if (isGenericPlaceholder) {
    const text = customText || `${car.make} ${car.model}`;
    return getLocalSVGPlaceholder(text, width, height);
  }
  return car.imageUrl;
}


