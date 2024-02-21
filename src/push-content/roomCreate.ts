import { Room } from "@/entity/Room";
import { momentZh } from "@/util/moment";

export const getPushContentRoomCreate = (room: Room) => {
  return (
    `[新房间] [${room.game}] ${room.name}\n` +
    `人数：${room.total && room.total > 0 ? room.total : "不限"}\n` +
    `开始：${momentZh(room.startAt).format("YYYY/MM/DD HH:mm")}\n` +
    `结束：${momentZh(room.endAt).format("YYYY/MM/DD HH:mm")}\n` +
    `创建者：${room.users[0].name ?? room.users[0].id}\n` +
    `来自平台：${room.platform.name ?? `未命名 - `.concat(room.platform.id)}` +
    `${
      process.env.IMPARTY_FRONT_URL
        ? `\n${process.env.IMPARTY_FRONT_URL}/#/join-room/${room.id}`
        : ""
    }` +
    `\nPowered By Imparty`
  );
};
