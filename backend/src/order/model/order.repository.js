import OrderModel from "./order.schema.js";

export const createNewOrderRepo = async (data, id) => {
    // Write your code here for placing a new order
    return await new OrderModel({ user: id, ...data }).save();
};

export const getSingleOrderRepo = async (orderId) => {
    return await OrderModel.findById(orderId);
};

export const getUserOrderRepo = async (userId) => {
    return await OrderModel.find({ user: userId });
};

export const allPlacedOrdersRepo = async () => {
    return await OrderModel.find({});
};

export const updateOrderDetailsRepo = async (orderId, orderStatus) => {
    return await OrderModel.findByIdAndUpdate(
        orderId,
        { orderStatus },
        {new:true, runValidators:true}
    )
};