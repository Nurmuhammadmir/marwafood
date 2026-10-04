import "dotenv/config";
import mongoose from "mongoose";
import Food from "./models/Food.js";

const foods = [
  { name: "Lamb plov", description: "Rice slow-cooked with lamb, yellow carrots, chickpeas and garlic.", price: 45000, position: 1 },
  { name: "Chicken shawarma", description: "Grilled chicken, garlic sauce, pickles and fries in thin lavash.", price: 32000, position: 2 },
  { name: "Beef kebab plate", description: "Two skewers with flatbread, onion salad and tomato sauce.", price: 55000, position: 3 },
  { name: "Lentil soup", description: "Red lentils, cumin and lemon. Served with bread.", price: 18000, position: 4 },
  { name: "Fresh lemonade", description: "Lemon, mint and a little honey. 0.5 L.", price: 15000, position: 5 },
];

await mongoose.connect(process.env.MONGO_URI);
await Food.deleteMany({});
await Food.insertMany(foods);
console.log(`Seeded ${foods.length} dishes`);
await mongoose.disconnect();
