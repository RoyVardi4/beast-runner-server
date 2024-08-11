import express from "express";
import authHandler from "../handlers/authHandler";
const router = express.Router();

router.post("/google", authHandler.googleSignin);
router.get("/logout", authHandler.logout);
router.get("/refresh", authHandler.refresh);

export default router;
