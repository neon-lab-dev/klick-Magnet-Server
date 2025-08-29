import adminModel from "../models/admin.model.js";
import { ADMIN_AUTH_TOKEN } from "../constants/cookies.constant.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorhandler.js";
import sendToken from "../utils/jwtToken.js";

export const registerAdmin = catchAsyncErrors(async (req, res, next) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  let existingAdmin = await adminModel.findOne({ email });
  if (existingAdmin) {
    return next(new ErrorHandler("Email already exists", 400));
  }

  const admin = await adminModel.create({
    full_name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    data: admin,
    message: `Welcome ${admin.full_name}, You are now registered as an Admin`,
  });
});

export const loginAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }
  const admin = await adminModel.findOne({ email }).select("+password");
  if (!admin) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  const isPasswordMatched = await admin.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  sendToken(
    admin,
    200,
    res,
    `Welcome Back ${admin.full_name}`,
    ADMIN_AUTH_TOKEN
  );
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res.cookie(ADMIN_AUTH_TOKEN, "", {
    expires: new Date(0), // Set the expiration date to a past date to immediately expire the cookie
    httpOnly: true,
    secure: "true", // Set to true in production, false in development
    sameSite: "None", // Ensure SameSite is set to None for cross-site cookies
  });

  res.status(200).json({
    success: true,
    message: "Admin Logged Out Successfully",
  });
});

// Change password for logged-in admin
export const changeAdminPassword = catchAsyncErrors(async (req, res, next) => {
  const adminId = res.locals.admin.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorHandler("Please provide old and new password", 400));
  }

  const admin = await adminModel.findById(adminId).select("+password");
  if (!admin) {
    return next(new ErrorHandler("Admin not found", 404));
  }

  // Verify old password
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Old password is incorrect", 401));
  }

  // Update with new password
  admin.password = newPassword;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
