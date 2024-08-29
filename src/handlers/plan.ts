import { Request, Response } from 'express';
import logger from '../utils/logger';
import { geminiChat } from '../utils/gemini';
import { UserFitnessData, UserPreferences } from '../types/UserFitnessData';
import WorkoutPlan from '../db_schema/workPlan';
import User from '../models/userModel';
import { formatDBDate } from '../utils/DateFormatter';
import { AuthRequest } from 'src/middlewares/authMiddleware';

interface PlanInput {
  userFitnessData: UserFitnessData;
  userPreferences: UserPreferences;
}

export const generatePlan = async (req: AuthRequest, res: Response) => {
  logger.info('Gnerating plan...');

  console.log(req.body);

  const { userFitnessData, userPreferences } = req.body as PlanInput;

  let prompt = `Help me make a running training plan. 
                Here are my fitness data and prefrences: `;

  const addDetail = (label: string, detail: string | number | Date | undefined) => {
    if (detail) {
      prompt += `${label} - ${detail}. `;
    }
  };

  // Google Fit data
  addDetail('Gender', userPreferences.gender);
  addDetail('Weight', userFitnessData.weight);
  addDetail('Height', userFitnessData.height);
  addDetail('Age', userPreferences.age);

  // Prefrences
  addDetail('My Goal is', userPreferences.userRunningGoal);
  addDetail('My Running level is', userPreferences.userRunningLevel);
  prompt += `The plan should start on - ${userPreferences.startDate || new Date()}`;
  addDetail('The plan should end on', userPreferences.endDate);

  prompt += `The plan should specify what to do in each day until the race.`;
  console.log('prompt', prompt)
  const plan = (await geminiChat(prompt))?.plan;

  try {
    const userId = req.user?._id;

    // update user prefrences 
    await User.updateOne({_id: userId}, {
      userPreferences: {
        goal: userPreferences.userRunningGoal,
        level: userPreferences.userRunningLevel,
        planStartDate: userPreferences.startDate,
        planEndDate: userPreferences.endDate
      }
    });

    const newPlan = new WorkoutPlan({
      plan: plan,
      user_id: userId,
      lut: new Date(),
    });
    const savedPlan = await newPlan.save();
    return res.json(savedPlan);
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const getPlan = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?._id) {
      return res.json(await WorkoutPlan.findOne({ user_id: req.user?._id }));
    } else {
      return res.status(404).json("missing user id")
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updatePlan = async (req: AuthRequest, res: Response) => {
  logger.info('Updating plan...');
  try {
    if (req.user?._id) {
      const plan = await WorkoutPlan.findOneAndUpdate({ user_id: req.user?._id }, { plan: req.body.updatedPlan }, { new: true });

      const NUMBER_OF_HARD_WORKOUTS_FOR_REPLAN = 2;
      const NUMBER_OF_LATS_WORKOUTS_TO_CHECK_FOR_REPLAN = 3;
      let rePlan = 0;
      const feedbackWorkouts = plan?.plan.flatMap(week => week.days)?.filter(workout => workout.difficultyFeedback);
      if(feedbackWorkouts) {
        let hardWorkouts = 0;
        for(let i = feedbackWorkouts.length - 1; i >= 0 && i >= feedbackWorkouts.length - NUMBER_OF_LATS_WORKOUTS_TO_CHECK_FOR_REPLAN; i--) {
          if(feedbackWorkouts[i].difficultyFeedback === 4 || feedbackWorkouts[i].difficultyFeedback === 5)
            hardWorkouts++;
        }
        if(hardWorkouts >= NUMBER_OF_HARD_WORKOUTS_FOR_REPLAN)
          rePlan = 1;
      }
      console.log("rePlan: " + rePlan);

      return res.json({
        updatedPlan: plan,
        rePlanNeeded: rePlan
      });
    } else {
      return res.status(404).json("missing user id")
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

export const rePlanWorkoutPlan = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?._id) {
      console.log("ReAdjust plan! rePlanValue: " + req.body.rePlanValue);
      return res.json(await WorkoutPlan.findOne({ user_id: req.user?._id }));
    } else {
      return res.status(404).json("missing user id")
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getWorkout = async (req: Request, res: Response) => {
  try {
    return res.json(
      await WorkoutPlan.aggregate([
        { $match: { user_id: 'Roy' } },
        { $unwind: '$plan' },
        { $unwind: '$plan.days' },
        { $match: { 'plan.days.date': formatDBDate(new Date(req.query.date + '')) } },
        { $project: { workout: '$plan.days.workout' } },
      ]),
    );
  } catch (error) {
    res.status(500).send(error);
  }
};

export const setUserData = async (req: AuthRequest, res: Response) => {
  console.log('saving user data...');
  try {
    const response = await User.updateOne({ _id: req.user?._id }, { userPreferences: req.body.userPreferences });
    return res.json(!!response.modifiedCount);
  } catch (error) {
    res.status(500).send(error);
  }
};

