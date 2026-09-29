import { Router } from "express";
import { verifyuser } from "../middlewares/AuthMiddleware.js";
import { updateprofile, updateprofilepicture } from "../controllers/ProfileController.js";
import { getuserinfo } from "../controllers/ProfileController.js";
import multer from "multer";

const upload=multer()

const profileRouter=Router();

profileRouter.get('/getuserinfo',verifyuser,getuserinfo)
profileRouter.patch('/updateprofile',verifyuser,updateprofile)
profileRouter.patch('/updateprofilepicture',verifyuser,upload.single('image'),updateprofilepicture)


export default profileRouter