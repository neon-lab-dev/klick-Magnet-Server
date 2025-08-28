import express from "express";
import { createBlog, deleteBlog, getAllBlogs, singleBlog, updateBlog } from "../controllers/blogController.js";
import { isAuthenticatedAdmin } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
import {  deleteCategory, deleteSubCategory, fetchBlogsBySubCategory, getAllCategories, createCategory, getSingleCategoryById } from "../controllers/category.controller.js";


const router = express.Router();

// Blog routes
router.route("/blog/create").post(isAuthenticatedAdmin, singleUpload, createBlog);
router.route("/blog/:id").put(isAuthenticatedAdmin, singleUpload, updateBlog);
router.route("/blog/:id").delete(isAuthenticatedAdmin, deleteBlog);
router.route("/blog").get(getAllBlogs);
router.route("/blog/:id").get(singleBlog);

// Category routes
router.route("/category/add").post(isAuthenticatedAdmin, singleUpload, createCategory);
router.route("/category").get(getAllCategories);
router.route("/category/:categoryId/subcategory/:subCategoryId").delete(isAuthenticatedAdmin, deleteSubCategory);
router.get("/blogs/:category/:subCategory", fetchBlogsBySubCategory);

router.route("/category/:id").get(getSingleCategoryById);

export default router; 