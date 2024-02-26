/**
 * Room Controller
 */

import { platformRepo, roomRepo, userRepo } from "@/repository";
import { pushRoomCreate } from "@/service/push";
import { ResponseCode } from "@/typing/ResponseCode";
import { RoomInfo, RoomUpdateInfo } from "@/typing/Room";
import { getRandomHexString } from "@/util";
import logger from "@/util/logger";
import { RequestHandler } from "express";
import _ from "lodash";
import { LessThan, MoreThan } from "typeorm";

export const getCurrentUserRoomList: RequestHandler = async (req, res) => {
  const id = req.session.userId;

  if (!id) {
    res.send(ResponseCode.UNAUTHORIZED);
    return;
  }

  const userDto = await userRepo.findOne({
    where: { id },
    relations: ["rooms", "rooms.users"],
  });

  if (!userDto) {
    res.send(ResponseCode.UNAUTHORIZED);
    return;
  }

  const list = userDto?.rooms ?? [];

  res.send({
    ...ResponseCode.SUCCEED,
    data: list,
  });
};

export const getPlatformRoomList: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const { pid } = req.params;

  const { status, sort, key } = req.query;

  if (!uid || !pid) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  let extraFilter = {};
  switch (status) {
    case "all":
      extraFilter = {};
      break;

    case "expired":
      extraFilter = {
        endAt: LessThan(new Date()),
      };
      break;

    case "active":
    default:
      extraFilter = {
        endAt: MoreThan(new Date()),
      };
      break;
  }

  const roomDtoList = await roomRepo
    .find({
      where: {
        platform: {
          id: pid,
          users: {
            id: uid,
          },
        },
        ...extraFilter,
      },
      order: {
        [(key as string | undefined) ?? "endAt"]: sort ?? "DESC",
      },
      relations: ["platform", "platform.users", "users"],
    })
    .then((data) => data.map((item) => _.omit(item, ["platform"])));

  res.send({
    ...ResponseCode.SUCCEED,
    data: roomDtoList,
  });
};

export const createRoom: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const pid = req.params.pid;
  const rawData = req.body;

  if (!uid || !pid) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const form: RoomInfo = _.pick(rawData, [
    "name",
    "game",
    "startAt",
    "endAt",
    "total",
    "description",
    "link",
  ]);
  let formFormatted: Record<string, any> = {};

  if (!form.startAt || !form.endAt || !form.game) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  formFormatted.startAt = new Date(form.startAt);
  formFormatted.endAt = new Date(form.endAt);

  if (formFormatted.endAt.getTime() < Date.now()) {
    res.send({ ...ResponseCode.BAD_REQUEST, msg: "不能创建已经结束的房间" });
    return;
  }

  const userDto = await userRepo.findOneBy({ id: uid });

  const platformDto = await platformRepo.findOne({
    where: {
      id: pid,
    },
    relations: ["users", "rooms"],
  });

  if (
    !userDto ||
    !platformDto ||
    !platformDto.users.find((u) => u.id === uid)
  ) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  const result = await roomRepo.save({
    ...form,
    ...formFormatted,
    users: [userDto],
    platform: platformDto,
    id: "R".concat(getRandomHexString()),
  });

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("room create failed", req.path, req.body, req.session);
  } else {
    pushRoomCreate(result);
    res.send({
      ...ResponseCode.SUCCEED,
      data: result,
    });
  }
};

export const updateRoom: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const rid = req.params.rid;
  const rawData = req.body;

  if (!uid || !rid) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const form: RoomUpdateInfo = _.pick(rawData, [
    "name",
    "game",
    "startAt",
    "endAt",
    "total",
    "description",
    "link",
  ]);
  let formFormatted: Record<string, any> = {};

  if (form.startAt) formFormatted.startAt = new Date(form.startAt);
  if (form.endAt) formFormatted.endAt = new Date(form.endAt);

  if (formFormatted.endAt && formFormatted.endAt.getTime() < Date.now()) {
    res.send({ ...ResponseCode.BAD_REQUEST, msg: "不能创建已经结束的房间" });
    return;
  }

  const roomDto = await roomRepo.findOne({
    where: { id: rid },
    relations: ["users"],
  });

  if (!roomDto || !roomDto.users.find((u) => u.id === uid)) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  const result = await roomRepo.save({
    ...roomDto,
    ...form,
    ...formFormatted,
  });

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("room update failed", req.path, req.body, req.session);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: result,
    });
  }
};

export const joinRoom: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const rid = req.params.rid;

  if (!uid || !rid) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const userDto = await userRepo.findOneBy({ id: uid });

  const roomDto = await roomRepo.findOne({
    where: { id: rid },
    relations: ["platform", "users", "platform.users"],
  });

  if (!userDto || !roomDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  if (roomDto.users.find((u) => u.id === uid)) {
    res.send({
      ...ResponseCode.NOT_MODIFIED,
      msg: "已经在房间中了",
    });
    return;
  }

  if (!roomDto.platform.users.find((u) => u.id === uid)) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  if (roomDto.total && roomDto.users.length >= roomDto.total) {
    res.send({
      ...ResponseCode.FORBIDDEN,
      msg: "房间人数已满",
    });
    return;
  }

  if (roomDto.endAt.getTime() < Date.now()) {
    res.send({
      ...ResponseCode.FORBIDDEN,
      msg: "房间已过期",
    });
    return;
  }

  roomDto.users.push(userDto);

  const result = await roomRepo.save(roomDto);

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("room join failed", req.path, req.body, req.session);
  } else {
    res.send({
      ...ResponseCode.SUCCEED,
      data: result,
    });
  }
};

export const quitRoom: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const rid = req.params.rid;

  if (!uid || !rid) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const userDto = await userRepo.findOneBy({ id: uid });

  const roomDto = await roomRepo.findOne({
    where: { id: rid },
    relations: ["users"],
  });

  if (!userDto || !roomDto) {
    res.send(ResponseCode.NOT_FOUND);
    return;
  }

  if (!roomDto.users.find((u) => u.id === uid)) {
    res.send({
      ...ResponseCode.NOT_MODIFIED,
      msg: "不在房间中",
    });
    return;
  }

  if (roomDto.endAt.getTime() < Date.now()) {
    res.send({
      ...ResponseCode.FORBIDDEN,
      msg: "房间已过期",
    });
    return;
  }

  roomDto.users = roomDto.users.filter((u) => u.id != uid);

  const result = await roomRepo.save(roomDto);

  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("room quit failed", req.path, req.session);
  } else {
    res.send({ ...ResponseCode.SUCCEED, data: result });
  }
};

export const deleteRoom: RequestHandler = async (req, res) => {
  const uid = req.session.userId;
  const { rid } = req.params;

  if (!uid || !rid) {
    res.send(ResponseCode.BAD_REQUEST);
    return;
  }

  const roomDto = await roomRepo.findOne({
    where: {
      id: rid,
      platform: {
        users: {
          id: uid,
        },
      },
    },
    relations: ["platform", "platform.users"],
  });

  if (!roomDto) {
    res.send({
      ...ResponseCode.NOT_FOUND,
      msg: "房间不存在或不在对应平台中",
    });
    return;
  }

  const result = await roomRepo.delete({
    id: roomDto.id,
  });
  if (!result) {
    res.send(ResponseCode.INTERNAL_ERROR);
    logger.error("room delete failed", req.path, req.session);
  } else {
    res.send({ ...ResponseCode.SUCCEED, data: result });
  }
};
