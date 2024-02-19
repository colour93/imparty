/**
 * Root Router
 */

import { authMiddleware } from "@/middleware/auth";
import { Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";
import platformRouter from "./platform";
import roomRouter from "./room";
import { ResponseCode } from "@/typing/ResponseCode";

const rootRouter = Router();

rootRouter.get("/", (_, res) => {
  res.send({
    ...ResponseCode.SUCCEED,
    data: {
      app: process.env.npm_package_name,
      version: process.env.npm_package_version,
      repository: process.env.npm_package_repository,
    },
  });
});

rootRouter.use(authMiddleware);

rootRouter.use("/auth", authRouter);

rootRouter.use("/user", userRouter);

rootRouter.use("/platform", platformRouter);

rootRouter.use("/room", roomRouter);

export default rootRouter;
