/**
 * Platform Controller
 */

import { INVITE_CODE_EXPIRE_MODE_ARR } from "@/entity/IniviteCode";
import { PLATFORM_VISIBLE_ARR } from "@/entity/Platform";
import { inviteCodeRepo, platformRepo, userRepo } from "@/repository";
import {
  addUserToPlatform,
  getPlatformByInviteCode,
  inviteCodeIncrease,
} from "@/service/platform";
import { InviteCodeInfo } from "@/typing/InviteCode";
import { ResponseCode } from "@/typing/ResponseCode";
import { getRandomHexString } from "@/util";
import logger from "@/util/logger";
import { idRegex } from "@/util/regex";
import { RequestHandler } from "express";
import _ from "lodash";
import { nanoid } from "nanoid";
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
  const platformDto = await platformRepo.findOne({
    where: { id: req.params.pid },
    relations: ["rooms"],
  });

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
      res.send({
        ...ResponseCode.NOT_MODIFIED,
        msg: "已经在平台中了",
      });
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
    if (!idRegex.test(form.id)) {
      res.send(ResponseCode.BAD_REQUEST);
      return;
    }

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

export const updatePlatform: RequestHandler = async (req, res) => {
  const id = req.params.pid;
  const rawData = req.body;

  const form = _.pick(rawData, ["name", "visible"]);

  if (form.visible && !PLATFORM_VISIBLE_ARR.includes(form.visible)) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  if (!id) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const platformDto = await platformRepo.findOne({
    where: { id },
    relations: ["owner"],
  });

  if (!platformDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  if (platformDto.owner.id != req.session.userId) {
    res.send(ResponseCode.FORBIDDEN);
    return;
  }

  const result = await platformRepo.save({
    ...platformDto,
    ...form,
  });

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("platform update failed", req.path, req.body, req.session);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: _.omit(
        result,
        ["owner.password"],
        ["owner.avatar"],
        ["owner.avatarType"]
      ),
    });
  }
};

export const deletePlatform: RequestHandler = async (req, res) => {
  const id = req.params.pid;

  if (!id) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const platformDto = await platformRepo.findOne({
    where: { id },
    relations: ["owner"],
  });

  if (!platformDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  if (platformDto.owner.id != req.session.userId) {
    res.send(ResponseCode.FORBIDDEN);
    return;
  }

  const result = await platformRepo.delete({ id });

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("platform delete failed", req.path, req.session);
  } else {
    res.send({ ...ResponseCode.SUCCEED, data: result });
  }
};

export const getInviteCodeListByPlatform: RequestHandler = async (req, res) => {
  const id = req.params.pid;

  if (!id) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const list = await inviteCodeRepo.findBy({ platform: { id } });

  res.send({
    ...ResponseCode.SUCCEED,
    data: list,
  });
};

export const createInviteCode: RequestHandler = async (req, res) => {
  const id = req.params.pid;
  const rawData = req.body;

  if (!id) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const form: InviteCodeInfo = _.pick(rawData, [
    "expiredMode",
    "expiredAt",
    "expiredCount",
  ]);
  let formFormatted: Record<string, any> = {};

  if (
    !form.expiredMode ||
    !INVITE_CODE_EXPIRE_MODE_ARR.includes(form.expiredMode)
  ) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  if (form.expiredMode === "date") {
    if (!form.expiredAt || new Date(form.expiredAt).getTime() < Date.now()) {
      res.send(ResponseCode.BAD_REQUEST);
      return;
    }
    formFormatted.expiredAt = new Date(form.expiredAt);
  }

  if (form.expiredMode === "count") {
    if (!form.expiredCount || form.expiredCount <= 0) {
      res.send(ResponseCode.BAD_REQUEST);
      return;
    }
  }

  const platformDto = await platformRepo.findOneBy({ id });

  if (!platformDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  if (!["invite-only", "public"].includes(platformDto.visible)) {
    res.send({
      ...ResponseCode.FORBIDDEN,
      msg: `平台加入权限不为 "公开" 或 "仅邀请"`,
    });
  }

  const code = nanoid();

  const result = await inviteCodeRepo.save({
    ...form,
    ...formFormatted,
    code,
    platform: platformDto,
  });

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("invite code create failed", req.path, req.body, req.session);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: result,
    });
  }
};

export const updateInviteCode: RequestHandler = async (req, res) => {
  const pid = req.params.pid;
  const code = req.params.code;
  const rawData = req.body;

  if (!pid || !code) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const form = _.pick(rawData, ["status"]);

  if (!["disabled", "enabled"].includes(form.status)) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const inviteCodeDto = await inviteCodeRepo.findOneBy({
    code,
    platform: { id: pid },
  });

  if (!inviteCodeDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  inviteCodeDto.status = form.status;

  const result = await inviteCodeRepo.save(inviteCodeDto);

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("invite code update failed", req.path, req.body, req.session);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: result,
    });
  }
};

export const deleteInviteCode: RequestHandler = async (req, res) => {
  const pid = req.params.pid;
  const code = req.params.code;

  if (!pid || !code) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const result = await inviteCodeRepo.delete({ code, platform: { id: pid } });
  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("invite code delete failed");
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: result,
    });
  }
};
