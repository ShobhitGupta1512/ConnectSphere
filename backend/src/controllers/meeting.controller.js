
import { randomBytes } from "node:crypto";
import { Meeting } from "../models/meeting.model.js";

export const createMeeting = async (req, res) => {
  try {
    let meeting;
    let attempts = 0;

    // Generate a unique room code, retrying on a collision.
    while (!meeting && attempts < 5) {
      attempts += 1;

      const meetingCode = randomBytes(5).toString("hex");

      try {
        meeting = await Meeting.create({
          user_id: req.user._id,
          meetingCode,
        });
      } catch (error) {
        if (error.code !== 11000) {
          throw error;
        }
      }
    }

    if (!meeting) {
      return res.status(503).json({
        message: "Could not generate a meeting code. Please try again.",
      });
    }

    return res.status(201).json({
      message: "Meeting created successfully.",
      meeting: {
        id: meeting._id,
        meetingCode: meeting.meetingCode,
        date: meeting.date,
      },
    });
  } catch (error) {
    console.error("Create meeting error:", error);

    return res.status(500).json({
      message: "Failed to create meeting.",
    });
  }
};

export const getMeetingByCode = async (req, res) => {
  try {
    const meetingCode = req.params.meetingCode?.trim();

    if (!meetingCode || !/^[a-f0-9]{10}$/i.test(meetingCode)) {
      return res.status(400).json({
        message: "Invalid meeting code.",
      });
    }

    const meeting = await Meeting.findOne({ meetingCode });

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found.",
      });
    }

    return res.status(200).json({
      message: "Meeting found.",
      meeting: {
        id: meeting._id,
        meetingCode: meeting.meetingCode,
        date: meeting.date,
      },
    });
  } catch (error) {
    console.error("Get meeting error:", error);

    return res.status(500).json({
      message: "Failed to retrieve meeting.",
    });
  }
};
