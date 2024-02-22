/**
 * Platform Router
 */

import {
  createPlatform,
  deletePlatform,
  getCurrentUserPlatformList,
  getInviteInfo,
  getPlatform,
  joinInvite,
  updatePlatform,
} from "@/controller/platform";
import { Router } from "express";
import inviteRouter from "./invite";
import pushRouter from "./push";

const platformRouter = Router();

platformRouter.get("/list", getCurrentUserPlatformList);

platformRouter.get("/detail/:pid", getPlatform);

platformRouter.get("/join/:code", getInviteInfo);

platformRouter.post("/join/:code", joinInvite);

platformRouter.post("/new", createPlatform);

platformRouter.put("/update/:pid", updatePlatform);

platformRouter.delete("/delete/:pid", deletePlatform);

platformRouter.use("/invite", inviteRouter);

platformRouter.use("/push", pushRouter);

export default platformRouter;
