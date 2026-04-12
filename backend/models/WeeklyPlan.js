import mongoose from "mongoose";

const { Schema } = mongoose;

const weeklyPlanSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    days: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const WeeklyPlan = mongoose.model("WeeklyPlan", weeklyPlanSchema);

export default WeeklyPlan;
