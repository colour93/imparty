import { PushChannelOneBotSchema } from "@/schema/push-channel/onebot";
import { PushChannelOneBot } from "@/typing/push-channel/OneBot";
import logger from "@/util/logger";
import { nanoid } from "nanoid";
import WebSocket from "ws";

const sendMessage = (client: WebSocket, message: string, groups: number[]) => {
  if (groups.length === 0) {
    client.close();
    return;
  }

  const echo = nanoid();

  client.send(
    JSON.stringify({
      action: "send_group_msg",
      params: {
        group_id: groups.pop(),
        message,
      },
      echo,
    })
  );

  client.on("error", (err) => {
    logger.error("push onebot error", err);
    client.close();
  });

  client.on("message", (rawData) => {
    const data = JSON.parse(rawData.toString());

    if (data.echo === echo) {
      client.removeAllListeners();

      setTimeout(() => {
        sendMessage(client, message, groups);
      }, 1000);
    }
  });
};

export const pushToOneBot = async (config: string, content: string) => {
  try {
    const configFormatted: PushChannelOneBot = JSON.parse(config);

    await PushChannelOneBotSchema.validate(configFormatted);

    const { host, accessToken, groups } = configFormatted;

    if (host.startsWith("ws")) {
      const extra = accessToken
        ? {
            headers: {
              Authorization: "Bearer ".concat(accessToken),
            },
          }
        : {};

      const client = new WebSocket(host, extra);

      client.on("open", () => {
        sendMessage(client, content, groups);
      });
    }
  } catch (error) {
    return;
  }
};
