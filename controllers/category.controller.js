import categoryModel from "../models/category.model.js";
import blogModel from "../models/blog.model.js";
import ErrorHandler from "../utils/errorhandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import { deleteImage, uploadImage } from "../utils/uploadImage.js";
import getDataUri from "../utils/dataUri.js";

export const createCategory = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new ErrorHandler("Please enter the category name", 400));
  }

  // checking if category already available
  const existingCategory = await categoryModel.findOne({ name });
  if (existingCategory) {
    return next(
      new ErrorHandler("Category already exists with the same title", 400)
    );
  }

  const newCategory = new categoryModel({
    name,
  });

  await newCategory.save();

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    category: newCategory,
  });
});

export const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    if (!category) {
      return next(new ErrorHandler("Category not found", 404));
    }
    const category = await categoryModel.findByIdAndDelete(categoryId);
    
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error deleting category: ${error.message}`, 500)
    );
  }
};

export const deleteSubCategory = async (req, res, next) => {
  try {
    const { categoryId, subCategoryId } = req.params;

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return next(new ErrorHandler("Category not found", 404));
    }

    const associatedBlogs = await blogModel.find({
      category: categoryId,
      subCategory: subCategoryId,
    });
    if (associatedBlogs.length > 0) {
      return next(
        new ErrorHandler(
          "Cannot delete subcategory. There are blogs associated with this subcategory.",
          400
        )
      );
    }

    const subCategoryIndex = category.subCategory.findIndex(
      (sub) => sub._id.toString() === subCategoryId
    );
    if (subCategoryIndex === -1) {
      return next(new ErrorHandler("Subcategory not found", 404));
    }

    category.subCategory.splice(subCategoryIndex, 1);
    await category.save();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error deleting subcategory: ${error.message}`, 500)
    );
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.find();

    res.status(200).json(categories);
  } catch (error) {
    return next(
      new ErrorHandler(`Error fetching categories: ${error.message}`, 500)
    );
  }
};

//get single controller
export const getSingleCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const category = await categoryModel.findById(id);
    if (!category) return next(new ErrorHandler("category not found", 400));

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    return next(
      new ErrorHandler(`Error fetching categories: ${error.message}`, 500)
    );
  }
};

export const fetchBlogsBySubCategory = async (req, res, next) => {
  const { category, subCategory } = req.params;
  if (!category || !subCategory) {
    return res
      .status(400)
      .json({ error: "Category and subcategory names are required" });
  }

  // Find the category document by name
  const categoryData = await categoryModel.findOne({ name: category });
  if (!categoryData) {
    return res.status(404).json({ error: "Category not found" });
  }

  // Check if the subcategory exists in the category
  const subCategoryData = categoryData.subCategory.find(
    (sub) => sub.name.toLowerCase() === subCategory.toLowerCase()
  );
  if (!subCategoryData) {
    return res
      .status(404)
      .json({ error: "Subcategory not found in this category" });
  }

  // Fetch the blogs that match the category and subcategory
  const blogs = await blogModel
    .find({
      category: categoryData._id.toString(),
      subCategory: subCategoryData._id.toString(),
    })
    .populate("author", "full_name")
    .populate("category", "name subCategory");

  // If no blogs are found, return a 404 response
  if (blogs.length === 0) {
    return res
      .status(404)
      .json({ message: "No blogs found for this subcategory" });
  }
  const modifiedBlogs = processBlogsWithSubCategory(blogs);

  // Return the blogs in the response
  res.status(200).json({
    success: true,
    blogs: modifiedBlogs,
  });
};

// ! Some utility functions
export const processBlogsWithSubCategory = (blogs) => {
  const blogsArray = Array.isArray(blogs) ? blogs : [blogs];

  return blogsArray.map((blog) => {
    const subcategoryMatch = blog.category.subCategory.find(
      (sub) => sub._id.toString() === blog.subCategory.toString()
    );

    const processedBlog = {
      ...blog.toObject(),
      subCategory: subcategoryMatch ? subcategoryMatch.name : null,
    };

    delete processedBlog.category.subCategory;
    return processedBlog;
  });
};
