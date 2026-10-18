
const mongoose = require("mongoose");

const {
  parseDate,
} = require("../utils/bookingSchedule");

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const sessionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      match: timePattern,
    },

    endTime: {
      type: String,
      required: true,
      match: timePattern,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    eventName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    eventDate: {
      type: String,
      required: true,
    },

    practiceStart: {
      type: String,
      required: true,
    },

    practiceEnd: {
      type: String,
      required: true,
    },

    schedule: {
      type: String,
      enum: ["daily", "selected"],
      required: true,
    },

    selectedDays: {
      type: [Number],
      default: [],
      validate: {
        validator: (days) =>
          days.every(
            (day) =>
              Number.isInteger(day) &&
              day >= 0 &&
              day <= 6 &&
              day !== 3
          ),
        message: "Wednesday cannot be selected.",
      },
    },

    startTime: {
      type: String,
      required: true,
      match: timePattern,
    },

    endTime: {
      type: String,
      required: true,
      match: timePattern,
    },

    sessions: {
      type: [sessionSchema],
      required: true,
      validate: {
        validator: (sessions) =>
          sessions.length > 0 &&
          sessions.length <= 366 &&
          sessions.every((session) => {
            try {
              const date = parseDate(session.date);

              return (
                date.getUTCDay() !== 3 &&
                session.startTime < session.endTime
              );
            } catch {
              return false;
            }
          }),
        message: "Invalid practice sessions or Wednesday booking.",
      },
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    groupName: {
      type: String,
      trim: true,
      default: "",
    },

    details: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    permissionLetter: {
      fileName: {
        type: String,
        required: true,
      },

      storageKey: {
        type: String,
        required: true,
      },

      mimeType: {
        type: String,
        enum: ["application/pdf"],
        required: true,
      },

      size: {
        type: Number,
        required: true,
        min: 1,
        max: 5 * 1024 * 1024,
      },
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Cancelled",
      ],
      default: "Pending",
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

bookingSchema.index({
  student: 1,
  createdAt: -1,
});

bookingSchema.index({
  status: 1,
  eventDate: 1,
});

bookingSchema.pre("validate", function () {
  const event = parseDate(this.eventDate);
  const first = parseDate(this.practiceStart);
  const last = parseDate(this.practiceEnd);

  if (first > last || last > event) {
    throw new Error("Invalid booking date range.");
  }

  if ((last - first) / 86400000 > 365) {
    throw new Error("Practice range exceeds 365 days.");
  }

  for (const session of this.sessions || []) {
    const date = parseDate(session.date);

    if (date < first || date > last || date > event) {
      throw new Error("Session date is outside practice range.");
    }
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
