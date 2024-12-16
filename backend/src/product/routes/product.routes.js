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
router.route("/products").get(auth, getAllProducts);
router.route("/details/:id").get(auth, getProductDetails);
router.route("/reviews/:id").get(auth, getAllReviewsOfAProduct);

//POST routes
router.route("/rate/:id").put(auth, rateProduct);

//DELETE routes
router.route("/review/delete").delete(auth, deleteReview);


// Admin only routes
//POST routes
router.route("/add").post(auth, authByUserRole("admin"), addNewProduct);

//PUT routes
router.route("/update/:id").put(auth, authByUserRole("admin"), updateProduct);

//DELETE routes
router.route("/delete/:id").delete(auth, authByUserRole("admin"), deleteProduct);




export default router;