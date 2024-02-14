/**
 * Root Router
 */

import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import platformRouter from "./platform";

const rootRouter = Router();

rootRouter.get("/", (req, res) => {
  res.send("Hello");
});

rootRouter.use(authMiddleware);

rootRouter.use("/auth", authRouter);

rootRouter.use("/user", userRouter);

rootRouter.use("/platform", platformRouter);

export default rootRouter;
