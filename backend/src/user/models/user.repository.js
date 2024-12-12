import UserModel from "./user.schema.js";

export const createNewUserRepo = async (user) => {
    return await new UserModel(user).save();
};

export const findUserRepo = async (factor, withPassword = false) => {
    if (withPassword) {
        return await UserModel.findOne(factor).select("+password");
    } else {
        return await UserModel.findOne(factor)
    };
};

