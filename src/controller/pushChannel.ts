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

export const createPushChannel: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const { pid } = req.params;
  const rawData = req.body;

  if (!rawData.type || !_.isObject(rawData.config) || !uid || !pid) {
    res.send({ ...ResponseCode.BAD_REQUEST, rawData });
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
    relations: ["users", "owner"],
  });

  if (!platformDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  switch (form.type) {
    case "onebot":
      if (PushChannelOneBotSchema.validate(form.config).length != 0) {
        res.send({ ...ResponseCode.BAD_REQUEST, msg: "参数错误" });
        return;
      }

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
    logger.error("push channel create failed", req.path, req.body, req.session);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: result,
    });
  }
};
