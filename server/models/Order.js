import mongoose from "mongoose";

export const ORDER_STATUSES = ["new", "preparing", "ready", "completed", "cancelled"];

const orderItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    type: { type: String, enum: ["delivery", "pickup"], default: "delivery" },
    address: { type: String, trim: true, maxlength: 240, default: "" },
    note: { type: String, trim: true, maxlength: 300, default: "" },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
