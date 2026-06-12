import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Car from "./models/Car.js";

const cars = [
    
  {
    make: "Maruti Suzuki",
    model: "Swift",
    variant: "ZXi+ AMT",
    year: 2024,
    price: 8.65,
    bodyType: "Hatchback",
    fuelType: "Petrol",
    transmission: "AMT",
    engine: {
      displacement: 1197,
      power: "80 bhp",
      torque: "112 Nm"
    },
    mileage: 25.75,
    safetyRating: 3,
    seatingCapacity: 5,
    features: [
      "9-inch Touchscreen",
      "Wireless Android Auto",
      "Wireless Apple CarPlay",
      "Cruise Control",
      "360 Degree Camera"
    ],
    pros: [
      "Excellent fuel efficiency",
      "Easy city driving",
      "Low maintenance costs"
    ],
    cons: [
      "Average rear seat space",
      "Interior plastics feel basic",
      "Safety rating could be better"
    ],
    colors: [
      "Pearl Arctic White",
      "Sizzling Red",
      "Luster Blue",
      "Magma Grey"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The new-generation Swift remains India's most popular premium hatchback. It combines excellent mileage, modern features, and hassle-free ownership.",
    reviews: [
      {
        author: "Rahul Sharma",
        rating: 4.5,
        comment: "Mileage is outstanding and the AMT is perfect for city traffic."
      },
      {
        author: "Priya Nair",
        rating: 4,
        comment: "Feature-rich hatchback with good reliability and service support."
      },
      {
        author: "Amit Verma",
        rating: 4.2,
        comment: "Fun to drive and economical, but safety could be improved."
      }
    ]
  },
  {
    make: "Tata",
    model: "Tiago",
    variant: "XZ+ AMT",
    year: 2024,
    price: 7.30,
    bodyType: "Hatchback",
    fuelType: "Petrol",
    transmission: "AMT",
    engine: {
      displacement: 1199,
      power: "86 bhp",
      torque: "113 Nm"
    },
    mileage: 19.0,
    safetyRating: 4,
    seatingCapacity: 5,
    features: [
      "7-inch Touchscreen",
      "Android Auto",
      "Apple CarPlay",
      "Automatic Climate Control",
      "Rear Camera"
    ],
    pros: [
      "Strong build quality",
      "Good safety credentials",
      "Comfortable ride"
    ],
    cons: [
      "AMT shifts can feel slow",
      "Engine refinement average",
      "Boot space limited"
    ],
    colors: [
      "Daytona Grey",
      "Arizona Blue",
      "Opal White",
      "Supernova Copper"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The Tiago offers one of the best safety packages in the hatchback segment. It balances affordability with practicality and comfort.",
    reviews: [
      {
        author: "Karthik R",
        rating: 4.3,
        comment: "Feels solid and safe compared to rivals."
      },
      {
        author: "Nidhi Gupta",
        rating: 4,
        comment: "Good value for money and comfortable for family use."
      },
      {
        author: "Rohit Mehta",
        rating: 4.1,
        comment: "Excellent city car with impressive safety."
      }
    ]
  },
  {
    make: "Honda",
    model: "City",
    variant: "ZX CVT",
    year: 2024,
    price: 15.97,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "CVT",
    engine: {
      displacement: 1498,
      power: "121 bhp",
      torque: "145 Nm"
    },
    mileage: 18.4,
    safetyRating: 5,
    seatingCapacity: 5,
    features: [
      "ADAS",
      "Electric Sunroof",
      "Lane Keep Assist",
      "Wireless Charger",
      "Connected Car Tech"
    ],
    pros: [
      "Spacious rear seat",
      "Refined engine",
      "Excellent ride comfort"
    ],
    cons: [
      "Ground clearance is low",
      "CVT lacks sporty feel",
      "Premium pricing"
    ],
    colors: [
      "Platinum White Pearl",
      "Golden Brown Metallic",
      "Meteoroid Grey",
      "Radiant Red"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "Honda City remains the benchmark midsize sedan in India. It offers class-leading comfort, refinement, and advanced safety technology.",
    reviews: [
      {
        author: "Vikram S",
        rating: 4.8,
        comment: "Best sedan for family comfort and highway drives."
      },
      {
        author: "Anjali Rao",
        rating: 4.6,
        comment: "ADAS works brilliantly and cabin quality is excellent."
      },
      {
        author: "Suresh Kumar",
        rating: 4.7,
        comment: "Reliable, refined and comfortable for long trips."
      }
    ]
  },
  {
    make: "Hyundai",
    model: "Verna",
    variant: "SX(O) Turbo DCT",
    year: 2024,
    price: 17.48,
    bodyType: "Sedan",
    fuelType: "Petrol",
    transmission: "DCT",
    engine: {
      displacement: 1482,
      power: "160 bhp",
      torque: "253 Nm"
    },
    mileage: 20.6,
    safetyRating: 5,
    seatingCapacity: 5,
    features: [
      "ADAS",
      "Ventilated Seats",
      "Bose Audio",
      "Dual Screens",
      "Sunroof"
    ],
    pros: [
      "Powerful turbo engine",
      "Loaded with features",
      "5-star safety rating"
    ],
    cons: [
      "Rear headroom slightly limited",
      "Low ground clearance",
      "Polarizing design"
    ],
    colors: [
      "Atlas White",
      "Titan Grey",
      "Fiery Red",
      "Starry Night"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The Verna combines sporty performance with premium features. It is one of the most technologically advanced sedans in its segment.",
    reviews: [
      {
        author: "Arjun Patel",
        rating: 4.8,
        comment: "Turbo engine is incredibly fun and smooth."
      },
      {
        author: "Sneha Kapoor",
        rating: 4.7,
        comment: "Packed with features and safety technology."
      },
      {
        author: "Deepak Jain",
        rating: 4.5,
        comment: "Excellent highway car with premium feel."
      }
    ]
  },
  {
    make: "Tata",
    model: "Nexon",
    variant: "Fearless+ DCA",
    year: 2024,
    price: 13.45,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "DCT",
    engine: {
      displacement: 1199,
      power: "120 bhp",
      torque: "170 Nm"
    },
    mileage: 17.01,
    safetyRating: 5,
    seatingCapacity: 5,
    features: [
      "10.25-inch Touchscreen",
      "360 Camera",
      "Sunroof",
      "Digital Cluster",
      "Connected Car Tech"
    ],
    pros: [
      "Outstanding safety",
      "Feature-rich cabin",
      "Comfortable ride quality"
    ],
    cons: [
      "Engine refinement could improve",
      "Rear visibility limited",
      "Some software glitches reported"
    ],
    colors: [
      "Fearless Purple",
      "Daytona Grey",
      "Pristine White",
      "Flame Red"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The Nexon continues to dominate the compact SUV segment with class-leading safety. It offers a strong mix of technology, comfort, and road presence.",
    reviews: [
      {
        author: "Manoj Singh",
        rating: 4.6,
        comment: "Feels extremely safe and premium."
      },
      {
        author: "Keerthi Raj",
        rating: 4.5,
        comment: "Loaded with features and comfortable on bad roads."
      },
      {
        author: "Harish N",
        rating: 4.4,
        comment: "Excellent SUV for Indian conditions."
      }
    ]
  },
  {
    make: "Hyundai",
    model: "Creta",
    variant: "SX(O) IVT",
    year: 2024,
    price: 18.34,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "CVT",
    engine: {
      displacement: 1497,
      power: "115 bhp",
      torque: "144 Nm"
    },
    mileage: 17.7,
    safetyRating: 3,
    seatingCapacity: 5,
    features: [
      "ADAS",
      "Panoramic Sunroof",
      "Ventilated Seats",
      "360 Camera",
      "Dual 10.25-inch Displays"
    ],
    pros: [
      "Premium interior",
      "Excellent feature list",
      "Comfortable cabin"
    ],
    cons: [
      "Pricing on higher variants",
      "Average safety rating",
      "Petrol engine lacks excitement"
    ],
    colors: [
      "Abyss Black",
      "Atlas White",
      "Titan Grey",
      "Fiery Red"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The Creta remains India's best-selling midsize SUV. It offers a premium ownership experience with segment-leading features.",
    reviews: [
      {
        author: "Rakesh Menon",
        rating: 4.7,
        comment: "Very comfortable and feature-rich SUV."
      },
      {
        author: "Shweta Iyer",
        rating: 4.5,
        comment: "Excellent daily driver with premium interiors."
      },
      {
        author: "Pranav Joshi",
        rating: 4.6,
        comment: "Great family SUV with modern technology."
      }
    ]
  },
  {
    make: "Mahindra",
    model: "XUV700",
    variant: "AX7 AT",
    year: 2024,
    price: 22.24,
    bodyType: "SUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: {
      displacement: 1997,
      power: "200 bhp",
      torque: "380 Nm"
    },
    mileage: 13.0,
    safetyRating: 5,
    seatingCapacity: 7,
    features: [
      "ADAS",
      "Panoramic Sunroof",
      "Sony Audio",
      "360 Camera",
      "Dual Displays"
    ],
    pros: [
      "Powerful performance",
      "Excellent safety",
      "Premium cabin"
    ],
    cons: [
      "Fuel efficiency is low",
      "Large size in city traffic",
      "Long waiting periods"
    ],
    colors: [
      "Midnight Black",
      "Electric Blue",
      "Dazzling Silver",
      "Everest White"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The XUV700 delivers luxury-SUV features at a competitive price. It is among the safest and most powerful SUVs in India.",
    reviews: [
      {
        author: "Abhishek Roy",
        rating: 4.8,
        comment: "Feels like a premium international SUV."
      },
      {
        author: "Neha Arora",
        rating: 4.7,
        comment: "ADAS and safety features are excellent."
      },
      {
        author: "Vijay Krishnan",
        rating: 4.9,
        comment: "Outstanding performance and highway comfort."
      }
    ]
  },
  {
    make: "Maruti Suzuki",
    model: "Ertiga",
    variant: "ZXi AT",
    year: 2024,
    price: 13.26,
    bodyType: "MUV",
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: {
      displacement: 1462,
      power: "103 bhp",
      torque: "137 Nm"
    },
    mileage: 20.3,
    safetyRating: 3,
    seatingCapacity: 7,
    features: [
      "7-inch Touchscreen",
      "Cruise Control",
      "Automatic Climate Control",
      "Rear AC Vents",
      "Connected Car Features"
    ],
    pros: [
      "Excellent space",
      "Good fuel efficiency",
      "Affordable maintenance"
    ],
    cons: [
      "Average safety score",
      "Basic interior quality",
      "Third row best for children"
    ],
    colors: [
      "Pearl Arctic White",
      "Splendid Silver",
      "Magma Grey",
      "Auburn Red"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The Ertiga is India's most popular family MPV. It offers unmatched practicality, comfort, and ownership costs.",
    reviews: [
      {
        author: "Balaji S",
        rating: 4.4,
        comment: "Perfect family car with good mileage."
      },
      {
        author: "Gopal Rao",
        rating: 4.3,
        comment: "Spacious and easy to maintain."
      },
      {
        author: "Lakshmi Devi",
        rating: 4.2,
        comment: "Comfortable for long family trips."
      }
    ]
  },
  {
    make: "Toyota",
    model: "Innova Hycross",
    variant: "ZX Hybrid",
    year: 2024,
    price: 30.98,
    bodyType: "MUV",
    fuelType: "Hybrid",
    transmission: "CVT",
    engine: {
      displacement: 1987,
      power: "184 bhp",
      torque: "206 Nm"
    },
    mileage: 23.24,
    safetyRating: 5,
    seatingCapacity: 7,
    features: [
      "ADAS",
      "Panoramic Sunroof",
      "Powered Ottoman Seats",
      "360 Camera",
      "Connected Car Tech"
    ],
    pros: [
      "Outstanding fuel efficiency",
      "Premium comfort",
      "Toyota reliability"
    ],
    cons: [
      "Expensive top variants",
      "Long waiting periods",
      "Third-row space average"
    ],
    colors: [
      "Platinum White Pearl",
      "Silver Metallic",
      "Attitude Black",
      "Avant Garde Bronze"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The Innova Hycross redefines the premium MPV segment with hybrid efficiency. It combines luxury, practicality, and long-distance comfort.",
    reviews: [
      {
        author: "Sanjay Nair",
        rating: 4.9,
        comment: "Best family car available in India today."
      },
      {
        author: "Ramesh Iyer",
        rating: 4.8,
        comment: "Hybrid system saves a lot of fuel."
      },
      {
        author: "Ashwin Kumar",
        rating: 4.7,
        comment: "Extremely comfortable and refined."
      }
    ]
  },
  {
    make: "Kia",
    model: "Carens",
    variant: "Luxury Plus DCT",
    year: 2024,
    price: 18.50,
    bodyType: "MUV",
    fuelType: "Petrol",
    transmission: "DCT",
    engine: {
      displacement: 1482,
      power: "160 bhp",
      torque: "253 Nm"
    },
    mileage: 17.9,
    safetyRating: 3,
    seatingCapacity: 7,
    features: [
      "Ventilated Seats",
      "Sunroof",
      "Bose Audio",
      "Air Purifier",
      "10.25-inch Touchscreen"
    ],
    pros: [
      "Feature-packed cabin",
      "Strong turbo performance",
      "Excellent passenger comfort"
    ],
    cons: [
      "Safety rating could be better",
      "Third-row space average for adults",
      "DCT maintenance costs higher"
    ],
    colors: [
      "Imperial Blue",
      "Sparkling Silver",
      "Glacier White Pearl",
      "Aurora Black Pearl"
    ],
    imageUrl: "https://placehold.co/600x400",
    description: "The Carens combines SUV styling with MPV practicality. It is a highly feature-loaded family vehicle with premium comfort.",
    reviews: [
      {
        author: "Naveen Raj",
        rating: 4.5,
        comment: "Very practical and comfortable for large families."
      },
      {
        author: "Megha Singh",
        rating: 4.4,
        comment: "Love the feature list and cabin quality."
      },
      {
        author: "Akash Patel",
        rating: 4.3,
        comment: "Smooth turbo engine and spacious interior."
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Car.deleteMany({});
    console.log("🗑️  Cleared existing cars");

    const inserted = await Car.insertMany(cars);
    console.log(`🚗 Seeded ${inserted.length} cars successfully!`);

    // Print summary
    const bodyTypes = [...new Set(cars.map(c => c.bodyType))];
    const fuelTypes = [...new Set(cars.map(c => c.fuelType))];
    const makes = [...new Set(cars.map(c => c.make))];
    console.log(`\n📊 Summary:`);
    console.log(`   Body Types: ${bodyTypes.join(", ")}`);
    console.log(`   Fuel Types: ${fuelTypes.join(", ")}`);
    console.log(`   Makes: ${makes.join(", ")}`);
    console.log(`   Price Range: ₹${Math.min(...cars.map(c => c.price))}L - ₹${Math.max(...cars.map(c => c.price))}L`);

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed. Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
