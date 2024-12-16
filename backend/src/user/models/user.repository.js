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

export const findUserForPasswordResetRepo = async (hashtoken) => {
    const user = await UserModel.findOne({
        resetPasswordToken: hashtoken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    return user;
};

export const updateUserProfileRepo = async (id, data) => {
    return await UserModel.findOneAndUpdate(
        { _id: id },
        data,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    );
};

export const getAllUsersRepo = async () => {
    return await UserModel.find({});
};

export const deleteUserRepo = async (id) => {
    return await UserModel.findByIdAndDelete(id);
}

