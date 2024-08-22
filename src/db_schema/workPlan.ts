import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const WorkoutSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  workoutTime: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

// Define Day schema
const DaySchema = new Schema({
  date: {
    type: String,
    required: true
  },
  workout: {
    type: WorkoutSchema,
    required: true
  },
  difficultyFeedback: {
    type: Number, // 1- Very easy, 5 - Very difficult
    required: false
  },
  completedDistance: {
    type: Number,
    required: false
  },
  completedTime:{
    type: Number,
    required: false
  }
});

// Define Plan schema
const PlanSchema = new Schema({
  days: [DaySchema],
  week: {
    type: Number,
    required: true
  }
});

// Define main WorkoutPlan schema
const WorkoutPlanSchema = new Schema({
  lut: {
    type: Date,
    required: true
  },
  plan: [PlanSchema],
  user_id: {
    type: String,
    required: true
  }
});

const WorkoutPlan = mongoose.model('WorkoutPlan', WorkoutPlanSchema);

export default WorkoutPlan;
