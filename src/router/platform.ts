/**
 * Platform Router
 */

import {
  createInviteCode,
  createPlatform,
  deleteInviteCode,
  deletePlatform,
  getCurrentUserPlatformList,
  getInviteCodeListByPlatform,
  getInviteInfo,
  getPlatform,
  joinInvite,
  updateInviteCode,
  updatePlatform,
} from "@/controller/platform";
import { Router } from "express";

const platformRouter = Router();

platformRouter.get("/list", getCurrentUserPlatformList);

platformRouter.get("/detail/:pid", getPlatform);

platformRouter.get("/join/:code", getInviteInfo);

platformRouter.post("/join/:code", joinInvite);

platformRouter.post("/new", createPlatform);

platformRouter.put("/update/:pid", updatePlatform);

platformRouter.delete("/delete/:pid", deletePlatform);

platformRouter.get("/invite/:pid/list", getInviteCodeListByPlatform);

platformRouter.post("/invite/:pid/new", createInviteCode);

platformRouter.put("/invite/:pid/update/:code", updateInviteCode);

platformRouter.delete("/invite/:pid/delete/:code", deleteInviteCode);

export default platformRouter;
