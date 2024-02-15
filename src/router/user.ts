/**
 * User Router
 */

import {
  getCurrentUser,
  getUser,
  getUserAvatar,
  updateUser,
  uploadUserAvatar,
} from "@/controller/user";
import { avatarUpload } from "@/middleware/upload";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/", getCurrentUser);

userRouter.get("/detail/:uid", getUser);

userRouter.put("/update", updateUser);

userRouter.post(
  "/upload_avatar",
  avatarUpload.single("avatar"),
  uploadUserAvatar
);

userRouter.get("/avatar", getUserAvatar);

userRouter.get("/avatar/:uid", getUserAvatar);

export default userRouter;
