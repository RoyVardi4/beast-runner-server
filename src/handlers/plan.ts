import { Request, Response } from 'express';
import logger from '../utils/logger';
import { geminiChat } from '../utils/gemini';
import { UserFitnessData, Gender } from '../types/UserFitnessData';
import WorkPlan from '../db_schema/workPlan';
import WorkoutPlan from '../db_schema/workPlan';

export const generatePlan = async (req: Request, res: Response) => {
  logger.info('Gnerating plan...');

  console.log(req.body);

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

export const getPlan = async (_: Request, res: Response) => {
  try {
    return res.json(await WorkoutPlan.findOne({user_id: 'John'})); //todo insert here the real id
  } catch (error) {
    res.status(500).send(error);
  }
}

export const updatePlan = async (req: Request, res: Response) => {
  logger.info('Updating plan...');
  console.log(req.body);

  try {
    const plan = await WorkoutPlan.findOneAndUpdate({user_id: 'John'}, {plan: req.body.updatedPlan}, {new: true}); //todo insert here the real id
    return res.json(plan);
  } catch (error) {
    res.status(500).send(error);
  }

}