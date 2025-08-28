import mongoose from "mongoose";

const categoryModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the category name"],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categoryModel);
