export const formatMeetingLink = (link: string): string => {
  if (!link) return "";
  if (link.length <= 30) return link;
  return `${link.substring(0, 27)}...`;
};

// Check if an exam is currently active based on its schedule
export const isExamActive = (examScheduling: any): boolean => {
  if (!examScheduling) return true; // Unscheduled exams are always active

  const examDate = new Date(examScheduling.date);
  const now = new Date();

  // If exam date is in the future, it's not active yet
  if (examDate.toDateString() !== now.toDateString()) {
    return examDate < now;
  }

  // Check if the current time is within the exam window
  const [hours, minutes] = examScheduling.startTime.split(":").map(Number);

  const startTime = new Date(examDate);
  startTime.setHours(hours, minutes, 0, 0);

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + examScheduling.duration);

  return now >= startTime && now <= endTime;
};

// Get a human-readable status for an exam
export const getExamStatus = (examScheduling: any): string => {
  if (!examScheduling) return "Available Now";

  const examDate = new Date(examScheduling.date);
  const now = new Date();

  const [hours, minutes] = examScheduling.startTime.split(":").map(Number);
  const startTime = new Date(examDate);
  startTime.setHours(hours, minutes, 0, 0);

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + examScheduling.duration);

  if (now < startTime) {
    return "Scheduled";
  } else if (now >= startTime && now <= endTime) {
    return "In Progress";
  } else {
    return "Completed";
  }
};
