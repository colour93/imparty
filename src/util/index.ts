import { customAlphabet } from "nanoid";
import * as argon2 from "argon2";

export const getRandomHexString = () =>
  customAlphabet("1234567890abcdef", 10)();

export const createHashPassword = async (password: string) => await argon2.hash(password);

export const compareHashPassword = async (password: string, hashedPassword: string) => await argon2.verify(hashedPassword, password);
