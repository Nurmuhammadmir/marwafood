import { Router } from "express";
import mongoose from "mongoose";
import Food from "../models/Food.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
const maxFoods = () => Number(process.env.MAX_FOODS) || 10;
const pick = ({ name, description, price, image, available, position }) =>
  Object.fromEntries(
    Object.entries({ name, description, price, image, available, position }).filter(
      ([, v]) => v !== undefined
    )
  );

// Public: dishes shown on the menu
router.get("/", async (_req, res) => {
  const foods = await Food.find({ available: true }).sort({ position: 1, createdAt: 1 });
  res.json(foods);
});

// Admin: every dish, including hidden ones
router.get("/all", requireAdmin, async (_req, res) => {
  const foods = await Food.find().sort({ position: 1, createdAt: 1 });
  res.json({ foods, max: maxFoods() });
});

router.post("/", requireAdmin, async (req, res) => {
  const count = await Food.countDocuments();
  if (count >= maxFoods()) {
    return res.status(400).json({ message: `The menu is full (${maxFoods()} dishes). Delete one first.` });
  }
  try {
    const food = await Food.create(pick(req.body));
    res.status(201).json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Dish not found" });
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!food) return res.status(404).json({ message: "Dish not found" });
    res.json(food);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Dish not found" });
  const food = await Food.findByIdAndDelete(req.params.id);
  if (!food) return res.status(404).json({ message: "Dish not found" });
  res.json({ ok: true });
});

export default router;
