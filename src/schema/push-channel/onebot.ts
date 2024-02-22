import { httpAndWsRegex } from "@/util/regex";
import Schema from "async-validator";

export const PushChannelOneBotSchema = new Schema({
  host: {
    type: "string",
    required: true,
    pattern: httpAndWsRegex,
  },
  accessToken: {
    type: "string",
    required: false,
  },
  groups: {
    type: "array",
    defaultField: { type: "number" },
  },
});
