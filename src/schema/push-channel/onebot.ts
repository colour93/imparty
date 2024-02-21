import { httpAndWsRegex } from "@/util/regex";
import Schema from "validate";

export const PushChannelOneBotSchema = new Schema({
  host: {
    type: String,
    required: true,
    match: httpAndWsRegex,
  },
  accessToken: {
    type: String,
    required: false,
  },
  groups: {
    type: Array,
    each: {
      type: Number,
    },
  },
});
