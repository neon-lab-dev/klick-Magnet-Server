import ErrorHandler from "../utils/errorhandler.js";

export default (err, req, res, next) => {
    let error = err;

    // If err is a string, convert it to an Error object
    if (typeof err === 'string') {
        error = new Error(err);
    }

    error.statusCode = error.statusCode || 500;
    error.message = error.message || "Internal Server Error";

    // Wrong MongoDB ID error
    if (error.name === "CastError") {
        const message = `Resource not Found. Invalid: ${error.path}`;
        error = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
        const message = `Duplicate ${Object.keys(error.keyValue)} Entered`;
        error = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (error.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid. Try again`;
        error = new ErrorHandler(message, 400);
    }

    // JWT expired error
    if (error.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired. Try again`;
        error = new ErrorHandler(message, 400);
    }

    // File not found error
    if (error.code === "ENOENT") {
        const message = `File Not Found`;
        error = new ErrorHandler(message, 404);
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
    });
};