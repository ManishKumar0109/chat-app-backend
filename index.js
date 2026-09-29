import express from "express";
import dotenv from "dotenv";
import connectDB from "./db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/AuthRoutes.js";
import profileRouter from "./routes/ProfileRoutes.js";
import contactsRouter from "./routes/ContactsRoutes.js";
import http from "http";
import { Server } from "socket.io";
import setupSocket from "./socket.js";
import MessageRouter from "./routes/MessageRoutes.js";
import channelRouter from "./routes/ChannelRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

const origin = process.env.ORIGIN;

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});

setupSocket(io);

app.use(
  cors({
    origin: origin,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/message", MessageRouter);
app.use("/api/channel",channelRouter );


connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server running on", PORT);
  });
});
