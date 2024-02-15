import { AppDataSource } from "@/data-source";
import { InviteCode } from "@/entity/IniviteCode";
import { Platform } from "@/entity/Platform";
import { Push } from "@/entity/Push";
import { Room } from "@/entity/Room";
import { User } from "@/entity/User";
import { UserProfile } from "@/entity/UserProfile";

export const userRepo = AppDataSource.getRepository(User);
export const userProfileRepo = AppDataSource.getRepository(UserProfile);
export const platformRepo = AppDataSource.getRepository(Platform);
export const roomRepo = AppDataSource.getRepository(Room);
export const inviteCodeRepo = AppDataSource.getRepository(InviteCode);
export const pushRepo = AppDataSource.getRepository(Push);
