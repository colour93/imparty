import { User } from "@/entity/User";

export type UserBaseInfo = Pick<User, "id" | "name">;

export type UserInfo = Omit<User, "password" | "avatar" | "avatarType">;
