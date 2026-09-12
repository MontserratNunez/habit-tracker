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
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
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