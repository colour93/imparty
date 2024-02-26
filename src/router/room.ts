/**
 * Room Router
 */

import {
  createRoom,
  deleteRoom,
  getCurrentUserRoomList,
  getPlatformRoomList,
  joinRoom,
  quitRoom,
  updateRoom,
} from "@/controller/room";
import { Router } from "express";

const roomRouter = Router();

roomRouter.get("/list", getCurrentUserRoomList);

roomRouter.get("/list/:pid", getPlatformRoomList);

roomRouter.post("/new/:pid", createRoom);

roomRouter.put("/update/:rid", updateRoom);

roomRouter.post("/join/:rid", joinRoom);

roomRouter.post("/quit/:rid", quitRoom);

roomRouter.delete("/delete/:rid", deleteRoom);

export default roomRouter;
