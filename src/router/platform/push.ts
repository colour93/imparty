/**
 * Push Router
 */

import {
  createPushChannel,
  deletePushChannel,
  getPushChannelByPlatform,
  updatePushChannel,
} from "@/controller/pushChannel";
import { Router } from "express";

const pushRouter = Router();

pushRouter.get("/:pid/list", getPushChannelByPlatform);

pushRouter.post("/:pid/new", createPushChannel);

pushRouter.put("/:pid/update/:pushId", updatePushChannel);

pushRouter.delete("/:pid/delete/:pushId", deletePushChannel);

export default pushRouter;
