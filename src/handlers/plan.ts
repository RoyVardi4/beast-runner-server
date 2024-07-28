import { Request, Response } from 'express';
import logger from '../utils/logger';
import { geminiChat } from '../utils/gemini';
import { UserFitnessData, Gender } from '../types/UserFitnessData';
import WorkPlan from '../db_schema/workPlan';

export const getPlan = async (_req: Request, res: Response) => {
  logger.info('Server is starting');

  const userFitnessData: UserFitnessData = {
    age: 24,
    gender: Gender.male,
    height: 180,
    weight: 72,
  };

  const prompt = `Help me make a running training plan. 
    my goal is to run 6 km in under 24 minutes in a race 3
    months from now. Im a ${userFitnessData.gender}, 
    beginner runner, my weight is ${userFitnessData.weight} kg, 
    and my height is ${userFitnessData.height} cm. 
    The plan should specify what to do in each day until the race.
    create a training plan that starts from ${new Date()}`;

  const plan = (await geminiChat(prompt))?.plan;
  try {
    const newPlan = new WorkPlan({
      plan: plan,
      user_id: 'Roy', // TODO: change to actual user
      lut: new Date()
    });
    const savedPlan = await newPlan.save();
    return res.json(savedPlan);
  } catch (error) {
    res.status(500).send(error);
  }
};