import express from "express";

import {
    addNewProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getProductDetails,
    rateProduct,
    getAllReviewsOfAProduct,
    deleteReview
 } from "../controller/product.controller.js";
import { auth, authByUserRole } from "../../../middlewares/auth.js";

const router = express.Router();

//GET routes




//POST routes
// admin only routes
router.route("/add").post(auth, authByUserRole("admin"), addNewProduct);




export default router;