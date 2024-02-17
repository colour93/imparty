/**
 * Auth Middleware
 */

import { userRepo } from "@/repository";
import { ResponseCode } from "@/typing/ResponseCode";
import { RequestHandler } from "express";

const ROUTES_WHITE_LIST = ["/auth", "/user/avatar"];

export const authMiddleware: RequestHandler = async (req, res, next) => {
  // white list
  if (ROUTES_WHITE_LIST.some((v) => req.path.startsWith(v))) {
    next();
    return;
  }

  // unauth
  if (
    !req.session.userId ||
    !(await userRepo.findOneBy({ id: req.session.userId }))
  ) {
    res.send(ResponseCode.UNAUTHORIZED);
    return;
  }

  next();
};
