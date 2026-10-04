import { Router } from "express";
import mongoose from "mongoose";
import Food from "../models/Food.js";
import Order, { ORDER_STATUSES } from "../models/Order.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public: place an order. Prices always come from the database, never from the client.
router.post("/", async (req, res) => {
  const { customerName, phone, type = "delivery", address = "", note = "", items } = req.body || {};

  if (!customerName?.trim() || !phone?.trim()) {
    return res.status(400).json({ message: "Name and phone are required" });
  }
  if (type === "delivery" && !String(address).trim()) {
    return res.status(400).json({ message: "Address is required for delivery" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "The cart is empty" });
  }

  const ids = items.map((i) => i.food).filter((id) => mongoose.isValidObjectId(id));
  const foods = await Food.find({ _id: { $in: ids }, available: true });
  const byId = new Map(foods.map((f) => [String(f._id), f]));

  const orderItems = [];
  for (const item of items) {
    const food = byId.get(String(item.food));
    const qty = Math.floor(Number(item.qty));
    if (!food) return res.status(400).json({ message: "A dish in your cart is no longer available" });
    if (!qty || qty < 1 || qty > 50) return res.status(400).json({ message: "Invalid quantity" });
    orderItems.push({ food: food._id, name: food.name, price: food.price, qty });
  }

  const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  try {
    const order = await Order.create({
      customerName,
      phone,
      type: type === "pickup" ? "pickup" : "delivery",
      address: type === "pickup" ? "" : address,
      note,
      items: orderItems,
      total,
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: list orders, newest first
router.get("/", requireAdmin, async (req, res) => {
  const filter = ORDER_STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(orders);
});

// Public: check one order's status (used on the confirmation page)
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Order not found" });
  const order = await Order.findById(req.params.id).select("items total status type createdAt");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Order not found" });
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

export default router;
