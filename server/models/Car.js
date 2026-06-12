import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, index: true },
    model: { type: String, required: true },
    variant: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true, index: true }, // in lakhs
    bodyType: {
      type: String,
      required: true,
      enum: ["Hatchback", "Sedan", "SUV", "MUV", "Coupe", "Convertible", "Pickup"],
      index: true,
    },
    fuelType: {
      type: String,
      required: true,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
      index: true,
    },
    transmission: {
      type: String,
      required: true,
      enum: ["Manual", "Automatic", "AMT", "CVT", "DCT", "iMT"],
      index: true,
    },
    engine: {
      displacement: Number, // in cc
      power: String, // e.g. "118 bhp"
      torque: String, // e.g. "250 Nm"
    },
    mileage: { type: Number }, // km/l or km/kWh
    safetyRating: { type: Number, min: 0, max: 5 }, // NCAP stars
    seatingCapacity: { type: Number, default: 5 },
    features: [String],
    pros: [String],
    cons: [String],
    colors: [String],
    imageUrl: { type: String },
    reviews: [reviewSchema],
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
carSchema.index({ make: "text", model: "text", variant: "text", description: "text" });

// Virtual: average review rating
carSchema.virtual("avgRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual: review count
carSchema.virtual("reviewCount").get(function () {
  return this.reviews ? this.reviews.length : 0;
});

// Virtual: value score (mileage * safetyRating / price) — normalized
carSchema.virtual("valueScore").get(function () {
  if (!this.mileage || !this.safetyRating || !this.price) return 0;
  return Math.round(((this.mileage * this.safetyRating) / this.price) * 10) / 10;
});

export default mongoose.model("Car", carSchema);
