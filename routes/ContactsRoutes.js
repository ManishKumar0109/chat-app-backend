import { Router } from "express";
import { verifyuser } from "../middlewares/AuthMiddleware.js";
import { searchcontacts } from "../controllers/ContactsController.js";
import { getContacts } from "../controllers/ContactsController.js";

const contactsRouter=Router();

contactsRouter.get('/searchcontacts',verifyuser,searchcontacts)

contactsRouter.get('/getcontacts',verifyuser,getContacts)

export default contactsRouter