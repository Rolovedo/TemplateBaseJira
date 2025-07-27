import express from "express";
import { receiveWhatsappResponse } from "./whatsapp.controller.js";

const whatsappRoutes = express.Router();

whatsappRoutes.post("/webhook", receiveWhatsappResponse);

export default whatsappRoutes;
