import express from "express";
import dotenv from "dotenv";
import path from "path";

import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";

const configPath = path.resolve("backend", "config", "uat.env");
dotenv.config({ path: configPath });

const app = express();

app.use("api/storefleet/user", userRoutes);


app.use(errorHandlerMiddleware);


export default app;