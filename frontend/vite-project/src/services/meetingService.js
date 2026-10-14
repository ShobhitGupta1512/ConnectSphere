
import api from "./api";

export const createMeeting = async () => {
  const response = await api.post("/meetings", {});
  return response.data.meeting;
};

export const getMeetingByCode = async (meetingCode) => {
  const code = meetingCode.trim();

  const response = await api.get(
    `/meetings/${encodeURIComponent(code)}`
  );

  return response.data.meeting;
};
