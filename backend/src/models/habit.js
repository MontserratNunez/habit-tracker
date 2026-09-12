import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'El título del hábito es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede superar los 100 caracteres'],
    },
    frequency: {
      type: {
        type: String,
        enum: [
          'daily',
          'weekly',
          'monthly',
          'weekly_target',
          'weekly_days',
          'interval_weeks',
          'monthly_days',
          'monthly_pattern'
        ],
        required: true,
        default: 'daily',
      },
      targetCount: { type: Number, min: 1, max: 31 },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }],
      daysOfMonth: [{ type: Number, min: 1, max: 31 }],
      intervalWeeks: { type: Number, min: 1 },
      monthlyPattern: {
        weekNumber: { type: Number, min: 1, max: 5 },
        dayOfWeek: { type: Number, min: 0, max: 6 }
      }
    },
    status: {
      type: Boolean,
      default: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastCompleted: {
      type: Date,
      default: null,
    },
    completedDates: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Habit', habitSchema);