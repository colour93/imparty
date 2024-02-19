/**
 * User Controller
 */

import { userProfileRepo, userRepo } from "@/repository";
import { ResponseCode } from "@/typing/ResponseCode";
import { RequestHandler } from "express";
import { UserBaseInfo } from "@/typing/User";
import _ from "lodash";
import sharp from "sharp";
import logger from "@/util/logger";
import { readFileSync } from "fs";
import { join } from "path";

export const getCurrentUser: RequestHandler = async (req, res) => {
  const userDto = await userRepo.findOne({
    where: { id: req.session.userId },
    relations: ["platforms", "rooms", "rooms.users"],
  });

  if (!userDto) {
    res.send(ResponseCode.NOT_FOUND);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: userDto,
    });
  }
};

export const getUser: RequestHandler = async (req, res) => {
  const userDto = await userRepo.findOneBy({ id: req.params.uid });

  if (!userDto) {
    res.send(ResponseCode.NOT_FOUND);
  } else {
    const user: UserBaseInfo = _.pick(userDto, ["id", "name"]);
    res.send({
      ...ResponseCode.SUCCEED,
      data: user,
    });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  const rawData: Record<string, string> = req.body;

  const updateData = _.pick(rawData, ["name"]);

  const userDto = await userRepo.findOneBy({ id: req.session.userId });

  const newUser = {
    ...userDto,
    ...updateData,
  };

  const result = await userRepo.save(newUser);

  if (!result) {
    res.send(ResponseCode.NOT_FOUND);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
    });
  }
};

export const uploadUserAvatar: RequestHandler = async (req, res) => {
  const id = req.session.userId;

  if (!id || !req.file) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const userProfileDto = await userProfileRepo.findOne({
    where: { user: { id } },
    relations: ["user"],
  });

  if (!userProfileDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  const buffer = await sharp(req.file.buffer)
    .resize({
      height: 400,
    })
    .toBuffer();

  userProfileDto.avatar = buffer;

  const result = await userProfileRepo.save(userProfileDto);

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("upload avatar failed", req.path, req.body, req.session);
  } else {
    res.send(ResponseCode.SUCCEED);
  }
};

export const getUserAvatar: RequestHandler = async (req, res) => {
  const id = req.params.uid || req.session.userId;

  if (!id) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const userProfileDto = await userProfileRepo.findOne({
    where: { user: { id } },
    relations: ["user"],
  });

  res
    .set("Content-Type", "image/png")
    .send(
      userProfileDto?.avatar ??
        readFileSync(join("src", "asset", "default_avatar.jpg"))
    );
};
