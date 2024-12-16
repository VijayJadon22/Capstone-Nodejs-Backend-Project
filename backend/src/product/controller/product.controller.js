import { ErrorHandler } from "../../../utils/emails/errorHandler.js";

import {
    addNewProductRepo,
    getAllProductsRepo,
    updateProductRepo,
    deleteProductRepo,
    getProductDetailsRepo,
    findProductRepo
} from "../models/product.repository.js";


export const addNewProduct = async (req, res, next) => {
    try {
        // Call repository function to add new product with createdBy field and request body data
        const product = await addNewProductRepo({
            createdBy: req.user._id,
            ...req.body
        });

        // Check if the product was created successfully
        if (!product) {
            return next(new ErrorHandler(400, "Some error occurred while creating the product."));
        }
        // Return success response with the newly created product
        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product
        });

    } catch (error) {
        // Handle any errors that occur and pass them to the next middleware
        return next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await getAllProductsRepo(req.query);
        res.status(200).json({
            success: true,
            results: products.length,
            data: products
        });
    } catch (error) {
        return next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const updatedProduct = await updateProductRepo(req.prams.id, req.body);
        if (!updatedProduct) {
            return res.status(400).json({ status: false, message: "Product not found!" });
        }
        res.status(200).json({ success: true, updatedProduct });
    } catch (error) {
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const deletedProduct = await deleteProductRepo(req.params.id);
        if (!deletedProduct) {
            return res.status(400).json({ status: false, message: "Product not found" });
        }
        return res.status(200).json({ status: true, message: "Product deleted" });
    } catch (error) {
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
}

export const getProductDetails = async (req, res, next) => {
    try {
        const productDetails = await getProductDetailsRepo(req.params.id);
        if (!productDetails) {
            return next(new ErrorHandler(400, "Product not found!"));
        }
        res.status(200).json({ success: true, productDetails });
    } catch (error) {
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const rateProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const { rating, comment } = req.body;
        const user = req.user._id;
        const name = req.user.name;

        // Review object to be added
        const review = {
            user,
            name,
            rating,
            comment
        };

        // Validate rating
        if (!rating) {
            return next(new ErrorHandler(400, "Rating can't be empty"));
        }

        // Find the product by ID
        const product = await findProductRepo(productId);
        if (!product) {
            return next(new ErrorHandler(404, 'Product not found'));
        }

        // Check if user has already reviewed the product
        const existingReview = product.reviews.find((rev) => {
            return rev.user.toString() === user.toString()
        });

        if (existingReview) {
            // Update the existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
        } else {
            // Add new review
            product.reviews.push(review);
        }

        // Recalculate the average rating
        const totalRatings = product.reviews.length;
        const sumRatings = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
        product.rating = sumRatings / totalRatings;

        // Save the updated product
        await product.save();

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
    try {
        const product = await findProductRepo(req.params.id);
        if (!product) {
            return next(new ErrorHandler(404, "Product not found!"));
        }

        if (product.reviews.length == 0) {
            return next(new ErrorHandler(400, "No reviews found for product"));
        }
        return res.status(200).json({ status: true, reviews: product.reviews });
    } catch (error) {
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const deleteReview = async (req, res, next) => {
    try {
        // Extract the authenticated user's ID from the request
        const user = req.user._id;
        const { productId, reviewId } = req.query;

        if (!productId || !reviewId) {
            return next(new ErrorHandler(400, "Please provide productId and reviewId as query params"));
        }

        // Find the product by ID using the repository function
        const product = await findProductRepo(productId);

        if (!product) return next(new ErrorHandler(404, "Product not found!"));

        // Find the index of the review to be deleted
        const reviewIndex = product.reviews.findIndex((rev) => rev._id.toString() === reviewId.toString());

        // Check if the review exists
        if (reviewIndex === -1) {
            return next(new ErrorHandler(404, "Review not found!"));
        }

        // Ensure the review belongs to the user trying to delete it
        if (product.reviews[reviewIndex].user.toString() !== user.toString()) {
            return next(new ErrorHandler(403, "You are not authorized to delete this review"));
        }

        // Remove the review from the array
        product.reviews.splice(reviewIndex, 1);

        // Recalculate the average rating
        const totalRatings = product.reviews.length;
        const ratingSum = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
        product.rating = totalRatings > 0 ? ratingSum / totalRatings : 0;

        // Save the updated product
        await product.save();

        // Send the response
        return res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        // Handle errors
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};








