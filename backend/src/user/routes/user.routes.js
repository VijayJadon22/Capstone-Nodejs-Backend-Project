import express from "express";
import { auth, authByUserRole } from "../../../middlewares/auth.js";

import {
    createNewUser,
    userLogin,
    forgetPassword,
    resetUserPassword,
    getUserDetails,
    updatePassword,
    updateUserProfile,
    getAllUsers,
    getUserDetailsForAdmin,
    deleteUser
} from "../controller/user.controller.js";

const router = express.Router();

// post routes
router.route("/signup").post(createNewUser);
router.route("/login").post(userLogin);
router.route("/password/forget").post(forgetPassword);

//put routes
router.route("/password/reset/:token").put(resetUserPassword);
router.route("/password/update").put(auth, updatePassword);
router.route("/profile/update").put(auth, updateUserProfile);


//get routes
router.route("/details").get(auth, getUserDetails);


/*Admin only routes */
//GET Routes
router.route("/admin/allusers").get(auth, authByUserRole("admin"), getAllUsers);
router.route("/admin/details/:id").get(auth, authByUserRole("admin"), getUserDetailsForAdmin);

//DELETE routes
router.route("/admin/delete/:id").delete(auth, authByUserRole("admin"), deleteUser);





export default router;