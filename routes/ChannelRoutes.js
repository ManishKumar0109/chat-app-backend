import { Router } from "express";
import { verifyuser } from "../middlewares/AuthMiddleware.js";
import {
  createChannel,
  getChannels,
} from "../controllers/ChannelController.js";

const channelRouter=Router();

channelRouter.post('/createchannel',verifyuser,createChannel)
channelRouter.get('/getchannels',verifyuser,getChannels)



export default channelRouter