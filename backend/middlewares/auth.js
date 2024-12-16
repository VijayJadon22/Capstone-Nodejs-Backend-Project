import UserModel from "../src/user/models/user.schema.js";
import { ErrorHandler } from "../utils/emails/errorHandler.js";
import jwt from "jsonwebtoken";

// Middleware function to authenticate users
export const auth = async (req, res, next) => {
    try {
        const {token}  = req.cookies;

        if (!token) {
            return next(new ErrorHandler(401, "Login to access this route!"));
        }

        // Verify the token
        const data = jwt.verify(token, process.env.JWT_Secret);

        // Check if token verification failed
        if (!data) {
            return next(new ErrorHandler(401, "Invalid or expired token"));
        }

        // Find the user by ID from the token data
        const user = await UserModel.findById(data.id);
        if (!user) return next(new ErrorHandler(404, "User not found"));

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        // Handle any errors that occur
        return next(new ErrorHandler(500, error.message));
    }
};


/* this is a new way to check for allow roles to access 
 ...roles creates an array of arguments or roles, and then middleware checks if in the array the user role matches with the roles having access */
export const authByUserRole = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(403, `Role: ${req.user.role} is not allowed to access this resource`));
        }

        next();
    }
};


// export const authByUserRole = (req, res, next) => {
//     try {
//         // Check if the user is authenticated and has a role set
//         if (!req.user || !req.user.role) {
//             return next(new ErrorHandler(401, "Unauthorized access!"));
//         }
//         // Check if the user's role is 'admin'
//         if (req.user.role !== 'admin') {
//             return next(new ErrorHandler(403, "Access denied! Admins only."));
//         }
//         // If user is admin, proceed to the next middleware or route handler
//         next();
//     } catch (error) {
//         // Handle any errors that occur
//         return next(new ErrorHandler(500, error.message || "Internal Server Error"));
//     }
// };
