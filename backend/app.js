import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";

import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import userRoutes from "./src/user/routes/user.routes.js";
import productRoutes from "./src/product/routes/product.routes.js";
import orderRoutes from "./src/order/routes/order.routes.js";

const configPath = path.resolve("backend", "config", "uat.env");
dotenv.config({ path: configPath });

const app = express();

app.use(cookieParser());
app.use(express.json());
// Serve static files from the "public" directory 
app.use(express.static(path.join(path.resolve(), 'public')));

app.use("/api/storefleet/user", userRoutes);
app.use("/api/storefleet/product", productRoutes);
app.use("/api/storefleet/order", orderRoutes);


app.use(errorHandlerMiddleware);


export default app;