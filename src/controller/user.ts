/**
 * User Controller
 */

import { userRepo } from "@/repository";
import { ResponseCode } from "@/typing/ResponseCode";
import { RequestHandler } from "express";
import { UserBaseInfo, UserInfo } from "@/typing/User";
import _ from "lodash";

export const getCurrentUser: RequestHandler = async (req, res) => {
  const userDto = await userRepo.findOne({
    where: { id: req.session.userId },
    relations: ["platforms", "rooms"],
  });

  if (!userDto) {
    res.send(ResponseCode.NOT_FOUND);
  } else {
    const user: UserInfo = _.omit(userDto, [
      "password",
      "avatar",
      "avatarType",
    ]);
    res.send({
      ...ResponseCode.SUCCEED,
      data: user,
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
