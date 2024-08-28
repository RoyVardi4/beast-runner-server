import express from 'express';
// import logger from '../utils/logger';
import {generatePlan, getPlan, getUserData, getWorkout, setUserData, updatePlan} from '../handlers/plan';
import { deleteNotification, getNotifications, getNotificationsNumber } from '../handlers/notifications';
import authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

/* GET home page. */
router.get('/', (_, res) => res.send("Welcome to Beast Runner server!!!"));

router.post('/generatePlan', authMiddleware, generatePlan);

router.get('/getPlan', authMiddleware, getPlan); //todo need to get user id from the request via authentication

router.post('/updatePlan', authMiddleware, updatePlan); //todo need to get user id from the request via authentication

router.get('/getWorkout', authMiddleware, getWorkout)

router.get('/getNotifications', authMiddleware, getNotifications)

router.get('/deleteNotification', authMiddleware, deleteNotification)

router.get('/getNotificationsNumber', authMiddleware, getNotificationsNumber)

router.post('/setUserData', authMiddleware, setUserData)

router.get('/getUserData', authMiddleware, getUserData)

export default router;
