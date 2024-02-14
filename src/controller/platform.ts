/**
 * Platform Controller
 */

import { platformRepo, userRepo } from "@/repository";
import {
  addUserToPlatform,
  getPlatformByInviteCode,
  inviteCodeIncrease,
} from "@/service/platform";
import { ResponseCode } from "@/typing/ResponseCode";
import { getRandomHexString } from "@/util";
import logger from "@/util/logger";
import { RequestHandler } from "express";
import _ from "lodash";
import { In } from "typeorm";

export const getCurrentUserPlatformList: RequestHandler = async (req, res) => {
  const userDto = await userRepo.findOne({
    where: { id: req.session.userId },
    relations: ["platforms"],
  });

  if (!userDto) {
    res.send(ResponseCode.NOT_FOUND);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: userDto.platforms ?? [],
    });
  }
};

export const getPlatform: RequestHandler = async (req, res) => {
  const platformDto = await platformRepo.findOneBy({ id: req.params.pid });

  if (!platformDto) {
    res.send(ResponseCode.NOT_FOUND);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: platformDto,
    });
  }
};

export const getInviteInfo: RequestHandler = async (req, res) => {
  // accept:
  // public -> platform.id
  // invite-only -> invite_code
  // private -> x

  const platformInfo = await getPlatformByInviteCode(req.params.code);

  // not found
  if (!platformInfo) {
    res.send({
      ...ResponseCode.NOT_FOUND,
      msg: "邀请码不存在",
    });
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: platformInfo,
    });
  }
};

export const joinInvite: RequestHandler = async (req, res) => {
  if (!req.session.userId) {
    res.send(ResponseCode.UNAUTHORIZED);
    return;
  }

  const platformInfo = await getPlatformByInviteCode(req.params.code);

  // not found
  if (!platformInfo) {
    res.send({
      ...ResponseCode.NOT_FOUND,
      msg: "邀请码不存在",
    });
    return;
  }

  const result = await addUserToPlatform(req.session.userId, platformInfo.id);

  switch (result) {
    case "succeed":
      await inviteCodeIncrease(req.params.code);
      res.send(ResponseCode.SUCCEED);
      break;

    case "exist":
      res.send(ResponseCode.NOT_MODIFIED);
      break;

    case "failed":
    default:
      res.send(ResponseCode.NOT_FOUND);
      break;
  }
};

export const createPlatform: RequestHandler = async (req, res) => {
  const rawData = req.body;

  const userDto = await userRepo.findOneBy({ id: req.session.userId });

  if (!userDto) {
    res.send(ResponseCode.UNAUTHORIZED);
    return;
  }

  const form = _.pick(rawData, ["id", "name", "visible"]);

  if (form.id) {
    const platformDto = await platformRepo.findOneBy({ id: form.id });

    if (platformDto) {
      res.send({
        ...ResponseCode.CONFLICT,
        msg: "ID 已存在",
      });
      return;
    }
  } else {
    form.id = getRandomHexString();
  }

  const platformDto = await platformRepo.save({
    ...form,
    owner: userDto,
    users: [userDto],
  });

  if (!platformDto) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("platform create failed");
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: platformDto,
    });
  }
};
