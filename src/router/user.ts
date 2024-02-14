/**
 * User Router
 */

import { getCurrentUser, getUser, updateUser } from "@/controller/user";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/", getCurrentUser);

userRouter.get("/detail/:uid", getUser);

userRouter.put("/update", updateUser);

export default userRouter;
