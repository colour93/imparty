import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Platform } from "./entity/Platform";
import { Push } from "./entity/Push";
import { Room } from "./entity/Room";
import logger from "./util/logger";
import { InviteCode } from "./entity/IniviteCode";
import { UserProfile } from "./entity/UserProfile";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "data/data.db",
  synchronize: true,
  entities: [User, UserProfile, Platform, Push, Room, InviteCode],
  subscribers: [],
  migrations: [],
});

export const initAppDataSource = () =>
  AppDataSource.initialize()
    .then(() => {
      logger.info("Database initialized succeed");
    })
    .catch((error) => {
      logger.error("Database initialized failed", error);
      throw error;
    });
