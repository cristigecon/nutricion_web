import mongoose from "mongoose";

const { Schema } = mongoose;

const mealPlanSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    estructuraDias: {
      type: Schema.Types.Mixed,
      default: {},
    },
    bloques: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

export default MealPlan;
