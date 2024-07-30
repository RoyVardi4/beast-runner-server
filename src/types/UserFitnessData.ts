export enum Gender {
  female = 'Female',
  male = 'Male',
}

export interface UserFitnessData {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  moveMinuets?: number;
  heartPoints?: number;
}

export interface UserPreferences {
  userRunningLevel?: string;
  userRunningGoal?: string;
  startDate?: Date;
  endDate?: Date;
}
export interface Plan {
  plan: WeeklyPlan[];
}

export interface WeeklyPlan {
  days: Workout[];
  week: number;
}

export interface Workout {
  date: Date | string;
  workout: string;
}
