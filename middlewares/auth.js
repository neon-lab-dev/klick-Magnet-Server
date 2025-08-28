// Needs to be rewritten
import ErrorHandler from "../utils/errorhandler.js";
import catchAsyncErrors from "./catchAsyncError.js";
import pkg from 'jsonwebtoken';
const { verify } = pkg;

import { ADMIN_AUTH_TOKEN } from "../constants/cookies.constant.js";
import adminModel from "../models/admin.model.js";



export const isAuthenticatedAdmin = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies;
    if (!token[ADMIN_AUTH_TOKEN]) {
        return next(new ErrorHandler("Please Login as Admin", 401));
    }
    let decodedData;
    try {
        decodedData = verify(token[ADMIN_AUTH_TOKEN], process.env.JWT_SECRET);
    } catch (error) {
        return next(
            new ErrorHandler("Invalid or expired token, please login again", 401)
        );
    }
    if (!decodedData || !decodedData.id) {
        return next(
            new ErrorHandler("Invalid token data, please login again", 401)
        );
    }
    res.locals.admin = await adminModel.findById(decodedData.id);
    if (!res.locals.admin) {
        return next(new ErrorHandler("Admin not found, please login again", 404));
    }
    next();
});