/**
 * Platform Router
 */

import {
  createPlatform,
  getCurrentUserPlatformList,
  getInviteInfo,
  getPlatform,
  joinInvite,
} from "@/controller/platform";
import { Router } from "express";

const platformRouter = Router();

platformRouter.get("/list", getCurrentUserPlatformList);

platformRouter.get("/detail/:pid", getPlatform);

platformRouter.get("/join/:code", getInviteInfo);

platformRouter.post("/join/:code", joinInvite);

platformRouter.post("/new", createPlatform);

export default platformRouter;
