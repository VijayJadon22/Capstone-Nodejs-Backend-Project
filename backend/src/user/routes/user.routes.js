import express from "express";

import { createNewUser } from "../controller/user.controller.js";

const router = express.Router();

router.route("/signup").post(createNewUser);
router.route("/login").post()