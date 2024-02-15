import Schema from "validate";
import {
  INVITE_CODE_EXPIRE_MODE_ARR,
} from "@/entity/IniviteCode";

export const InviteCodeBody = new Schema({
  expiredMode: {
    type: String,
    required: true,
    enum: INVITE_CODE_EXPIRE_MODE_ARR,
  },
});
