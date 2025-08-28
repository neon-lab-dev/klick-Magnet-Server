import { Schema, model } from "mongoose";
import { FileSchema } from "./file.model.js";

const BlogSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Please enter the blog title"],
            maxLength: [101, "Title cannot exceed 100 characters"],
        },
        metaDescription: {
            type: String,
            maxLength: [151, "Meta description cannot exceed 150 characters"],
            required: [true, "Please enter the meta description"],
        },
        content: {
            type: String,
            required: [true, "Please enter the blog content"],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please select a blog category"],
        },
        subCategory: {
            type: Schema.Types.ObjectId,
            ref: "Category.subCategory",
            required: [true, "Please select a blog subcategory"],
        },
        tags: {
            type: [String],
            required: [true, "Please provide tags for the blog"],
        },
        thumbnail: {
            type: FileSchema,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default model("Blog", BlogSchema);
