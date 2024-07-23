
import { MongoClient } from 'mongodb';
import logger from '../utils/logger';
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@beastrunner.gq6tmka.mongodb.net/?retryWrites=true&w=majority&appName=BeastRunner`;

interface TrainingPlan {
  days: {date: string; workout: string}[];
  week: number;
}

const client = new MongoClient(uri);

// TODO: pass user id
export const addTrainingPlan = async (plan: TrainingPlan) => {
  try {
      const planDocument = {
      lut: new Date(),
      plan,
      user_id: 'adi',
    }
    const database = client.db("beast_runner");
    const plans = database.collection("training_plans");
    const result = await plans.insertOne(planDocument);
    console.log(result)
    if (result?.acknowledged) logger.info('plan inserted successfully');
  } catch (error) {
    logger.info('Server is starting');
  }
};
