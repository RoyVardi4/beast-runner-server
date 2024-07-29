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