import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import blogModel from "../models/blog.model.js";
import ApiFeatures from "../utils/apiFeatures.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorhandler.js";
import { processTags } from "../utils/tags.js";
import { deleteImage, uploadImage } from "../utils/uploadImage.js";

export const createBlog = catchAsyncErrors(async (req, res, next) => {
  const { title, metaDescription, content, tags } = req.body;

  if (!title || !content || !tags) {
    return next(new ErrorHandler("All required fields must be filled", 400));
  }
  if (!req.file) {
    return next(new ErrorHandler("Please upload a thumbnail", 400));
  }
  const thumbnail = await uploadImage(
    getDataUri(req.file).content,
    getDataUri(req.file).fileName,
    "blog-thumbnails"
  );
  const blog = new blogModel({
    title,
    metaDescription,
    content,
    tags,
    thumbnail,
    author: res.locals.admin.id,
  });

  await blog.save();
  res.status(201).json({
    success: true,
    message: "Blog created successfully",
    blog,
  });
});

export const getAllBlogs = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 15;
  const currentPage = Number(req.query.page) || 1;

  // Base query without populate
  const baseQuery = blogModel.find();

  const apiFeature = new ApiFeatures(baseQuery, req.query).search().filter();

  // Count for pagination
  const filteredBlogsCount = await blogModel.countDocuments(apiFeature.query);
  apiFeature.pagination(resultPerPage);

  // Fetch blogs
  const blogs = await apiFeature.query;
  const totalBlogsCount = await blogModel.estimatedDocumentCount();

  res.status(200).json({
    success: true,
    totalBlogsCount,
    filteredBlogsCount,
    resultPerPage,
    currentPage,
    totalPages: Math.ceil(filteredBlogsCount / resultPerPage),
    data: blogs,
  });
});


export const singleBlog = catchAsyncErrors(async (req, res, next) => {
  const blog = await blogModel
    .findById(req.params.id)
    .populate("author", "full_name");

  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404));
  }

  res.status(200).json({
    success: true,
    data: blog,
  });
});


export const deleteBlog = catchAsyncErrors(async (req, res, next) => {
  const blog = await blogModel.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404));
  }
  if (!blog.thumbnail) {
    return next(new ErrorHandler("Blog thumbnail not found", 404));
  }
  const authorId = res.locals.admin.id;

  if (authorId !== blog.author.toString()) {
    return res.status(401).json({
      status: 401,
      message: "You are not authorized to delete this blog",
    });
  }
  blog.thumbnail && (await deleteImage(blog.thumbnail.fileId));
  await blog.deleteOne();
  res.status(200).json({
    success: true,
    message: `Blog deleted successfully`,
  });
});


export const updateBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { title, metaDescription, content } = req.body;
  let { tags } = req.body; // tags may come as JSON string from FormData
  const authorId = res.locals.admin.id;
  console.log(tags);

  const blog = await blogModel.findById(id);
  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404));
  }

  // Ensure only author can update
  if (blog.author.toString() !== authorId) {
    return next(
      new ErrorHandler("You are not authorized to update this blog", 403)
    );
  }

  // Parse tags if it's a string (from FormData)
  if (tags) {
    try {
      tags = typeof tags === "string" ? JSON.parse(tags) : tags;
      if (!Array.isArray(tags)) throw new Error();
    } catch (error) {
      return next(new ErrorHandler("Invalid tags format", 400));
    }
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (metaDescription) updateFields.metaDescription = metaDescription;
  if (content) updateFields.content = content;
  if (tags) updateFields.tags = tags;

  // Handle thumbnail upload
  if (req.file) {
    if (blog.thumbnail) {
      await deleteImage(blog.thumbnail.fileId);
    }
    const thumbnail = await uploadImage(
      getDataUri(req.file).content,
      getDataUri(req.file).fileName,
      "blog-thumbnails"
    );
    updateFields.thumbnail = thumbnail;
  }

  if (Object.keys(updateFields).length === 0) {
    return next(new ErrorHandler("No fields provided for update", 400));
  }

  const updatedBlog = await blogModel.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Blog updated successfully",
    data: updatedBlog,
  });
});
