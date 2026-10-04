import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 240, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: "" },
    available: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);
