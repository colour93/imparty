/**
 * Push Channel Controller
 */

import { platformRepo, pushChannelRepo } from "@/repository";
import { PushChannelOneBotSchema } from "@/schema/push-channel/onebot";
import { PushChannelUpdateInfo } from "@/typing/PushChannel";
import { ResponseCode } from "@/typing/ResponseCode";
import logger from "@/util/logger";
import { RequestHandler } from "express";
import _ from "lodash";
import { nanoid } from "nanoid";

export const getPushChannelByPlatform: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const { pid } = req.params;

  if (!uid || !pid) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const pushChannelDtoList = await pushChannelRepo.find({
    where: {
      platform: {
        id: pid,
        owner: {
          id: uid,
        },
      },
    },
    relations: ["platform", "platform.owner"],
  });

  res.send({
    ...ResponseCode.SUCCEED,
    data: pushChannelDtoList,
  });
};

export const createPushChannel: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const { pid } = req.params;
  const rawData = req.body;

  if (!rawData.type || !_.isObject(rawData.config) || !uid || !pid) {
    res.send({ ...ResponseCode.BAD_REQUEST });
    return;
  }

  const form: PushChannelUpdateInfo = _.pick(rawData, ["type", "config"]);

  const platformDto = await platformRepo.findOne({
    where: {
      id: pid,
      owner: {
        id: uid,
      },
    },
    relations: ["owner"],
  });

  if (!platformDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  try {
    switch (form.type) {
      case "onebot":
        await PushChannelOneBotSchema.validate(form.config);
        break;

      default:
        res.send(ResponseCode.BAD_REQUEST);
        return;
    }

    const result = await pushChannelRepo.save({
      ...form,
      id: nanoid(),
      platform: platformDto,
      config: JSON.stringify(form.config),
    });

    if (!result) {
      res.send(ResponseCode.INTERNAL_ERROR);
      logger.error(
        "push channel create failed",
        req.path,
        req.body,
        req.session
      );
    } else {
      res.send({
        ...ResponseCode.SUCCEED,
        data: result,
      });
    }
  } catch (error) {
    res.send({
      ...ResponseCode.BAD_REQUEST,
      msg: "参数错误",
      data: error,
    });
  }
};

export const updatePushChannel: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const { pid, pushId } = req.params;
  const rawData = req.body;

  if (!rawData.type || !_.isObject(rawData.config) || !uid || !pid || !pushId) {
    res.send({ ...ResponseCode.BAD_REQUEST });
    return;
  }

  const form: PushChannelUpdateInfo = _.pick(rawData, ["type", "config"]);

  const pushChannelDto = await pushChannelRepo.findOne({
    where: {
      id: pushId,
      platform: {
        id: pid,
        owner: {
          id: uid,
        },
      },
    },
    relations: ["platform", "platform.owner"],
  });

  if (!pushChannelDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  try {
    switch (form.type) {
      case "onebot":
        await PushChannelOneBotSchema.validate(form.config);
        break;

      default:
        res.send(ResponseCode.BAD_REQUEST);
        return;
    }

    const result = await pushChannelRepo.save({
      ...pushChannelDto,
      ...form,
      config: JSON.stringify(form.config),
    });

    if (!result) {
      res.send(ResponseCode.INTERNAL_ERROR);
      logger.error(
        "push channel update failed",
        req.path,
        req.body,
        req.session
      );
    } else {
      res.send({
        ...ResponseCode.SUCCEED,
        data: result,
      });
    }
  } catch (error) {
    res.send({
      ...ResponseCode.BAD_REQUEST,
      msg: "参数错误",
      data: error,
    });
  }
};

export const deletePushChannel: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const { pid, pushId } = req.params;

  if (!uid || !pid || !pushId) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const pushChannelDto = await pushChannelRepo.findOne({
    where: {
      id: pushId,
      platform: {
        id: pid,
        owner: {
          id: uid,
        },
      },
    },
    relations: ["platform", "platform.owner"],
  });

  if (!pushChannelDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  const result = await pushChannelRepo.delete(pushChannelDto);

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("push channel delete failed", req.path, req.body, req.session);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: result,
    });
  }
};
