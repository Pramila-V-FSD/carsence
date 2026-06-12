import express from "express";
import Shortlist from "../models/Shortlist.js";
import Car from "../models/Car.js";

const router = express.Router();

// GET /api/shortlist/:sessionId — get user's shortlisted cars
router.get("/:sessionId", async (req, res) => {
  try {
    const shortlist = await Shortlist.find({
      sessionId: req.params.sessionId,
    }).populate("carId");
    
    // Filter out entries where car was deleted
    const validEntries = shortlist.filter((s) => s.carId != null);
    res.json(validEntries);
  } catch (err) {
    console.error("Error fetching shortlist:", err);
    res.status(500).json({ error: "Failed to fetch shortlist" });
  }
});

// POST /api/shortlist — add a car to shortlist
router.post("/", async (req, res) => {
  try {
    const { sessionId, carId, notes } = req.body;
    if (!sessionId || !carId) {
      return res.status(400).json({ error: "sessionId and carId are required" });
    }

    // Check if already shortlisted
    const existing = await Shortlist.findOne({ sessionId, carId });
    if (existing) {
      return res.status(409).json({ error: "Car already in shortlist" });
    }

    const entry = new Shortlist({ sessionId, carId, notes });
    await entry.save();

    // Populate the car data before returning
    await entry.populate("carId");
    res.status(201).json(entry);
  } catch (err) {
    console.error("Error adding to shortlist:", err);
    res.status(500).json({ error: "Failed to add to shortlist" });
  }
});

// DELETE /api/shortlist/:sessionId/:carId — remove from shortlist
router.delete("/:sessionId/:carId", async (req, res) => {
  try {
    const { sessionId, carId } = req.params;
    const result = await Shortlist.findOneAndDelete({ sessionId, carId });
    if (!result) {
      return res.status(404).json({ error: "Entry not found in shortlist" });
    }
    res.json({ message: "Removed from shortlist" });
  } catch (err) {
    console.error("Error removing from shortlist:", err);
    res.status(500).json({ error: "Failed to remove from shortlist" });
  }
});

// DELETE /api/shortlist/:sessionId — clear entire shortlist
router.delete("/:sessionId", async (req, res) => {
  try {
    await Shortlist.deleteMany({ sessionId: req.params.sessionId });
    res.json({ message: "Shortlist cleared" });
  } catch (err) {
    console.error("Error clearing shortlist:", err);
    res.status(500).json({ error: "Failed to clear shortlist" });
  }
});

export default router;
