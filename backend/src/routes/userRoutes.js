import express from "express";
import { login, register } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post((req, res) => {
  res.status(501).json({ message: "Add to activity route not implemented yet" });
});
router.route("/get_all_activity").get((req, res) => {
  res.status(501).json({ message: "Get all activity route not implemented yet" });
});

export default router;

