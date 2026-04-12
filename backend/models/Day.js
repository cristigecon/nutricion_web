import mongoose from "mongoose";

const { Schema } = mongoose;

const daySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      default: "entrenamiento",
      trim: true,
    },
    selecciones: {
      type: Schema.Types.Mixed,
      default: {},
    },
    mealChecks: {
      type: Schema.Types.Mixed,
      default: {},
    },
    workout: {
      type: Schema.Types.Mixed,
      default: [],
    },
    cardio: {
      type: Boolean,
      default: false,
    },
    entrenoCheck: {
      type: Boolean,
      default: false,
    },
    meals: {
      type: Schema.Types.Mixed,
      default: {},
    },
    progress: {
      type: Number,
      default: 0,
    },
    isPerfectDay: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

daySchema.index({ user: 1, date: 1 }, { unique: true });

const Day = mongoose.model("Day", daySchema);

export default Day;
