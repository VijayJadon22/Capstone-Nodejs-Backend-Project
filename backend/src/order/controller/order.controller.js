import { ErrorHandler } from "../../../utils/emails/errorHandler.js";
import {
    createNewOrderRepo,
    getSingleOrderRepo,
    getUserOrderRepo,
    allPlacedOrdersRepo,
    updateOrderDetailsRepo
} from "../model/order.repository.js";

export const createNewOrder = async (req, res, next) => {
    try {
        // Extract order data from the request body
        const orderData = req.body;
        // Call the repository function to create a new order
        const newOrder = await createNewOrderRepo(orderData, req.user._id);

        // Return the newly created order as a response
        res.status(201).json({
            success: true,
            order: newOrder
        });
    } catch (error) {
        // Pass the error to the next middleware
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};


export const getSingleOrder = async (req, res, next) => {
    try {
        //retrieve the order using the provided order ID from the request parameters
        const order = await getSingleOrderRepo(req.params.orderId);

        // Check if the order exists, if not, send a 404 error response
        if (!order) {
            return next(new ErrorHandler(404, 'Order not found'));
        }

        // Check if the logged-in user is either the order owner or an admin
        // only the order owner and admins can access the order details
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new ErrorHandler(403, 'Not authorized to view this order'));
        }

        // If the user is authorized
        return res.status(200).json({ status: true, order: order });
    } catch (error) {
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const getUserOrder = async (req, res, next) => {
    try {
        // Retrieve all orders for the logged-in user by their user ID
        const orders = await getUserOrderRepo(req.user._id);

        // Check if the user has any orders
        if (!orders || orders.length === 0) {
            return next(new ErrorHandler(404, 'No orders found for this user'));
        }

        // Return the user's orders as a response
        return res.status(200).json({ success: true, orders: orders });
    } catch (error) {
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const allPlacedOrders = async (req, res, next) => {
    try {
        // Retrieve all placed orders from the repository
        const orders = await allPlacedOrdersRepo();

        // Check if there are any orders
        if (!orders || orders.length === 0) {
            return next(new ErrorHandler(404, 'No orders found'));
        }

        // Return the list of all placed orders
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        // Handle any errors that occur during the process
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};

export const updateOrderDetails = async (req, res, next) => {
    try {
        // Extract order ID and updated status from the request
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        if (!orderStatus || !orderId) {
            return next(new ErrorHandler(404, 'Order id not found or orderStatus not updated'));
        }

        // Call the repository function to update the order status
        const updatedOrder = await updateOrderDetailsRepo(orderId, orderStatus);

        // Check if the order was found and updated
        if (!updatedOrder) {
            return next(new ErrorHandler(404, 'Order not found or status not updated'));
        }

        // Return the updated order as a response
        return res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
        // Handle any errors that occur during the process
        next(new ErrorHandler(500, error.message || 'Internal Server Error'));
    }
};




