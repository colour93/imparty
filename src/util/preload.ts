import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import logger from "./logger";
import { join } from "path";
import { nanoid } from "nanoid";

export const preload = () => {
  if (!existsSync("data")) {
    mkdirSync("data");
    logger.info(`'data' directory is missing. Creating`);
  } else if (!statSync("data").isDirectory()) {
    logger.error(`'data' is not a directory`);
    throw new Error();
  }

  const configPath = join("data", "config.json");
  if (!existsSync(configPath)) {
    const initConfig = {
      port: 24932,
      session_secret: nanoid(),
    };
    writeFileSync(configPath, JSON.stringify(initConfig, null, 2));
  } else {
    try {
      const configRaw = readFileSync(configPath, "utf-8");
      let config = JSON.parse(configRaw);
      if (!config.session_secret) {
        config = {
          ...config,
          session_secret: nanoid(),
        };
        writeFileSync(configPath, JSON.stringify(config, null, 2));
        logger.info(`Config 'session_secret' initialized`);
      }
    } catch (error) {
      logger.error("Load config failed");
      throw error;
    }
  }

  logger.info("Preload passed");
};
