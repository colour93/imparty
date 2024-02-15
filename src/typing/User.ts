import { User } from "@/entity/User";

export type UserBaseInfo = Pick<User, "id" | "name">;