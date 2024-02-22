import { Room } from "@/entity/Room";
import { pushChannelRepo } from "@/repository";
import { pushToOneBot } from "./onebot";
import { getPushContentRoomCreate } from "@/push-content/roomCreate";

const getPushChannels = async (platformId: string) => {
  return await pushChannelRepo.find({
    where: {
      platform: {
        id: platformId,
      },
    },
    relations: ["platform"],
  });
};

export const pushContent = async (platformId: string, content: string) => {
  const channels = await getPushChannels(platformId);
  channels.forEach((channel) => {
    switch (channel.type) {
      case "onebot":
        pushToOneBot(channel.config, content);
        break;

      default:
        break;
    }
  });
};

export const pushRoomCreate = async (room: Room) => {
  pushContent(room.platform.id, getPushContentRoomCreate(room));
};
