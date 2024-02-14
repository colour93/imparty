import express from "express";
import Pino from "pino-http";
import logger from "@/util/logger";
import { initAppDataSource } from "./data-source";
import { preload } from "@/util/preload";
import rootRouter from "./router";
import session from "express-session";
import { readFileSync } from "fs";
import { join } from "path";
import { Config } from "./typing/Config";

preload();

const config: Config = JSON.parse(
  readFileSync(join("data", "config.json"), "utf-8")
);

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const pino = Pino();
const app = express();

app.use(express.json());

app.use(
  session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: true,
  })
);

// app.use(pino);

app.use(rootRouter);

const PORT = 24932;

initAppDataSource().then(() =>
  app.listen(PORT, () => {
    logger.info(`HTTP service running on ${PORT}`);
  })
);
