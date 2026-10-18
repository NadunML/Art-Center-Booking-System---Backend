
const MAX_RANGE_DAYS = 365;

function parseDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new Error("Invalid date format. Use YYYY-MM-DD.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date;
}

function validateTime(value) {
  return (
    typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
}

function calculateEndTime(startTime, hours) {
  if (!validateTime(startTime)) {
    throw new Error("Invalid practice start time.");
  }

  const duration = Number(hours);

  if (
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > 4
  ) {
    throw new Error("Duration must be between 1 and 4 hours.");
  }

  const [hour, minute] = startTime.split(":").map(Number);
  const total = hour * 60 + minute + duration * 60;

  if (total >= 1440) {
    throw new Error("Practice must end before midnight.");
  }

  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}

function generatePracticeSessions(data) {
  const {
    eventDate,
    practiceStart,
    practiceEnd,
    schedule,
    selectedDays = [],
    startTime,
    durationType,
    fixedHours,
    endTime,
  } = data;

  const event = parseDate(eventDate);
  const first = parseDate(practiceStart);
  const last = parseDate(practiceEnd);

  const now = new Date();
  const today = new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
  );

  if (event < today || first < today) {
    throw new Error("Event and practice dates cannot be in the past.");
  }

  if (first > last) {
    throw new Error("Practice start date must be before end date.");
  }

  if (last > event) {
    throw new Error("Practice cannot end after the event date.");
  }

  const rangeDays = (last - first) / 86400000;

  if (rangeDays > MAX_RANGE_DAYS) {
    throw new Error("Practice range cannot exceed 365 days.");
  }

  if (!["daily", "selected"].includes(schedule)) {
    throw new Error("Invalid practice frequency.");
  }

  if (!Array.isArray(selectedDays)) {
    throw new Error("Selected days must be an array.");
  }

  if (
    selectedDays.some(
      (day) =>
        !Number.isInteger(day) ||
        day < 0 ||
        day > 6 ||
        day === 3
    )
  ) {
    throw new Error("Invalid weekday. Wednesdays are unavailable.");
  }

  if (schedule === "selected" && selectedDays.length === 0) {
    throw new Error("Select at least one available weekday.");
  }

  if (!validateTime(startTime)) {
    throw new Error("Invalid practice start time.");
  }

  let finalEndTime;

  if (durationType === "fixed") {
    finalEndTime = calculateEndTime(startTime, fixedHours);
  } else if (durationType === "custom") {
    if (!validateTime(endTime)) {
      throw new Error("Invalid practice end time.");
    }

    finalEndTime = endTime;
  } else {
    throw new Error("Invalid duration type.");
  }

  if (finalEndTime <= startTime) {
    throw new Error("Practice end time must be after start time.");
  }

  const sessions = [];
  const current = new Date(first);

  while (current <= last) {
    const weekday = current.getUTCDay();

    const allowed =
      weekday !== 3 &&
      (schedule === "daily" || selectedDays.includes(weekday));

    if (allowed) {
      sessions.push({
        date: current.toISOString().slice(0, 10),
        startTime,
        endTime: finalEndTime,
      });
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  if (sessions.length === 0) {
    throw new Error(
      "No available practice dates. Wednesdays cannot be booked."
    );
  }

  return {
    sessions,
    endTime: finalEndTime,
  };
}

module.exports = {
  parseDate,
  generatePracticeSessions,
};
