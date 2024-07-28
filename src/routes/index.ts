import express from 'express';
// import logger from '../utils/logger';
import { generatePlan } from '../handlers/plan';

const router = express.Router();

/* GET home page. */
router.get('/', (_, res) => res.send("Welcome to Beast Runner server!!!"));

router.post('/plan', generatePlan);

export default router;
