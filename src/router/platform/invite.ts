/**
 * Invite Router
 */

import {
  createInviteCode,
  deleteInviteCode,
  getInviteCodeListByPlatform,
  updateInviteCode,
} from "@/controller/platform";
import { Router } from "express";

const inviteRouter = Router();

inviteRouter.get("/:pid/list", getInviteCodeListByPlatform);

inviteRouter.post("/:pid/new", createInviteCode);

inviteRouter.put("/:pid/update/:code", updateInviteCode);

inviteRouter.delete("/:pid/delete/:code", deleteInviteCode);

export default inviteRouter;
