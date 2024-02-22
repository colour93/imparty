import { PushChannelType } from "@/entity/PushChannel";

export interface PushChannelUpdateInfo {
  type: PushChannelType;
  config: object;
}
