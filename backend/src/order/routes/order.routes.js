import express from "express";
import { authByUserRole, auth } from "../../../middlewares/auth.js";
import {
    createNewOrder,
    getSingleOrder,
    getUserOrder,
    allPlacedOrders,
    updateOrderDetails
} from "../controller/order.controller.js";

const router = express.Router();


//GET routes
router.route("/:orderId").get(auth, getSingleOrder);
router.route("/my/orders").get(auth, getUserOrder);

//POST routes
router.route("/new").post(auth, createNewOrder);

//ADMIN only routes
//GET routes
router.route("/orders/placed").get(auth, authByUserRole("admin"), allPlacedOrders);

//PUT routes
router.route("/update/:orderId").put(auth, authByUserRole("admin"), updateOrderDetails);

export default router;