import { Request, Response } from 'express';
import logger from '../utils/logger';
import { geminiChat } from '../utils/gemini';
import { UserFitnessData, UserPreferences } from '../types/UserFitnessData';
import WorkoutPlan from '../db_schema/workPlan';

interface PlanInput {
  userFitnessData: UserFitnessData;
  userPreferences: UserPreferences;
}

export const generatePlan = async (req: Request, res: Response) => {
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
  addDetail('Gender', userFitnessData.gender);
  addDetail('Weight', userFitnessData.weight);
  addDetail('Height', userFitnessData.height);
  addDetail('Age', userFitnessData.age);

  // Prefrences
  addDetail('My Goal is', userPreferences.userRunningGoal);
  addDetail('My Running level is', userPreferences.userRunningLevel);
  prompt += `The plan should start on - ${userPreferences.startDate || new Date()}`;
  addDetail('The plan should end on', userPreferences.endDate);

  prompt += `The plan should specify what to do in each day until the race.`;

  const plan = (await geminiChat(prompt))?.plan;
  try {
    const newPlan = new WorkoutPlan({
      plan: plan,
      user_id: 'Roy', // TODO: change to actual user
      lut: new Date(),
    });
    const savedPlan = await newPlan.save();
    return res.json(savedPlan);
  } catch (error) {
    return res.status(500).send(error);
  }
};

export const getPlan = async (_: Request, res: Response) => {
  try {
    return res.json(await WorkoutPlan.findOne({ user_id: 'Adi' })); //todo insert here the real id
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  logger.info('Updating plan...');
  console.log(req.body);

  try {
    const plan = await WorkoutPlan.findOneAndUpdate({ user_id: 'Adi' }, { plan: req.body.updatedPlan }, { new: true }); //todo insert here the real id
    return res.json(plan);
  } catch (error) {
    res.status(500).send(error);
  }
};
