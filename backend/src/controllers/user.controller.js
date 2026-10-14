
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { User } from "../models/user.model.js";
import { RefreshToken } from "../models/refreshToken.model.js";

const COOKIE_NAME = "refreshToken";

const refreshDays = () => {
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
  return Number.isFinite(days) && days > 0 ? days : 7;
};

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/users",
  maxAge: refreshDays() * 24 * 60 * 60 * 1000,
});

const clearCookieOptions = () => {
  const { maxAge, ...options } = cookieOptions();
  return options;
};

const hashRefreshToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const createAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

const createRefreshToken = async (userId) => {
  const rawToken = randomBytes(48).toString("hex");

  await RefreshToken.create({
    userId,
    tokenHash: hashRefreshToken(rawToken),
    expiresAt: new Date(
      Date.now() + refreshDays() * 24 * 60 * 60 * 1000
    ),
  });

  return rawToken;
};

const sendSession = async (res, user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user._id);

  res.cookie(COOKIE_NAME, refreshToken, cookieOptions());

  return res.status(200).json({
    message: "Authentication successful",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
    },
  });
};

export const register = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !username.trim() ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message:
          "Provide a name, username, and password of 8–72 bytes.",
      });
    }

    const cleanName = name.trim();
    const cleanUsername = username.trim();

    if (cleanName.length > 100 || cleanUsername.length > 50) {
      return res.status(400).json({
        message: "Name or username is too long.",
      });
    }

    const existingUser = await User.findOne({
      username: cleanUsername,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      username: cleanUsername,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Unable to register user.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = await User.findOne({
      username: username.trim(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    return await sendSession(res, user);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
};

export const refresh = async (req, res) => {
  const rawToken = req.cookies?.[COOKIE_NAME];

  if (!rawToken) {
    return res.status(401).json({
      message: "Refresh token is required. Please log in again.",
    });
  }

  try {
    const tokenHash = hashRefreshToken(rawToken);

    // Atomically consume this token. Only one concurrent refresh
    // request can successfully use the same token.
    const storedToken = await RefreshToken.findOneAndDelete({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      res.clearCookie(COOKIE_NAME, clearCookieOptions());
      return res.status(401).json({
        message: "Refresh token is invalid or expired. Please log in again.",
      });
    }

    const user = await User.findById(storedToken.userId);

    if (!user) {
      res.clearCookie(COOKIE_NAME, clearCookieOptions());
      return res.status(401).json({
        message: "User no longer exists. Please log in again.",
      });
    }

    // sendSession creates a new access token and a new refresh token.
    return await sendSession(res, user);
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      message: "Unable to refresh session.",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const rawToken = req.cookies?.[COOKIE_NAME];

    if (rawToken) {
      await RefreshToken.deleteOne({
        tokenHash: hashRefreshToken(rawToken),
      });
    }

    res.clearCookie(COOKIE_NAME, clearCookieOptions());

    return res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Unable to log out.",
    });
  }
};
