import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Ensure a car can only be shortlisted once per session
shortlistSchema.index({ sessionId: 1, carId: 1 }, { unique: true });

export default mongoose.model("Shortlist", shortlistSchema);
