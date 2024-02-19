import express from "express";
import cors from "cors";
import Pino from "pino-http";
import logger from "@/util/logger";
import { initAppDataSource } from "./data-source";
import { preload } from "@/util/preload";
import rootRouter from "./router";
import session from "express-session";
import { readFileSync } from "fs";
import { join } from "path";
import { Config } from "./typing/Config";
import { ResponseCode } from "./typing/ResponseCode";

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

const allowOrigins = ["http://localhost:24933", "https://imparty.cn"];

app.use(
  cors({
    origin: (o, cb) => {
      if (!o) return cb(null, true);
      if (allowOrigins.includes(o)) return cb(null, true);
      return cb(
        new Error(
          "The CORS policy for this site does not allow access from the specified Origin."
        ),
        false
      );
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: true,
    },
  })
);

// app.use(pino);

app.use(rootRouter);

app.use((_, res) => {
  res.status(404).send({ ...ResponseCode.NOT_FOUND, msg: "路径不存在" });
});

const PORT = 24932;

initAppDataSource().then(() =>
  app.listen(PORT, () => {
    logger.info(`HTTP service running on ${PORT}`);
  })
);
