
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token is required.",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        message: "Invalid access token.",
      });
    }

    const user = await User.findById(decoded.userId).select(
      "-password -token"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired. Use the refresh endpoint.",
        code: "ACCESS_TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError" ||
        error.name === "NotBeforeError") {
      return res.status(401).json({
        message: "Invalid access token.",
      });
    }

    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      message: "Authentication service error.",
    });
  }
};
