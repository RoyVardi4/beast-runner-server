import { Request, Response } from 'express';
import logger from '../utils/logger';
import { geminiChat } from '../utils/gemini';
import { UserFitnessData, UserPreferences, Workout } from '../types/UserFitnessData';
import WorkoutPlan from '../db_schema/workPlan';
import User, {UserData} from '../models/userModel';
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

    // const newPlan = new WorkoutPlan({
    //   plan: plan,
    //   user_id: userId,
    //   lut: new Date(),
    // });
    // const savedPlan = await newPlan.save();
    const savedPlan = await WorkoutPlan.findOneAndUpdate(
        { user_id: userId }, // Find the existing plan by user ID
        {
          plan: plan,
          lut: new Date(),
        },
        {includeResultMetadata: true, lean: true, new: true, upsert: true } // Create a new plan if none exists (upsert), and return the updated document
    );

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
      const NUMBER_OF_EASY_WORKOUTS_FOR_REPLAN = 2;
      const NUMBER_OF_LATS_WORKOUTS_TO_CHECK_FOR_REPLAN = 3;
      let rePlan = 0;
      const feedbackWorkouts = plan?.plan.flatMap(week => week.days)?.filter(workout => workout.difficultyFeedback);
      if(feedbackWorkouts) {
        let hardWorkouts = 0;
        let easyWorkouts = 0;
        for(let i = feedbackWorkouts.length - 1; i >= 0 && i >= feedbackWorkouts.length - NUMBER_OF_LATS_WORKOUTS_TO_CHECK_FOR_REPLAN; i--) {
          if(feedbackWorkouts[i].difficultyFeedback === 4 || feedbackWorkouts[i].difficultyFeedback === 5)
            hardWorkouts++;
          else if(feedbackWorkouts[i].difficultyFeedback === 2 || feedbackWorkouts[i].difficultyFeedback === 1)
            easyWorkouts++;
        }
        if(hardWorkouts >= NUMBER_OF_HARD_WORKOUTS_FOR_REPLAN)
          rePlan = 1;
        else if(easyWorkouts >= NUMBER_OF_EASY_WORKOUTS_FOR_REPLAN)
          rePlan = -1;
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
      let dbUser = await User.findOne({ _id: req.user?._id });
      if(dbUser?.userPreferences) {
        let userPreferences = dbUser?.userPreferences;

        let prompt = `Help me readjust my running training plan. 
                      Here are my fitness data and prefrences: `;

        const addDetail = (label: string, detail: string | number | Date | undefined) => {
          if (detail) {
            prompt += `${label} - ${detail}. `;
          }
        };

        // Google Fit data
        addDetail('Gender', userPreferences.gender);
        if(req.body.userFitnessData.weight && req.body.userFitnessData.height) {
          addDetail('Weight', req.body.userFitnessData.weight);
          addDetail('Height', req.body.userFitnessData.height);
        }
        addDetail('Age', userPreferences.age);

        // Prefrences
        addDetail('My Goal is', userPreferences.userRunningGoal);
        addDetail('My Running level is', userPreferences.userRunningLevel);
        prompt += `The plan started on - ${userPreferences.startDate || new Date()}`;
        addDetail('The plan should end on', userPreferences.endDate);

        prompt += `The plan should specify what to do in each day until the race. `;
        prompt += `My current training plan, including my actual preformences is: `;

        let currentPlan = (await WorkoutPlan.findOne({ user_id: req.user?._id }))?.plan;
        prompt += JSON.stringify(currentPlan);

        if(req.body.rePlanValue > 0)
          prompt += `But the plan is to difficult for me.`;
        else
          prompt += `But the plan is to easy for me.`;

        const tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));

        prompt += ` Help me readjust my training plan so I can reach my goal. The new plan sould spacify the workouts needed each day starting on ` + tomorrow + ` until ` + userPreferences.endDate;
        
        const plan = (await geminiChat(prompt))?.plan;

        const workoutsPerDay = new Map<Date | string, Workout>;
        plan.forEach(week => {
          week.days.forEach(workout => {
            workoutsPerDay.set(workout.date, workout);
          });
        });

        const combinedPlan = currentPlan?.map((week) => ({
          week: week.week, days: week.days.map(day => (
             workoutsPerDay.has(day.date) ? workoutsPerDay.get(day.date) : day
          ))
        }));

        const newPlan = await WorkoutPlan.findOneAndUpdate({ user_id: req.user?._id }, { plan: combinedPlan }, { new: true });

        return res.json(newPlan);
      }
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

export const getUserData = async (req: AuthRequest, res: Response) => {
  console.log('fetching user data...');
  try {
    const response = await User.findById({ _id: req.user?._id }) as UserData;
    return res.json(response.userPreferences);
  } catch (error) {
    res.status(500).send(error);
  }
};

