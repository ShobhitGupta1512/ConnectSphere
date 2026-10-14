
import express from "express";
import {
  login,
  register,
  refresh,
  logout,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authenticateUser, (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
    },
  });
});

export default router;
