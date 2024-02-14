/**
 * Auth Controller
 */

import { userRepo } from "@/repository";
import { ResponseCode } from "@/typing/ResponseCode";
import { UserInfo } from "@/typing/User";
import { compareHashPassword, createHashPassword } from "@/util";
import logger from "@/util/logger";
import { idRegex, passwordRegex } from "@/util/regex";
import { RequestHandler } from "express";
import _ from "lodash";

export const login: RequestHandler = async (req, res) => {
  const rawData = req.body;

  const form = _.pick(rawData, ["id", "password"]);

  if (!form.id || !form.password) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const userDto = await userRepo.findOne({
    where: { id: form.id },
    relations: ["platforms", "rooms"],
  });

  if (
    !userDto ||
    !(await compareHashPassword(form.password, userDto.password))
  ) {
    res.send({
      ...ResponseCode.UNAUTHORIZED,
      msg: "ID 或密码错误",
    });
    return;
  }

  req.session.userId = userDto.id;
  const user: UserInfo = _.omit(userDto, ["password", "avatar", "avatarType"]);
  res.send({
    ...ResponseCode.SUCCEED,
    data: user,
  });
};

export const register: RequestHandler = async (req, res) => {
  const rawData = req.body;

  const form = _.pick(rawData, ["id", "name", "password"]);

  if (!form.id || !form.password) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  if (!idRegex.test(form.id)) {
    res.send({
      ...ResponseCode.BAD_REQUEST,
      msg: "ID 不符合要求",
    });
    return;
  }

  if (!passwordRegex.test(form.password)) {
    res.send({
      ...ResponseCode.BAD_REQUEST,
      msg: "密码不符合要求",
    });
    return;
  }

  const existUserDto = await userRepo.findOneBy({ id: form.id });

  if (existUserDto) {
    res.send({
      ...ResponseCode.CONFLICT,
      msg: "ID 已存在",
    });
    return;
  }

  const user = await userRepo.save({
    ...form,
    password: await createHashPassword(form.password),
  });

  if (!user) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("save user error", req.path, req.body);
    return;
  }

  req.session.userId = user.id;

  res.send({
    ...ResponseCode.SUCCEED,
    data: _.omit(user, ["avatar", "avatarType", "password"]),
  });
};

export const logout: RequestHandler = async (req, res) => {
  if (!req.session.userId) {
    res.send(ResponseCode.UNAUTHORIZED);
    return;
  }

  req.session.userId = undefined;

  if (!req.session.userId) {
    res.send(ResponseCode.SUCCEED);
  } else {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("logout error", req.path, req.body, req.session);
  }
};
