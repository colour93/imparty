import { InviteCodeExpireMode } from "@/entity/IniviteCode";

export interface InviteCodeInfo {
  expiredMode: InviteCodeExpireMode;
  expiredAt?: string;
  expiredCount?: number;
}
