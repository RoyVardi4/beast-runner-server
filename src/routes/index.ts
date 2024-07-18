import express from 'express';
// import logger from '../utils/logger';
import { getPlan } from '../handlers/gemini';

const router = express.Router();

/* GET home page. */
router.get('/', (_, res) => res.send("Welcome to Beast Runner server!!!"));
router.get('/plan', getPlan);

export default router;
