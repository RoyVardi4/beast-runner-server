import express from 'express';
// import logger from '../utils/logger';
import { generatePlan, getPlan, getWorkout, updatePlan } from '../handlers/plan';
import { deleteNotification, getNotifications, getNotificationsNumber } from '../handlers/notifications';

const router = express.Router();

/* GET home page. */
router.get('/', (_, res) => res.send("Welcome to Beast Runner server!!!"));

router.post('/generatePlan', generatePlan);

router.get('/getPlan', getPlan); //todo need to get user id from the request via authentication

router.post('/updatePlan', updatePlan); //todo need to get user id from the request via authentication

router.get('/getWorkout', getWorkout) //todo need to get user id from the request via authentication

router.get('/getNotifications', getNotifications) //todo need to get user id from the request via authentication
 
router.get('/deleteNotification', deleteNotification) //todo need to get user id from the request via authentication

router.get('/getNotificationsNumber', getNotificationsNumber) //todo need to get user id from the request via authentication


export default router;
