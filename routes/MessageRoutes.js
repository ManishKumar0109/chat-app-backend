import { Router } from "express";
import multer from "multer";

import { verifyuser } from "../middlewares/AuthMiddleware.js";

import {
  getMessages,
  sendFile,
} from "../controllers/MessagesController.js";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const MessageRouter = Router();

MessageRouter.post(
  "/getmessages",
  verifyuser,
  getMessages
);

MessageRouter.post(
  "/sendfile",
  verifyuser,
  upload.single("file"),
  sendFile
);

export default MessageRouter;