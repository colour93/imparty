/**
 * Platform Service
 */

import { inviteCodeRepo, platformRepo, userRepo } from "@/repository";
import { PlatformBaseInfo } from "@/typing/Platform";
import logger from "@/util/logger";
import _ from "lodash";
import { In } from "typeorm";

export const getPlatformByInviteCode = async (code: string) => {
  const inviteCodeDto = await inviteCodeRepo.findOneBy({
    code,
    status: "enabled",
    platform: {
      visible: In(["public", "invite-only"]),
    },
  });

  const flag =
    (inviteCodeDto &&
      ["invite-only", "public"].includes(inviteCodeDto.platform.visible) &&
      ((inviteCodeDto.expiredMode === "count" &&
        (inviteCodeDto.expiredCount ?? 0 <= inviteCodeDto.currentCount)) ||
        ((inviteCodeDto.expiredMode === "date" &&
          inviteCodeDto.expiredAt &&
          inviteCodeDto.expiredAt.getTime() < Date.now()) ??
          true))) ||
    !inviteCodeDto
      ? false
      : true;

  const platformDto = flag
    ? inviteCodeDto?.platform
    : await platformRepo.findOneBy({
        id: code,
        visible: "public",
      });

  return platformDto
    ? (_.pick(platformDto, ["id", "name", "createdAt"]) as PlatformBaseInfo)
    : undefined;
};

export const addUserToPlatform = async (userId: string, platformId: string) => {
  const platformDto = await platformRepo.findOne({
    where: { id: platformId },
    relations: ["users"],
  });

  if (platformDto && platformDto.users.find((u) => u.id === userId))
    return "exist";

  const userDto = await userRepo.findOneBy({ id: userId });

  if (!platformDto || !userDto) return "failed";

  platformDto.users.push(userDto);

  const result = await platformRepo.save(platformDto);

  return result ? "succeed" : "failed";
};

export const inviteCodeIncrease = async (code: string) => {
  const inviteCodeDto = await inviteCodeRepo.findOneBy({ code });
  if (!inviteCodeDto) return false;
  inviteCodeDto.currentCount++;
  const result = await inviteCodeRepo.save(inviteCodeDto);
  if (!result) logger.error("invite code update failed");
  return result ? true : false;
};
