
import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
  createMeeting,
  getMeetingByCode,
} from "../controllers/meeting.controller.js";

const router = express.Router();

router.post("/", authenticateUser, createMeeting);
router.get("/:meetingCode", authenticateUser, getMeetingByCode);

export default router;
