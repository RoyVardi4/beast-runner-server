import express from 'express';
// import logger from '../utils/logger';
import { generatePlan, getPlan, updatePlan } from '../handlers/plan';

const router = express.Router();

/* GET home page. */
router.get('/', (_, res) => res.send("Welcome to Beast Runner server!!!"));

router.post('/generatePlan', generatePlan);

router.get('/getPlan', getPlan); //todo need to get user id from the request via authentication

router.post('/updatePlan', updatePlan); //todo need to get user id from the request via authentication


export default router;
