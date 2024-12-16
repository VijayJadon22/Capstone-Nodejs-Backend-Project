import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "user name is required"],
        minLength: [2, "name should have atleast 2 charcters"],
        maxLength: [30, "user name can't exceed 30 characters"]
    },
    email: {
        type: String,
        required: [true, "user email is required"],
        unique: true, 
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        select: false
    },
    profileImg: {
        public_id: {
            type: String,
            required: true,
            default: "1234567890",
        },
        url: {
            type: String,
            required: true,
            default: "this is dummy avatar url",
        },
    },
    role: {
        type: String,
        default: "user",
        enum: ["admin", "user"]
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        const saltRounds = parseInt(process.env.SALT_ROUNDS, 10); // Ensure saltRounds is parsed as an integer with base 10
        this.password = await bcrypt.hash(this.password, saltRounds); // Assign the hashed password back to this.password
    }
    next(); // Proceed to the next middleware
});

// user password compare
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// JWT Token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_Secret, { expiresIn: process.env.JWT_Expire });
};

// getResetPasswordToken and store the token in resetPasswordToken and resetPasswordExpire
userSchema.methods.getResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; //10 minutes expiry for token or validity

    return resetToken;
};




const UserModel = mongoose.model("User", userSchema);
export default UserModel;


