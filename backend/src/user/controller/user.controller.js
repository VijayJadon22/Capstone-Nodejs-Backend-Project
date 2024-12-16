import { ErrorHandler } from "../../../utils/emails/errorHandler.js";
import { sendEmail } from "../../../utils/emails/welcomeMail.js";
import { sendToken } from "../../../utils/sendToken.js";
import crypto from "crypto";
import {
    createNewUserRepo,
    findUserRepo,
    findUserForPasswordResetRepo,
    updateUserProfileRepo,
    getAllUsersRepo,
    deleteUserRepo,
    updateUserRoleAndProfileRepo
} from "../models/user.repository.js";
import { stat } from "fs";

export const createNewUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const newUser = await createNewUserRepo(req.body);

        if (!newUser) {
            return res.status(400).json({ status: "false", error: "email already registered" });
        }

        // Implement sendEmail function to send welcome message
        await sendEmail(newUser, "welcome");
        return res.status(200).json({ status: "success", user: newUser });
    } catch (error) {
        // Check if the error is due to duplicate email 
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return next(new ErrorHandler(400, "Email already registered"));
        }
        return next(new ErrorHandler(400, error));
    }
};

export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler(400, "please enter email/password"));
        }
        const user = await findUserRepo({ email }, true);
        if (!user) {
            return next(new ErrorHandler(401, "user not found! register yourself now!!"));
        }

        const passwordMatch = await user.comparePassword(password);
        if (!passwordMatch) {
            return next(new ErrorHandler(401, "Invalid passsword!"));
        }

        await sendToken(user, res, 200)

    } catch (error) {
        return next(new ErrorHandler(400, error));
    }
};

export const forgetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        if (!email) return next(new ErrorHandler(400, "Enter a valid email"));

        const user = await findUserRepo({ email });
        if (!user) return next(new ErrorHandler(400, "Email not registered"));

        const resetToken = await user.getResetPasswordToken();

        // save user document as resetPasswordToken and resetTokenExpire we have modified in userschema function
        await user.save({ validateBeforeSave: false });

        await sendEmail(user, "resetPassword", resetToken);
        res.status(200).json({ success: true, message: 'Reset password email sent successfully' });

    } catch (error) {
        return next(new ErrorHandler(400, error));
    }
};

// Function to handle password reset
export const resetUserPassword = async (req, res, next) => {
    try {
        // Extract the token from the request parameters
        const { token } = req.params;
        // Extract the password and confirmPassword from the request body
        const { password, confirmPassword } = req.body;

        if (!password) {
            return next(new ErrorHandler(400, "Password is required"));
        }
        // Validate if the password and confirmPassword match
        if (password !== confirmPassword) {
            return next(new ErrorHandler(400, "Password and confirm password do not match"));
        }

        // Hash the token from the request parameters
        const hashtoken = crypto.createHash("sha256").update(token).digest("hex");

        // Find the user by the hashed token and check if the token is still valid
        const user = await findUserForPasswordResetRepo(hashtoken);

        // If user is not found or token is invalid, return an error
        if (!user) {
            return next(new ErrorHandler(400, "Invalid or expired token"));
        }

        // Update the user's password and clear the reset token and expiration
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Save the updated user document
        await user.save();

        // Send a success response
        return res.status(200).json({ success: true, message: 'Password has been updated successfully' });

    } catch (error) {
        // Handle any errors that occur
        return next(new ErrorHandler(400, error));
    }
};

export const getUserDetails = async (req, res, next) => {
    try {
        const user = await findUserRepo({ _id: req.user._id });
        if (!user) {
            return next(new ErrorHandler(400, "User not found"));
        }
        return res.status(200).json({ status: true, user });
    } catch (error) {
        // Handle any errors that occur
        return next(new ErrorHandler(500, error));
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        // Extract currentPassword, newPassword, and confirmPassword from the request body
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate if the current password is provided
        if (!currentPassword) {
            return next(new ErrorHandler(401, "Please enter current password"));
        }

        // Validate if new password and confirm password match
        if (!newPassword || newPassword !== confirmPassword) {
            return next(new ErrorHandler(401, "Mismatch between new password and confirm password!"));
        }

        // Find the user by their ID (req.user._id) with the password field included
        const user = await findUserRepo({ _id: req.user._id }, true);

        // Check if the current password matches the user's saved password
        const passwordMatch = await user.comparePassword(currentPassword);
        if (!passwordMatch) {
            return next(new ErrorHandler(401, "Incorrect current password!"));
        }

        // Update the user's password with the new password
        user.password = newPassword;

        // Save the updated user document
        await user.save();

        // Send a new token to the user after updating the password
        await sendToken(user, res, 200);
    } catch (error) {
        // Handle any errors that occur
        return next(new ErrorHandler(400, error.message || 'Internal Server Error'));
    }
};

export const updateUserProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const updatedUserDetails = await updateUserProfileRepo(req.user._id, req.body);
        res.status(201).json({ success: true, updatedUserDetails });
    } catch (error) {
        // Handle any errors that occur
        return next(new ErrorHandler(400, error.message || 'Internal Server Error'));
    }
};

export const logoutUser = async (req, res, next) => {
    try {
        // Clear the token cookie
        res.cookie('token', null, {
            expires: new Date(Date.now()), // Set the cookie to expire immediately
            httpOnly: true // Ensure the cookie is not accessible via JavaScript on the client side
        });

        // Send success response
        res.status(200).json({
            success: true,
            message: "Logged out successfully!"
        });
    } catch (error) {
        // Handle any errors that occur
        return next(new ErrorHandler(400, error.message || 'Internal Server Error'));
    }
};



//Admin only controller functions
//these controllers function will only be accessible by admin

export const getAllUsers = async (req, res, next) => {
    try {
        const allUsers = await getAllUsersRepo();
        if (!allUsers) {
            return res.status(400).json({ status: false, msg: "No user Found" });
        }
        res.status(200).json({ status: true, allUsers });
    } catch (error) {
        return next(new ErrorHandler(400, error.message || 'Internal Server Error'));
    }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
    try {
        const userDetails = await findUserRepo({ _id: req.params.id });
        if (!userDetails) {
            return res.status(400).json({ success: false, msg: "no user found with provided id" });
        }
        res.status(200).json({ success: true, userDetails });
    } catch (error) {
        return next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};


export const deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await deleteUserRepo(req.params.id);
        if (!deleteUser) {
            return res.status(400).json({ status: false, msg: "no user found with provided id" });
        }
        return res.status(200).json({ status: true, msg: "user deleted successfully" });
    } catch (error) {
        return next(new ErrorHandler(400, error));
    }
};

export const updateUserProfileAndRole = async (req, res, next) => {
    try {
        // Call the repository function to update the user profile and role by ID
        const updatedUser = await updateUserRoleAndProfileRepo(req.params.id, req.body);

        // Check if the user was found and updated
        if (!updatedUser) {
            return res.status(400).json({ status: false, message: "User not found with the provided ID." });
        }

        // Return the updated user details with a success message
        return res.status(201).json({
            status: true,
            message: "User profile and role updated successfully.",
            updatedUser
        });
    } catch (error) {
        // Handle any errors that occur
        return next(new ErrorHandler(400, error.message || 'Internal Server Error'));
    }
};











