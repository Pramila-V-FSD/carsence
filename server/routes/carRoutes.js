import express from "express";
import Car from "../models/Car.js";

const router = express.Router();

// GET /api/cars — list all cars with filtering, sorting, and search
router.get("/", async (req, res) => {
  try {
    const {
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      make,
      search,
      sortBy,
      sortOrder,
      limit,
      page,
    } = req.query;

    const filter = {};

    if (bodyType) {
      filter.bodyType = { $in: bodyType.split(",") };
    }
    if (fuelType) {
      filter.fuelType = { $in: fuelType.split(",") };
    }
    if (transmission) {
      filter.transmission = { $in: transmission.split(",") };
    }
    if (make) {
      filter.make = { $in: make.split(",") };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { variant: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      sort.price = 1; // default sort by price ascending
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [cars, total] = await Promise.all([
      Car.find(filter).sort(sort).skip(skip).limit(limitNum),
      Car.countDocuments(filter),
    ]);

    res.json({
      cars,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("Error fetching cars:", err);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

// GET /api/cars/segments — aggregation for filter options
router.get("/segments", async (req, res) => {
  try {
    const [bodyTypes, fuelTypes, transmissions, makes, priceRange] =
      await Promise.all([
        Car.distinct("bodyType"),
        Car.distinct("fuelType"),
        Car.distinct("transmission"),
        Car.distinct("make"),
        Car.aggregate([
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ]),
      ]);

    res.json({
      bodyTypes: bodyTypes.sort(),
      fuelTypes: fuelTypes.sort(),
      transmissions: transmissions.sort(),
      makes: makes.sort(),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 100 },
    });
  } catch (err) {
    console.error("Error fetching segments:", err);
    res.status(500).json({ error: "Failed to fetch segments" });
  }
});

// GET /api/cars/compare?ids=id1,id2,id3
router.get("/compare", async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: "Provide car IDs to compare" });
    }
    const idList = ids.split(",").slice(0, 5); // max 5 cars
    const cars = await Car.find({ _id: { $in: idList } });
    res.json(cars);
  } catch (err) {
    console.error("Error comparing cars:", err);
    res.status(500).json({ error: "Failed to compare cars" });
  }
});

// GET /api/cars/:id — single car detail
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(car);
  } catch (err) {
    console.error("Error fetching car:", err);
    res.status(500).json({ error: "Failed to fetch car" });
  }
});

// POST /api/cars/:id/reviews — add a review
router.post("/:id/reviews", async (req, res) => {
  try {
    const { author, rating, comment } = req.body;
    if (!author || !rating || !comment) {
      return res.status(400).json({ error: "Author, rating, and comment are required" });
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    car.reviews.push({
      author,
      rating: parsedRating,
      comment,
      date: new Date(),
    });

    await car.save();
    res.status(201).json(car);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ error: "Failed to add review" });
  }
});

export default router;
